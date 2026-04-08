-- Fix public_settings view access
-- Since we're using security_invoker=on, we need to allow the base table to be read
-- But we only want to expose non-sensitive columns
-- Solution: Create a separate policy for the limited columns via function

-- First, drop the view and recreate without security_invoker 
-- since we want public to access only non-sensitive data
DROP VIEW IF EXISTS public.public_settings;

-- Create a security definer function to safely expose public settings
CREATE OR REPLACE FUNCTION public.get_public_settings()
RETURNS TABLE (
    whatsapp_number text,
    telegram_username text,
    delivery_zones text,
    show_footer_credit boolean,
    notifications_enabled boolean,
    low_stock_threshold integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        whatsapp_number,
        telegram_username,
        delivery_zones,
        show_footer_credit,
        notifications_enabled,
        low_stock_threshold
    FROM public.settings
    LIMIT 1;
$$;

-- Grant execute to everyone
GRANT EXECUTE ON FUNCTION public.get_public_settings() TO anon, authenticated;

-- Recreate view using the secure function (no direct table access)
CREATE VIEW public.public_settings AS
SELECT * FROM public.get_public_settings();

-- Grant SELECT on the view
GRANT SELECT ON public.public_settings TO anon, authenticated;