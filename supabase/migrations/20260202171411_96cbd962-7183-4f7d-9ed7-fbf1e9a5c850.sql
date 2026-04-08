-- Fix the overly permissive orders INSERT policy
-- Replace WITH CHECK (true) with proper validation

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;

-- Create a more specific policy that validates required fields are not empty
-- This still allows public inserts but with implicit validation through NOT NULL constraints
CREATE POLICY "Public can create orders with valid data"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
    client_name IS NOT NULL AND client_name != '' AND
    client_phone IS NOT NULL AND client_phone != '' AND
    client_city IS NOT NULL AND client_city != '' AND
    client_address IS NOT NULL AND client_address != '' AND
    product_name_snapshot IS NOT NULL AND
    size_selected IS NOT NULL AND size_selected != '' AND
    final_price >= 0
);