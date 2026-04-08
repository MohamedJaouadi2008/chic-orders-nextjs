"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClearOrdersResult {
  success: boolean;
  archived_count: number;
  message: string;
}

export function useClearOrdersLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds: string[]): Promise<ClearOrdersResult> => {
      const { data, error } = await supabase.functions.invoke("clear-orders-log", {
        body: { order_ids: orderIds },
      });

      if (error) {
        throw new Error(error.message || "Failed to clear orders log");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as ClearOrdersResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
