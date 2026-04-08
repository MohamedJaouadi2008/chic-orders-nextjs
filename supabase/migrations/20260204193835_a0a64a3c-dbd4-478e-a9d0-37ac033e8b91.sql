-- Drop the old status check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add updated status check constraint that includes 'en_route'
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['en_attente'::text, 'confirmee'::text, 'en_route'::text, 'livree'::text, 'annulee'::text]));