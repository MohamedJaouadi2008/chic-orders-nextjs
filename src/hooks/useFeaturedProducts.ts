"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithPrice } from "@/types/database";

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async (): Promise<ProductWithPrice[]> => {
      const { data, error } = await supabase
        .from("featured_products")
        .select(`
          *,
          product:products(
            *,
            category:categories(*)
          )
        `)
        .order("position", { ascending: true });

      if (error) throw error;

      // Filter out featured products where the product is inactive
      const activeFeatured = (data || []).filter(
        (fp) => fp.product && fp.product.is_active
      );

      // Get prices for all featured products
      const productsWithPrices = await Promise.all(
        activeFeatured.map(async (fp) => {
          const product = fp.product!;
          
          const { data: priceData } = await supabase
            .rpc("calculate_product_final_price", { p_product_id: product.id });

          const pricing = priceData?.[0] || {
            original_price: product.price,
            discount_percent: 0,
            final_price: product.price,
            sale_name: null,
          };

          return {
            ...product,
            size_options: product.size_options as string[],
            images: product.images as string[],
            season: product.season as 'summer' | 'winter' | 'all_season' | null,
            original_price: Number(pricing.original_price),
            discount_percent: pricing.discount_percent,
            final_price: Number(pricing.final_price),
            sale_name: pricing.sale_name,
          };
        })
      );

      return productsWithPrices;
    },
  });
}
