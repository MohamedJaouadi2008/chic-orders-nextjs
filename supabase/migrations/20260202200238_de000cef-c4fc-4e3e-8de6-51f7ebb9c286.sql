-- Create admin stock log table for audit trail
CREATE TABLE public.admin_stock_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('manual', 'order', 'cancellation', 'bulk_update')),
    admin_user_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_stock_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write stock logs
CREATE POLICY "Admins can manage stock logs"
ON public.admin_stock_log
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_stock_log_product ON public.admin_stock_log(product_id);
CREATE INDEX idx_stock_log_created ON public.admin_stock_log(created_at DESC);

-- Create function to log stock changes
CREATE OR REPLACE FUNCTION public.log_stock_change(
    p_product_id UUID,
    p_previous_stock INTEGER,
    p_new_stock INTEGER,
    p_change_type TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_product_name TEXT;
    v_log_id UUID;
BEGIN
    -- Get product name
    SELECT name INTO v_product_name FROM products WHERE id = p_product_id;
    
    IF v_product_name IS NULL THEN
        v_product_name := 'Unknown Product';
    END IF;
    
    -- Insert log entry
    INSERT INTO admin_stock_log (
        product_id,
        product_name_snapshot,
        previous_stock,
        new_stock,
        change_amount,
        change_type,
        admin_user_id,
        notes
    ) VALUES (
        p_product_id,
        v_product_name,
        p_previous_stock,
        p_new_stock,
        p_new_stock - p_previous_stock,
        p_change_type,
        auth.uid(),
        p_notes
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Create function for bulk stock update with logging
CREATE OR REPLACE FUNCTION public.bulk_update_stock(
    p_product_ids UUID[],
    p_update_mode TEXT, -- 'set', 'increment', 'decrement'
    p_amount INTEGER
)
RETURNS TABLE(product_id UUID, previous_stock INTEGER, new_stock INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_product RECORD;
    v_new_stock INTEGER;
BEGIN
    FOR v_product IN 
        SELECT p.id, p.stock, p.name 
        FROM products p 
        WHERE p.id = ANY(p_product_ids)
        FOR UPDATE
    LOOP
        -- Calculate new stock based on mode
        CASE p_update_mode
            WHEN 'set' THEN
                v_new_stock := GREATEST(0, p_amount);
            WHEN 'increment' THEN
                v_new_stock := v_product.stock + p_amount;
            WHEN 'decrement' THEN
                v_new_stock := GREATEST(0, v_product.stock - p_amount);
            ELSE
                RAISE EXCEPTION 'Invalid update mode: %', p_update_mode;
        END CASE;
        
        -- Update the product stock
        UPDATE products SET stock = v_new_stock, updated_at = now() WHERE id = v_product.id;
        
        -- Log the change
        PERFORM log_stock_change(
            v_product.id,
            v_product.stock,
            v_new_stock,
            'bulk_update',
            format('Bulk update: mode=%s, amount=%s', p_update_mode, p_amount)
        );
        
        product_id := v_product.id;
        previous_stock := v_product.stock;
        new_stock := v_new_stock;
        RETURN NEXT;
    END LOOP;
END;
$$;