import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderForCSV {
  id: string;
  short_id: string | null;
  client_name: string;
  client_phone: string;
  client_city: string;
  client_address: string;
  product_name_snapshot: string;
  size_selected: string;
  product_price_snapshot: number;
  discount_applied: number;
  final_price: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  en_route: "En route",
  livree: "Livrée",
  annulee: "Annulée",
};

function generateCSV(orders: OrderForCSV[]): string {
  const headers = [
    "ID", "Date", "Client", "Téléphone", "Ville", "Adresse",
    "Produit", "Taille", "Prix Original", "Remise %", "Prix Final", "Statut", "Notes",
  ];

  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const rows = orders.map((order) => [
    order.short_id || order.id,
    new Date(order.created_at).toLocaleDateString("fr-FR"),
    order.client_name,
    order.client_phone,
    order.client_city,
    order.client_address,
    order.product_name_snapshot,
    order.size_selected,
    order.product_price_snapshot.toFixed(2),
    order.discount_applied.toString(),
    order.final_price.toFixed(2),
    statusLabels[order.status] || order.status,
    order.notes || "",
  ]);

  return [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => escapeCSV(String(cell))).join(",")),
  ].join("\n");
}

const handler = async (req: Request): Promise<Response> => {
  console.log("clear-orders-log function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailAppPassword) {
      throw new Error("Gmail credentials not configured");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      throw new Error("Only admins can clear the order log");
    }

    const { order_ids } = await req.json();
    
    if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
      throw new Error("No order IDs provided");
    }

    console.log(`Processing ${order_ids.length} orders for archival`);

    // Fetch orders before archiving (for CSV)
    const { data: ordersToArchive, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .in("id", order_ids);

    if (fetchError) {
      throw new Error(`Failed to fetch orders: ${fetchError.message}`);
    }

    if (!ordersToArchive || ordersToArchive.length === 0) {
      throw new Error("No orders found with provided IDs");
    }

    // Generate CSV
    const csvContent = generateCSV(ordersToArchive as OrderForCSV[]);
    const today = new Date().toLocaleDateString("fr-FR");

    // Archive orders
    const { data: archiveResult, error: archiveError } = await supabaseAdmin.rpc(
      "archive_and_clear_orders",
      { p_order_ids: order_ids }
    );

    if (archiveError) {
      throw new Error(`Failed to archive orders: ${archiveError.message}`);
    }

    const archivedCount = archiveResult?.[0]?.archived_count || order_ids.length;
    console.log(`Archived ${archivedCount} orders`);

    // Send email via nodemailer
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      await transporter.sendMail({
        from: `"MyLady" <${gmailUser}>`,
        to: gmailUser,
        subject: `MyLady - Log des commandes supprimées (${today})`,
        text: `Bonjour,\n\n${archivedCount} commande(s) ont été archivées et supprimées du journal des commandes.\n\nLe fichier CSV en pièce jointe contient les détails de toutes les commandes supprimées.\n\nDate: ${today}\nNombre de commandes: ${archivedCount}\n\nCes commandes sont conservées dans la table "archived_orders" de Supabase pour référence future.\n\nCordialement,\nMyLady Système`,
        attachments: [
          {
            filename: `commandes_archivees_${today.replace(/\//g, "-")}.csv`,
            content: "\uFEFF" + csvContent,
            contentType: "text/csv; charset=UTF-8",
          },
        ],
      });

      console.log("Archival email sent successfully via nodemailer");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Archival succeeded even if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        archived_count: archivedCount,
        message: `${archivedCount} commande(s) archivée(s) et email envoyé`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in clear-orders-log:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
