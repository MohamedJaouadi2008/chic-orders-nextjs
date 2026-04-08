"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductWithPrice, Category } from "@/types/database";

// Fetch all active products with their categories
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        stock: item.stock ?? 0,
        size_options: item.size_options as string[],
        images: item.images as string[],
        season: item.season as 'summer' | 'winter' | 'all_season' | null,
      }));
    },
  });
}

// Fetch a single product by slug
export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async (): Promise<ProductWithPrice | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      if (!data) return null;

      // Get calculated price with active sales
      const { data: priceData } = await supabase
        .rpc("calculate_product_final_price", { p_product_id: data.id });

      const pricing = priceData?.[0] || {
        original_price: data.price,
        discount_percent: 0,
        final_price: data.price,
        sale_name: null,
      };

      return {
        ...data,
        stock: data.stock ?? 0,
        size_options: data.size_options as string[],
        images: data.images as string[],
        season: data.season as 'summer' | 'winter' | 'all_season' | null,
        original_price: Number(pricing.original_price),
        discount_percent: pricing.discount_percent,
        final_price: Number(pricing.final_price),
        sale_name: pricing.sale_name,
      };
    },
    enabled: !!slug,
  });
}

// Fetch products with calculated prices (for listings)
export function useProductsWithPrices(categorySlug?: string) {
  return useQuery({
    queryKey: ["products-with-prices", categorySlug],
    queryFn: async (): Promise<ProductWithPrice[]> => {
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();

        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get prices for all products
      const productsWithPrices = await Promise.all(
        (data || []).map(async (product) => {
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
            stock: product.stock ?? 0,
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
