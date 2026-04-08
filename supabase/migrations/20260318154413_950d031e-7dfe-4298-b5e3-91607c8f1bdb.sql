-- Add season column to sales table
ALTER TABLE public.sales ADD COLUMN season text DEFAULT NULL;

-- Update calculate_product_final_price to check sale season validity
CREATE OR REPLACE FUNCTION public.calculate_product_final_price(p_product_id uuid)
 RETURNS TABLE(original_price numeric, discount_percent integer, final_price numeric, sale_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_product RECORD;
    v_best_sale RECORD;
    v_today DATE := CURRENT_DATE;
    v_current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
    v_product_discount_percent INTEGER := 0;
    v_sale_discount_percent INTEGER := 0;
    v_final_discount_percent INTEGER := 0;
    v_final_sale_name TEXT := NULL;
BEGIN
    SELECT p.price, p.category_id, p.discount_type, p.discount_value 
    INTO v_product
    FROM products p
    WHERE p.id = p_product_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    IF v_product.discount_value IS NOT NULL AND v_product.discount_value > 0 THEN
        IF v_product.discount_type = 'percent' THEN
            v_product_discount_percent := LEAST(v_product.discount_value::INTEGER, 100);
        ELSIF v_product.discount_type = 'fixed' THEN
            IF v_product.price > 0 THEN
                v_product_discount_percent := LEAST(
                    ROUND((v_product.discount_value / v_product.price) * 100)::INTEGER, 
                    100
                );
            END IF;
        END IF;
    END IF;

    -- Find the best active sale with season check
    -- summer = April-September, winter = October-March, NULL = always valid
    SELECT s.discount_percent, s.name INTO v_best_sale
    FROM sales s
    WHERE s.is_active = true
      AND (s.start_date IS NULL OR s.start_date <= v_today)
      AND (s.end_date IS NULL OR s.end_date >= v_today)
      AND (
          s.season IS NULL
          OR (s.season = 'summer' AND v_current_month BETWEEN 4 AND 9)
          OR (s.season = 'winter' AND (v_current_month >= 10 OR v_current_month <= 3))
      )
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

    IF v_product_discount_percent >= v_sale_discount_percent THEN
        v_final_discount_percent := v_product_discount_percent;
        IF v_product_discount_percent > 0 THEN
            v_final_sale_name := 'Promo produit';
        END IF;
    ELSE
        v_final_discount_percent := v_sale_discount_percent;
        v_final_sale_name := v_best_sale.name;
    END IF;

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
$function$;