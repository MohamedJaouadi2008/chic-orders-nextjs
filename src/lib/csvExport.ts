import type { Order } from "@/types/database";

/**
 * Export orders to CSV format and trigger download
 */
export function exportOrdersToCSV(orders: Order[], filename = "commandes") {
  const headers = [
    "ID",
    "Date",
    "Client",
    "Téléphone",
    "Ville",
    "Adresse",
    "Produit",
    "Taille",
    "Prix Original",
    "Remise %",
    "Prix Final",
    "Statut",
    "Notes",
  ];

  const statusLabels: Record<string, string> = {
    en_attente: "En attente",
    confirmee: "Confirmée",
    livree: "Livrée",
    annulee: "Annulée",
  };

  const rows = orders.map((order) => [
    order.id,
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

  // Escape CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => escapeCSV(String(cell))).join(",")),
  ].join("\n");

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
