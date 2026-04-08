import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schema - supports both single order and batch orders
const requestSchema = z.object({
  order_id: z.string().uuid("Invalid order ID format").optional(),
  order_ids: z.array(z.string().uuid("Invalid order ID format")).optional(),
}).refine(
  (data) => data.order_id || (data.order_ids && data.order_ids.length > 0),
  { message: "Either order_id or order_ids must be provided" }
);

interface OrderData {
  id: string;
  product_name_snapshot: string;
  size_selected: string;
  final_price: number;
  product_price_snapshot: number;
  discount_applied: number;
  client_name: string;
  client_phone: string;
  client_city: string;
  client_address: string;
  notes?: string;
  created_at: string;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  try {
    console.log("Sending Telegram message to chat:", chatId);
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();
    console.log("Telegram API response:", result.ok ? "success" : result.description);
    return result.ok;
  } catch (error) {
    console.error("Telegram send error:", error);
    return false;
  }
}

// Group orders by product+size and calculate quantities
interface GroupedProduct {
  name: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount: number;
}

function groupOrders(orders: OrderData[]): GroupedProduct[] {
  const grouped: Map<string, GroupedProduct> = new Map();

  for (const order of orders) {
    const key = `${order.product_name_snapshot}-${order.size_selected}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += 1;
      existing.total_price += order.final_price;
    } else {
      grouped.set(key, {
        name: order.product_name_snapshot,
        size: order.size_selected,
        quantity: 1,
        unit_price: order.final_price,
        total_price: order.final_price,
        discount: order.discount_applied,
      });
    }
  }

  return Array.from(grouped.values());
}

function formatBatchOrderMessage(orders: OrderData[]): string {
  const groupedProducts = groupOrders(orders);
  const firstOrder = orders[0];
  const totalPrice = orders.reduce((sum, o) => sum + o.final_price, 0);

  let message = `🛒 <b>Nouvelle Commande!</b>\n\n`;

  groupedProducts.forEach((product, index) => {
    const priceDisplay =
      product.discount > 0
        ? `${product.total_price.toFixed(2)} TND`
        : `${product.total_price.toFixed(2)} TND`;

    message += `📦 <b>Produit ${index + 1}:</b> ${product.name}\n`;
    message += `📏 <b>Taille:</b> ${product.size}\n`;
    message += `🔢 <b>Quantité:</b> ${product.quantity}\n`;
    message += `💰 <b>Prix:</b> ${priceDisplay}\n\n`;
  });

  message += `💵 <b>Total: ${totalPrice.toFixed(2)} TND</b>\n\n`;
  message += `👤 <b>Client:</b> ${firstOrder.client_name}\n`;
  message += `📱 <b>Tél:</b> ${firstOrder.client_phone}\n`;
  message += `🏙️ <b>Ville:</b> ${firstOrder.client_city}\n`;
  message += `📍 <b>Adresse:</b> ${firstOrder.client_address}\n`;

  if (firstOrder.notes) {
    message += `\n📝 <b>Notes:</b> ${firstOrder.notes}`;
  }

  message += `\n\n⏰ ${new Date().toLocaleString("fr-TN", { timeZone: "Africa/Tunis" })}`;

  return message;
}

function formatSingleOrderMessage(order: OrderData): string {
  const priceDisplay =
    order.discount_applied > 0
      ? `${order.final_price.toFixed(2)} TND <s>${order.product_price_snapshot.toFixed(2)} TND</s> (-${order.discount_applied}%)`
      : `${order.final_price.toFixed(2)} TND`;

  let message = `🛒 <b>Nouvelle Commande!</b>\n\n`;
  message += `📦 <b>Produit:</b> ${order.product_name_snapshot}\n`;
  message += `📏 <b>Taille:</b> ${order.size_selected}\n`;
  message += `🔢 <b>Quantité:</b> 1\n`;
  message += `💰 <b>Prix:</b> ${priceDisplay}\n\n`;
  message += `👤 <b>Client:</b> ${order.client_name}\n`;
  message += `📱 <b>Tél:</b> ${order.client_phone}\n`;
  message += `🏙️ <b>Ville:</b> ${order.client_city}\n`;
  message += `📍 <b>Adresse:</b> ${order.client_address}\n`;

  if (order.notes) {
    message += `\n📝 <b>Notes:</b> ${order.notes}`;
  }

  message += `\n\n⏰ ${new Date().toLocaleString("fr-TN", { timeZone: "Africa/Tunis" })}`;

  return message;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse and validate request body with Zod
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(", ");
      console.error("Validation error:", errorMessage);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request: " + errorMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { order_id, order_ids } = parseResult.data;
    const orderIdsToFetch = order_ids || (order_id ? [order_id] : []);

    console.log("Processing notification for orders:", orderIdsToFetch);

    // Initialize Supabase client with service role to access orders
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the orders from database
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .in("id", orderIdsToFetch);

    if (orderError || !orders || orders.length === 0) {
      console.error("Orders not found:", orderIdsToFetch, orderError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Orders not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Validate orders were created recently (within last 5 minutes) to prevent replay attacks
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOrders = orders.filter((order) => {
      const orderCreatedAt = new Date(order.created_at);
      return orderCreatedAt >= fiveMinutesAgo;
    });

    if (recentOrders.length === 0) {
      console.warn("All orders too old for notification");
      return new Response(
        JSON.stringify({ success: false, error: "Order notification window expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch settings from database
    const { data: settings } = await supabase
      .from("settings")
      .select("telegram_bot_token, telegram_chat_id, notifications_enabled")
      .limit(1)
      .single();

    // Use database settings first, fallback to environment variables
    const telegramBotToken = settings?.telegram_bot_token || Deno.env.get("TELEGRAM_BOT_TOKEN");
    const telegramChatId = settings?.telegram_chat_id || Deno.env.get("TELEGRAM_CHAT_ID");
    const notificationsEnabled = settings?.notifications_enabled !== false;

    const results = {
      telegram: false,
      orders_processed: recentOrders.length,
    };

    // Send Telegram notification
    if (notificationsEnabled && telegramBotToken && telegramChatId) {
      const message = recentOrders.length > 1
        ? formatBatchOrderMessage(recentOrders as OrderData[])
        : formatSingleOrderMessage(recentOrders[0] as OrderData);
      
      results.telegram = await sendTelegramMessage(
        telegramBotToken,
        telegramChatId,
        message
      );
      console.log("Telegram notification result:", results.telegram);
    } else {
      console.log("Notifications disabled or missing credentials");
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Edge function error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
