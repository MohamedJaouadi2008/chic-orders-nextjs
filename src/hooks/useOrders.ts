"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderFormData, ProductWithPrice } from "@/types/database";

interface CreateOrderParams {
  product: ProductWithPrice;
  formData: OrderFormData;
}

interface CreateOrderResult {
  order: any;
  whatsappUrl: string;
  shortId: string;
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

function generateWhatsAppUrl(
  phone: string,
  order: {
    short_id: string;
    product_name: string;
    size: string;
    quantity: number;
    original_price: number;
    final_price: number;
    discount_percent: number;
    client_name: string;
    client_phone: string;
    client_city: string;
    client_address: string;
    notes?: string;
  }
): string {
  // Clean phone number - remove spaces AND the + sign for wa.me format
  const cleanPhone = phone.replace(/[\s+]/g, "");
  
  let message = `🛒 *Nouvelle Commande*\n`;
  message += `ID: ${order.short_id}\n\n`;
  message += `📦 Produit: ${order.product_name}\n`;
  message += `📏 Taille: ${order.size}\n`;
  message += `🔢 Quantité: ${order.quantity}\n`;
  
  if (order.discount_percent > 0) {
    message += `💰 Prix: ${order.final_price.toFixed(2)} TND ~~${order.original_price.toFixed(2)} TND~~ (-${order.discount_percent}%)\n\n`;
  } else {
    message += `💰 Prix: ${order.final_price.toFixed(2)} TND\n\n`;
  }
  
  message += `👤 Client: ${order.client_name}\n`;
  message += `📱 Tél: ${order.client_phone}\n`;
  message += `🏙️ Ville: ${order.client_city}\n`;
  message += `📍 Adresse: ${order.client_address}\n`;
  
  if (order.notes) {
    message += `📝 Notes: ${order.notes}\n`;
  }
  
  message += `\n⏰ ${formatDateTime()}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

async function sendOrderNotification(orderId: string) {
  try {
    const { error } = await supabase.functions.invoke("notify-order", {
      body: { order_id: orderId },
    });
    if (error) console.error("Notification error:", error);
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
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

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product, formData }: CreateOrderParams): Promise<CreateOrderResult> => {
      // Create the order via SECURITY DEFINER function (bypasses RLS issues)
      const { data, error } = await supabase.rpc("create_order", {
        p_product_id: product.id,
        p_size_selected: formData.size_selected,
        p_client_name: formData.client_name.trim(),
        p_client_phone: formData.client_phone.trim(),
        p_client_city: formData.client_city.trim(),
        p_client_address: formData.client_address.trim(),
        p_notes: formData.notes?.trim() || null,
      });

      if (error) {
        console.error("Order creation error:", error);
        throw new Error("Erreur lors de la création de la commande");
      }

      // RPC returns an array, get the first result
      const orderResult = Array.isArray(data) ? data[0] : data;
      
      if (!orderResult) {
        throw new Error("Erreur lors de la création de la commande");
      }

      const shortId = orderResult.short_id;

      // Send notification with order ID (fire and forget - don't block the order)
      sendOrderNotification(orderResult.id);

      // Send confirmation email if email provided
      if (formData.client_email?.trim()) {
        sendOrderConfirmationEmail({
          email: formData.client_email.trim(),
          client_name: formData.client_name.trim(),
          client_city: formData.client_city.trim(),
          client_address: formData.client_address.trim(),
          short_id: shortId,
          items: [{
            product_name: product.name,
            size: formData.size_selected,
            quantity: 1,
            price: product.final_price,
          }],
          total: product.final_price,
        });
      }

      // Get WhatsApp number from public settings view (excludes sensitive data)
      const { data: settings } = await supabase
        .from("public_settings")
        .select("whatsapp_number")
        .limit(1)
        .maybeSingle();

      const whatsappPhone = settings?.whatsapp_number || "+21628534675";
      
      const whatsappUrl = generateWhatsAppUrl(whatsappPhone, {
        short_id: shortId,
        product_name: product.name,
        size: formData.size_selected,
        quantity: 1,
        original_price: product.original_price,
        final_price: product.final_price,
        discount_percent: product.discount_percent,
        client_name: formData.client_name.trim(),
        client_phone: formData.client_phone.trim(),
        client_city: formData.client_city.trim(),
        client_address: formData.client_address.trim(),
        notes: formData.notes?.trim(),
      });

      return { order: orderResult, whatsappUrl, shortId };
    },
    onSuccess: () => {
      // Invalidate products to refresh stock
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-with-prices"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
    },
  });
}
