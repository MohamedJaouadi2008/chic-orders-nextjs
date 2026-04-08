-- Add product-level discount columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percent';

-- Add a comment for clarity
COMMENT ON COLUMN products.discount_value IS 'Discount value (percentage or fixed amount)';
COMMENT ON COLUMN products.discount_type IS 'Type of discount: percent or fixed';