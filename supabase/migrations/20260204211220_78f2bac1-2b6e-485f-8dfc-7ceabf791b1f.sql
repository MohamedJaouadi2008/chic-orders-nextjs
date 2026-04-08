-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Public can create orders with valid data" ON public.orders;

-- Recreate as PERMISSIVE (the default, but explicitly stated)
CREATE POLICY "Public can create orders with valid data" 
ON public.orders 
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (client_name IS NOT NULL) AND 
  (client_name <> ''::text) AND 
  (client_phone IS NOT NULL) AND 
  (client_phone <> ''::text) AND 
  (client_city IS NOT NULL) AND 
  (client_city <> ''::text) AND 
  (client_address IS NOT NULL) AND 
  (client_address <> ''::text) AND 
  (product_name_snapshot IS NOT NULL) AND 
  (size_selected IS NOT NULL) AND 
  (size_selected <> ''::text) AND 
  (final_price >= (0)::numeric)
);