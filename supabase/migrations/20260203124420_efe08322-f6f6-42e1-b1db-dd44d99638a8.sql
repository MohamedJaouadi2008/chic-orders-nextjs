-- Drop existing restrictive policies on settings
DROP POLICY IF EXISTS "Admins can delete settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;

-- Recreate as PERMISSIVE policies (default behavior)
CREATE POLICY "Public can view settings" 
ON public.settings 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Admins can update settings" 
ON public.settings 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert settings" 
ON public.settings 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings" 
ON public.settings 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));