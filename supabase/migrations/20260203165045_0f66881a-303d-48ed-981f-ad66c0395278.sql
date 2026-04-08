-- Fix the security definer view warning by using security_invoker
DROP VIEW IF EXISTS public.public_settings;

-- Create view with security_invoker=on which uses the caller's permissions
-- The underlying function is security definer which safely exposes only public data
CREATE VIEW public.public_settings 
WITH (security_invoker = on)
AS SELECT * FROM public.get_public_settings();

-- Grant SELECT on the view
GRANT SELECT ON public.public_settings TO anon, authenticated;