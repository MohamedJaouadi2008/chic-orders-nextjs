-- Add low stock threshold setting
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;