-- =====================================================
-- FIX CRITICAL SECURITY ISSUES
-- =====================================================

-- 1. Remove duplicate INSERT policy on orders (keep only the validated one)
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- 2. Secure settings table - change public SELECT to use the public_settings view only
-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;

-- The public_settings view already exists and excludes sensitive data
-- Ensure the view is accessible
GRANT SELECT ON public.public_settings TO anon, authenticated;

-- =====================================================
-- FIX MEDIUM ISSUES
-- =====================================================

-- 3. Fix admin_stock_log RLS - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage stock logs" ON public.admin_stock_log;

CREATE POLICY "Admins can manage stock logs"
ON public.admin_stock_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Also allow the log_stock_change function to insert (it runs as SECURITY DEFINER)
-- But we need to ensure the function can insert without RLS blocking it
-- The function already uses SECURITY DEFINER, so it should bypass RLS

-- 4. Create a function to validate order status transitions
CREATE OR REPLACE FUNCTION public.validate_order_status_transition(
    p_current_status TEXT,
    p_new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Define valid transitions
    -- en_attente -> confirmee, annulee
    -- confirmee -> en_route, annulee
    -- en_route -> livree, annulee
    -- livree -> annulee (with reason required)
    -- annulee -> (no transitions allowed)
    
    IF p_current_status = p_new_status THEN
        RETURN TRUE; -- No change
    END IF;
    
    CASE p_current_status
        WHEN 'en_attente' THEN
            RETURN p_new_status IN ('confirmee', 'annulee');
        WHEN 'confirmee' THEN
            RETURN p_new_status IN ('en_route', 'annulee');
        WHEN 'en_route' THEN
            RETURN p_new_status IN ('livree', 'annulee');
        WHEN 'livree' THEN
            RETURN p_new_status = 'annulee';
        WHEN 'annulee' THEN
            RETURN FALSE; -- Cannot transition from cancelled
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;