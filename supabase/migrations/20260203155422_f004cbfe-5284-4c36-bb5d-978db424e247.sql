-- =============================================================
-- PHASE 1: DATABASE SECURITY & INTEGRITY FIXES
-- =============================================================

-- 1.1 Create public_settings view (excludes sensitive data)
-- This protects telegram_bot_token, telegram_chat_id, whatsapp_api_token, whatsapp_phone_id
CREATE OR REPLACE VIEW public.public_settings AS
SELECT 
  id,
  whatsapp_number,
  telegram_username,
  delivery_zones,
  show_footer_credit,
  notifications_enabled,
  low_stock_threshold,
  created_at,
  updated_at
FROM public.settings;

-- Grant SELECT access to the view for public use
GRANT SELECT ON public.public_settings TO anon, authenticated;

-- 1.2 Fix orders RLS - limit public access to recent orders only (for confirmation screen)
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

CREATE POLICY "Public can view recent orders for confirmation"
ON public.orders FOR SELECT TO anon
USING (created_at > now() - interval '5 minutes');

-- 1.3 Remove duplicate triggers (keep trg_ prefixed ones for consistency)
DROP TRIGGER IF EXISTS restore_stock_on_order_cancellation ON public.orders;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;

-- 1.4 Add status change tracking columns to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS status_change_reason TEXT,
ADD COLUMN IF NOT EXISTS status_change_history JSONB DEFAULT '[]'::jsonb;

-- 1.5 Fix admin_stock_log RLS - change from RESTRICTIVE to PERMISSIVE
-- First drop the restrictive policy
DROP POLICY IF EXISTS "Admins can manage stock logs" ON public.admin_stock_log;

-- Create new PERMISSIVE policy for admin access
CREATE POLICY "Admins can manage stock logs"
ON public.admin_stock_log FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =============================================================
-- PHASE 2: BUSINESS LOGIC FIXES
-- =============================================================

-- 2.1 Update calculate_product_final_price to include product-level discounts
CREATE OR REPLACE FUNCTION public.calculate_product_final_price(p_product_id uuid)
RETURNS TABLE(original_price numeric, discount_percent integer, final_price numeric, sale_name text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_product RECORD;
    v_best_sale RECORD;
    v_today DATE := CURRENT_DATE;
    v_product_discount_percent INTEGER := 0;
    v_sale_discount_percent INTEGER := 0;
    v_final_discount_percent INTEGER := 0;
    v_final_sale_name TEXT := NULL;
BEGIN
    -- Get product info including discount fields
    SELECT p.price, p.category_id, p.discount_type, p.discount_value 
    INTO v_product
    FROM products p
    WHERE p.id = p_product_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate product-level discount percent
    IF v_product.discount_value IS NOT NULL AND v_product.discount_value > 0 THEN
        IF v_product.discount_type = 'percent' THEN
            v_product_discount_percent := LEAST(v_product.discount_value::INTEGER, 100);
        ELSIF v_product.discount_type = 'fixed' THEN
            -- Convert fixed amount to percentage
            IF v_product.price > 0 THEN
                v_product_discount_percent := LEAST(
                    ROUND((v_product.discount_value / v_product.price) * 100)::INTEGER, 
                    100
                );
            END IF;
        END IF;
    END IF;

    -- Find the best active sale (highest discount)
    SELECT s.discount_percent, s.name INTO v_best_sale
    FROM sales s
    WHERE s.is_active = true
      AND (s.start_date IS NULL OR s.start_date <= v_today)
      AND (s.end_date IS NULL OR s.end_date >= v_today)
      AND (
          (s.target_type = 'product' AND p_product_id = ANY(s.target_ids))
          OR 
          (s.target_type = 'category' AND v_product.category_id = ANY(s.target_ids))
      )
    ORDER BY s.discount_percent DESC
    LIMIT 1;

    IF v_best_sale IS NOT NULL THEN
        v_sale_discount_percent := v_best_sale.discount_percent;
    END IF;

    -- Use the higher discount (product-level or sale)
    IF v_product_discount_percent >= v_sale_discount_percent THEN
        v_final_discount_percent := v_product_discount_percent;
        IF v_product_discount_percent > 0 THEN
            v_final_sale_name := 'Promo produit';
        END IF;
    ELSE
        v_final_discount_percent := v_sale_discount_percent;
        v_final_sale_name := v_best_sale.name;
    END IF;

    -- Return calculated values
    original_price := v_product.price;
    discount_percent := v_final_discount_percent;
    
    IF v_final_discount_percent > 0 THEN
        final_price := v_product.price * (1 - v_final_discount_percent::DECIMAL / 100);
    ELSE
        final_price := v_product.price;
    END IF;
    
    sale_name := v_final_sale_name;

    RETURN NEXT;
END;
$$;