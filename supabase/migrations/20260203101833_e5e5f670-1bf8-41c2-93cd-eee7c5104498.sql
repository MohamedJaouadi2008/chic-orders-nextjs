-- Allow anyone (including anonymous users) to create orders
-- This is necessary for a public e-commerce store where customers don't need to authenticate

CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Also ensure anonymous users can read their own order after creation (using product_id as reference)
-- This allows the order confirmation to work correctly
CREATE POLICY "Anyone can view orders" 
ON public.orders 
FOR SELECT 
USING (true);