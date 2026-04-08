"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StockLogEntry {
  id: string;
  product_id: string | null;
  product_name_snapshot: string;
  previous_stock: number;
  new_stock: number;
  change_amount: number;
  change_type: string;
  admin_user_id: string | null;
  notes: string | null;
  created_at: string;
}

export function useStockLog(productId?: string) {
  return useQuery({
    queryKey: ["stock-log", productId],
    queryFn: async (): Promise<StockLogEntry[]> => {
      let query = supabase
        .from("admin_stock_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useBulkStockUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productIds,
      updateMode,
      amount,
    }: {
      productIds: string[];
      updateMode: "set" | "increment" | "decrement";
      amount: number;
    }) => {
      const { data, error } = await supabase.rpc("bulk_update_stock", {
        p_product_ids: productIds,
        p_update_mode: updateMode,
        p_amount: amount,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-log"] });
      toast.success(`Stock mis à jour pour ${data?.length || 0} produit(s)`);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du stock");
    },
  });
}

export function useManualStockUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      previousStock,
      newStock,
      notes,
    }: {
      productId: string;
      previousStock: number;
      newStock: number;
      notes?: string;
    }) => {
      // Update product stock
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Log the change
      const { error: logError } = await supabase.rpc("log_stock_change", {
        p_product_id: productId,
        p_previous_stock: previousStock,
        p_new_stock: newStock,
        p_change_type: "manual",
        p_notes: notes || null,
      });

      if (logError) {
        console.error("Failed to log stock change:", logError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-log"] });
    },
  });
}
