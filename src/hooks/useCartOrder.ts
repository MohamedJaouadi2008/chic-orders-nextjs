"use client";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface CustomerData {
  client_name: string;
  client_phone: string;
  client_city: string;
  client_address: string;
  client_email: string;
  notes: string;
}

interface CartOrderResult {
  success: boolean;
  orderIds: string[];
  shortIds: string[];
  whatsappUrl?: string;
}

interface OrderConfirmationEmailData {
  email: string;
  client_name: string;
  client_city: string;
  client_address: string;
  short_id: string;
  items: Array<{
    product_name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  try {
    const { error } = await supabase.functions.invoke("send-order-confirmation", {
      body: data,
    });
    if (error) console.error("Order confirmation email error:", error);
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
  }
}

function formatDateTime(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function useCartOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitCartOrder = async (
    items: CartItem[],
    customer: CustomerData
  ): Promise<CartOrderResult> => {
    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de commander.",
        variant: "destructive",
      });
      return { success: false, orderIds: [], shortIds: [] };
    }

    setIsSubmitting(true);
    const orderIds: string[] = [];
    const shortIds: string[] = [];

    try {
      // Create an order for each cart item using SECURITY DEFINER function
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const { data, error } = await supabase.rpc("create_order", {
            p_product_id: item.product.id,
            p_size_selected: item.size,
            p_client_name: customer.client_name,
            p_client_phone: customer.client_phone,
            p_client_city: customer.client_city,
            p_client_address: customer.client_address,
            p_notes: customer.notes || null,
          });

          if (error) {
            console.error("Order creation error:", error);
            throw new Error(`Failed to create order: ${error.message}`);
          }

          // RPC returns an array, get the first result
          const orderResult = Array.isArray(data) ? data[0] : data;
          
          if (orderResult) {
            orderIds.push(orderResult.id);
            shortIds.push(orderResult.short_id);
          }
        }
      }

      // Send batch notification to Telegram
      try {
        await supabase.functions.invoke("notify-order", {
          body: { order_ids: orderIds },
        });
      } catch (notifyError) {
        console.error("Notification error:", notifyError);
        // Don't fail the order if notification fails
      }

      // Send confirmation email if email provided
      if (customer.client_email?.trim()) {
        const emailItems = items.map(item => ({
          product_name: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.product.final_price,
        }));

        const total = items.reduce(
          (sum, item) => sum + item.product.final_price * item.quantity,
          0
        );

        // Use first short_id for the email reference
        sendOrderConfirmationEmail({
          email: customer.client_email.trim(),
          client_name: customer.client_name,
          client_city: customer.client_city,
          client_address: customer.client_address,
          short_id: shortIds[0] || "",
          items: emailItems,
          total,
        });
      }

      // Get WhatsApp number from public settings
      const { data: settings } = await supabase
        .from("public_settings")
        .select("whatsapp_number")
        .limit(1)
        .maybeSingle();

      const whatsappPhone = settings?.whatsapp_number || "+21628534675";

      // Generate WhatsApp URL with all products
      const whatsappUrl = generateWhatsAppUrl(items, customer, shortIds, whatsappPhone);

      toast({
        title: "Commande envoyée !",
        description: `${orderIds.length} article(s) commandé(s) avec succès.`,
      });

      return { success: true, orderIds, shortIds, whatsappUrl };
    } catch (error) {
      console.error("Cart order error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la commande. Veuillez réessayer.",
        variant: "destructive",
      });
      return { success: false, orderIds: [], shortIds: [] };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitCartOrder, isSubmitting };
}

function generateWhatsAppUrl(
  items: CartItem[], 
  customer: CustomerData, 
  shortIds: string[],
  whatsappPhone: string
): string {
  // Remove spaces AND + sign for wa.me format
  const cleanPhone = whatsappPhone.replace(/[\s+]/g, "");
  
  // Use first short_id as main reference, or combine if multiple
  const orderIdDisplay = shortIds.length === 1 
    ? shortIds[0] 
    : shortIds.slice(0, 3).join(", ") + (shortIds.length > 3 ? "..." : "");

  const productLines = items.map((item, index) => {
    const subtotal = item.product.final_price * item.quantity;
    let priceDisplay = `${subtotal.toFixed(2)} TND`;
    
    if (item.product.discount_percent > 0) {
      const originalTotal = item.product.original_price * item.quantity;
      priceDisplay = `${subtotal.toFixed(2)} TND ~~${originalTotal.toFixed(2)} TND~~ (-${item.product.discount_percent}%)`;
    }
    
    return `📦 Produit ${index + 1}: ${item.product.name}
📏 Taille: ${item.size}
🔢 Quantité: ${item.quantity}
💰 Prix: ${priceDisplay}`;
  });

  const total = items.reduce(
    (sum, item) => sum + item.product.final_price * item.quantity,
    0
  );

  const message = `🛒 *Nouvelle Commande*
ID: ${orderIdDisplay}

${productLines.join("\n\n")}

💵 *Total: ${total.toFixed(2)} TND*

👤 Client: ${customer.client_name}
📱 Tél: ${customer.client_phone}
🏙️ Ville: ${customer.client_city}
📍 Adresse: ${customer.client_address}${customer.notes ? `\n📝 Notes: ${customer.notes}` : ""}

⏰ ${formatDateTime()}`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
