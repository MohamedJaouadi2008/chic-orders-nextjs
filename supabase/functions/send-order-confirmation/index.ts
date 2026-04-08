import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderItem {
  product_name: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationRequest {
  email: string;
  client_name: string;
  client_city: string;
  client_address: string;
  short_id?: string;
  items: OrderItem[];
  total: number;
}

const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} TND`;
};

const generateOrderConfirmationHtml = (data: OrderConfirmationRequest): string => {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px; border-bottom:1px solid #eee; color:#333333;">
            ${item.product_name}
          </td>
          <td style="padding:12px; border-bottom:1px solid #eee; text-align:center; color:#333333;">
            ${item.size}
          </td>
          <td style="padding:12px; border-bottom:1px solid #eee; text-align:center; color:#333333;">
            ${item.quantity}
          </td>
          <td style="padding:12px; border-bottom:1px solid #eee; text-align:right; color:#333333;">
            ${formatPrice(item.price * item.quantity)}
          </td>
        </tr>`
    )
    .join("");

  const orderIdSection = data.short_id 
    ? `<div style="background-color:#f9f9f9; padding:16px; border-radius:4px; margin-bottom:24px; text-align:center;">
        <p style="margin:0; font-size:12px; color:#777777; text-transform:uppercase; letter-spacing:1px;">Numéro de commande</p>
        <p style="margin:8px 0 0 0; font-size:24px; font-weight:700; color:#d4af37; font-family:monospace;">#${data.short_id}</p>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Confirmation de Commande</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#000000; padding:24px; text-align:center;">
            <h1 style="margin:0; color:#d4af37; font-size:22px; letter-spacing:1px;">
              Confirmation de Commande
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px; color:#333333; font-size:15px; line-height:1.6;">
            <p style="margin-top:0;">
              Bonjour <strong>${data.client_name}</strong>,
            </p>
            <p>
              Merci pour votre commande ! Nous l'avons bien reçue et nous vous contacterons bientôt pour confirmer la livraison.
            </p>
            
            ${orderIdSection}
            
            <!-- Order Details Table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0; border:1px solid #eee; border-radius:4px;">
              <thead>
                <tr style="background-color:#f9f9f9;">
                  <th style="padding:12px; text-align:left; font-weight:600; color:#333333; border-bottom:2px solid #d4af37;">Produit</th>
                  <th style="padding:12px; text-align:center; font-weight:600; color:#333333; border-bottom:2px solid #d4af37;">Taille</th>
                  <th style="padding:12px; text-align:center; font-weight:600; color:#333333; border-bottom:2px solid #d4af37;">Qté</th>
                  <th style="padding:12px; text-align:right; font-weight:600; color:#333333; border-bottom:2px solid #d4af37;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background-color:#f9f9f9;">
                  <td colspan="3" style="padding:12px; font-weight:600; color:#333333;">Total</td>
                  <td style="padding:12px; text-align:right; font-weight:700; color:#d4af37; font-size:16px;">
                    ${formatPrice(data.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
            
            <!-- Delivery Info -->
            <div style="background-color:#f9f9f9; padding:16px; border-radius:4px; margin-top:24px;">
              <h3 style="margin:0 0 12px 0; color:#333333; font-size:14px;">Adresse de livraison</h3>
              <p style="margin:0; color:#555555;">
                📍 ${data.client_city}<br>
                ${data.client_address}
              </p>
            </div>
            
            <p style="margin-top:24px; margin-bottom:0;">
              À très bientôt,<br>
              <strong>L'équipe</strong>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f0f0f0; padding:20px; text-align:center; font-size:12px; color:#777777;">
            Vous recevez cet email suite à votre commande sur notre site.<br>
            Si vous avez des questions, n'hésitez pas à nous contacter.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const data: OrderConfirmationRequest = await req.json();

    if (!data.email) {
      throw new Error("Email is required");
    }

    if (!data.items || data.items.length === 0) {
      throw new Error("Order items are required");
    }

    console.log(`Sending order confirmation email to: ${data.email}${data.short_id ? ` (Order #${data.short_id})` : ''}`);

    // Configure Gmail SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Deno.env.get("GMAIL_USER"),
        pass: Deno.env.get("GMAIL_APP_PASSWORD"),
      },
    });

    // Build subject with order ID if available
    const subject = data.short_id 
      ? `Confirmation de commande #${data.short_id}`
      : "Confirmation de votre commande";

    // Send the email
    const info = await transporter.sendMail({
      from: `"MyLady" <${Deno.env.get("GMAIL_USER")}>`,
      to: data.email,
      subject: subject,
      html: generateOrderConfirmationHtml(data),
    });

    console.log("Order confirmation email sent successfully:", info.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending order confirmation email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
