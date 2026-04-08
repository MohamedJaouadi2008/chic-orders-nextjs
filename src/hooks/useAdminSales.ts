"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Sale, Settings } from "@/types/database";

// Sales hooks
export function useAdminSales() {
  return useQuery({
    queryKey: ["admin-sales"],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        target_type: item.target_type as 'product' | 'category',
        target_ids: item.target_ids as string[],
        season: item.season as 'summer' | 'winter' | null,
      }));
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: {
      name: string;
      discount_percent: number;
      target_type: 'product' | 'category';
      target_ids: string[];
      is_active?: boolean;
      start_date?: string | null;
      end_date?: string | null;
      season?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("sales")
        .insert(sale)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products-with-prices"] });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      discount_percent?: number;
      target_type?: 'product' | 'category';
      target_ids?: string[];
      is_active?: boolean;
      start_date?: string | null;
      end_date?: string | null;
      season?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("sales")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products-with-prices"] });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sales")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products-with-prices"] });
    },
  });
}

// Featured products hooks
export function useAdminFeaturedProducts() {
  return useQuery({
    queryKey: ["admin-featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_products")
        .select(`
          *,
          product:products(*)
        `)
        .order("position", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useAddFeaturedProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product_id, position }: { product_id: string; position: number }) => {
      const { data, error } = await supabase
        .from("featured_products")
        .insert({ product_id, position })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
    },
  });
}

export function useUpdateFeaturedPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, position }: { id: string; position: number }) => {
      const { data, error } = await supabase
        .from("featured_products")
        .update({ position })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
    },
  });
}

export function useRemoveFeaturedProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("featured_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
    },
  });
}

// Settings hooks
export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: async (): Promise<Settings | null> => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      whatsapp_number?: string | null;
      telegram_username?: string | null;
      telegram_bot_token?: string | null;
      telegram_chat_id?: string | null;
      delivery_zones?: string | null;
      show_footer_credit?: boolean;
      notifications_enabled?: boolean;
      low_stock_threshold?: number;
    }) => {
      // Get the settings ID first
      const { data: existing, error: fetchError } = await supabase
        .from("settings")
        .select("id")
        .limit(1)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch settings: ${fetchError.message}`);
      }

      if (!existing) throw new Error("Settings not found");

      const { data, error } = await supabase
        .from("settings")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update settings: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
