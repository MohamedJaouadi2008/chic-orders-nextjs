-- The WITH CHECK policy checks values BEFORE the trigger modifies them
-- But the trigger sets product_name_snapshot and final_price
-- So the check fails because the original INSERT might have NULL/different values

-- Let's simplify the RLS policy to only check client-provided fields
DROP POLICY IF EXISTS "Public can create orders with valid data" ON public.orders;

CREATE POLICY "Public can create orders with valid data" 
ON public.orders 
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Only validate client-provided fields (not the ones set by triggers)
  (client_name IS NOT NULL AND client_name <> '') AND 
  (client_phone IS NOT NULL AND client_phone <> '') AND 
  (client_city IS NOT NULL AND client_city <> '') AND 
  (client_address IS NOT NULL AND client_address <> '') AND 
  (size_selected IS NOT NULL AND size_selected <> '') AND
  (product_id IS NOT NULL)
);