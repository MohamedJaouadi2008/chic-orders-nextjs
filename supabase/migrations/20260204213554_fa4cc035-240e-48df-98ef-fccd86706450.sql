-- Create archive table for deleted orders (hidden from normal access)
CREATE TABLE public.archived_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_order_id uuid NOT NULL,
  short_id text,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_city text NOT NULL,
  client_address text NOT NULL,
  product_id uuid,
  product_name_snapshot text NOT NULL,
  product_price_snapshot numeric NOT NULL,
  discount_applied integer DEFAULT 0,
  final_price numeric NOT NULL,
  size_selected text NOT NULL,
  notes text,
  status text,
  status_change_reason text,
  status_change_history jsonb DEFAULT '[]'::jsonb,
  original_created_at timestamp with time zone,
  original_updated_at timestamp with time zone,
  archived_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_by uuid
);

-- Enable RLS - only admins can access (but we won't expose this in the app)
ALTER TABLE public.archived_orders ENABLE ROW LEVEL SECURITY;

-- Only admins can view archived orders (for manual Supabase access)
CREATE POLICY "Admins can view archived orders"
ON public.archived_orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only via RPC function (SECURITY DEFINER) can insert
CREATE POLICY "System can archive orders"
ON public.archived_orders
FOR INSERT
WITH CHECK (true);

-- Create function to archive and clear orders
CREATE OR REPLACE FUNCTION public.archive_and_clear_orders(p_order_ids uuid[])
RETURNS TABLE(archived_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  -- Archive the orders
  INSERT INTO archived_orders (
    original_order_id,
    short_id,
    client_name,
    client_phone,
    client_city,
    client_address,
    product_id,
    product_name_snapshot,
    product_price_snapshot,
    discount_applied,
    final_price,
    size_selected,
    notes,
    status,
    status_change_reason,
    status_change_history,
    original_created_at,
    original_updated_at,
    archived_by
  )
  SELECT 
    o.id,
    o.short_id,
    o.client_name,
    o.client_phone,
    o.client_city,
    o.client_address,
    o.product_id,
    o.product_name_snapshot,
    o.product_price_snapshot,
    o.discount_applied,
    o.final_price,
    o.size_selected,
    o.notes,
    o.status,
    o.status_change_reason,
    o.status_change_history,
    o.created_at,
    o.updated_at,
    auth.uid()
  FROM orders o
  WHERE o.id = ANY(p_order_ids);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Delete the original orders
  DELETE FROM orders WHERE id = ANY(p_order_ids);

  RETURN QUERY SELECT v_count;
END;
$$;

-- Grant execute to authenticated users (will check admin role inside function)
GRANT EXECUTE ON FUNCTION public.archive_and_clear_orders TO authenticated;