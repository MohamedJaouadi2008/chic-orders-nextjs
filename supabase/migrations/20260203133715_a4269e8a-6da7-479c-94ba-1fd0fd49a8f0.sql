-- Add season column to products table
ALTER TABLE public.products 
ADD COLUMN season TEXT CHECK (season IN ('summer', 'winter', 'all_season'));