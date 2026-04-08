-- Fix 1: Add SELECT policy to prevent newsletter email harvesting
-- Only admins should be able to see subscriber emails
CREATE POLICY "Only admins can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Add missing SELECT policy for settings table (admins need to read settings)
CREATE POLICY "Admins can view settings"
ON public.settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 3: Recreate public_settings view with security_invoker=on
-- This ensures the view respects the base table's RLS policies
DROP VIEW IF EXISTS public.public_settings;

CREATE VIEW public.public_settings
WITH (security_invoker = on) AS
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

-- Grant SELECT on the view to allow public read (the view excludes sensitive tokens)
GRANT SELECT ON public.public_settings TO anon, authenticated;