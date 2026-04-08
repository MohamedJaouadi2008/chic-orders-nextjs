-- Fix the security definer view issue by setting security_invoker = true
-- This ensures the view uses the permissions of the querying user, not the creator
ALTER VIEW public.public_settings SET (security_invoker = true);