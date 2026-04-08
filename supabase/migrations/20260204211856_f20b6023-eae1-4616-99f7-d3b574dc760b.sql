-- The issue is the admin ALL policy doesn't have a WITH CHECK clause
-- For authenticated non-admin users, the INSERT policy should work alone
-- But the admin ALL policy might be interfering

-- Let's split the admin policy into specific commands
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;

-- Admin SELECT policy
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin UPDATE policy  
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin DELETE policy
CREATE POLICY "Admins can delete orders" 
ON public.orders 
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin INSERT policy (admins can also insert)
CREATE POLICY "Admins can insert orders" 
ON public.orders 
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));