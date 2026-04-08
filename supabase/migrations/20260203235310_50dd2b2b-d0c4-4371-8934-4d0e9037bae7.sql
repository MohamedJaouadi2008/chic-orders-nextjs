-- Remove the public SELECT policy that exposes customer PII
DROP POLICY IF EXISTS "Public can view recent orders for confirmation" ON public.orders;

-- Instead, we don't need public SELECT at all - the confirmation is shown client-side
-- after a successful insert, and admin has full access via their role