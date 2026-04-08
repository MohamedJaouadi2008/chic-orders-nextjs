"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Public settings type (excludes sensitive data)
export interface PublicSettings {
  id: string;
  whatsapp_number: string | null;
  telegram_username: string | null;
  delivery_zones: string | null;
  show_footer_credit: boolean;
  notifications_enabled: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<PublicSettings | null> => {
      // Query the public_settings view which excludes sensitive data
      const { data, error } = await supabase
        .from("public_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return {
        ...data,
        low_stock_threshold: data.low_stock_threshold ?? 10,
      } as PublicSettings;
    },
  });
}
