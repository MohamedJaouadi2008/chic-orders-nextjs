-- =============================================
-- MISS BOUTIQUE - PHASE 1 DATABASE SCHEMA
-- Luxury Women's Intimate Apparel E-Commerce
-- =============================================

-- 1. Create app_role enum for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- 4. Categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 5. Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    size_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    images TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. Sales table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    target_type TEXT NOT NULL CHECK (target_type IN ('product', 'category')),
    target_ids UUID[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 7. Featured products table
CREATE TABLE public.featured_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.featured_products ENABLE ROW LEVEL SECURITY;

-- 8. Orders table with price snapshots
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_city TEXT NOT NULL,
    client_address TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    product_price_snapshot DECIMAL(10,2) NOT NULL,
    discount_applied INTEGER DEFAULT 0 CHECK (discount_applied >= 0 AND discount_applied <= 100),
    final_price DECIMAL(10,2) NOT NULL,
    size_selected TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'confirmee', 'livree', 'annulee')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 9. Settings table (singleton)
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_number TEXT,
    telegram_username TEXT,
    delivery_zones TEXT,
    show_footer_credit BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Insert default settings row
INSERT INTO public.settings (id, show_footer_credit) 
VALUES (gen_random_uuid(), true);

-- =============================================
-- RLS POLICIES
-- =============================================

-- user_roles policies
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Categories: Public read active, admin full access
CREATE POLICY "Public can view active categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Products: Public read active, admin full access
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Sales: Public read active, admin full access
CREATE POLICY "Public can view active sales"
ON public.sales
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage sales"
ON public.sales
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Featured products: Public read, admin manage
CREATE POLICY "Public can view featured products"
ON public.featured_products
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage featured products"
ON public.featured_products
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Orders: Public can insert, admin full access
CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage orders"
ON public.orders
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Settings: Public read, admin update
CREATE POLICY "Public can view settings"
ON public.settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to calculate product final price with active sales
CREATE OR REPLACE FUNCTION public.calculate_product_final_price(p_product_id UUID)
RETURNS TABLE (
    original_price DECIMAL(10,2),
    discount_percent INTEGER,
    final_price DECIMAL(10,2),
    sale_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_product RECORD;
    v_best_sale RECORD;
    v_today DATE := CURRENT_DATE;
BEGIN
    -- Get product info
    SELECT p.price, p.category_id INTO v_product
    FROM products p
    WHERE p.id = p_product_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Find the best active sale (highest discount)
    SELECT s.discount_percent, s.name INTO v_best_sale
    FROM sales s
    WHERE s.is_active = true
      AND (s.start_date IS NULL OR s.start_date <= v_today)
      AND (s.end_date IS NULL OR s.end_date >= v_today)
      AND (
          (s.target_type = 'product' AND p_product_id = ANY(s.target_ids))
          OR 
          (s.target_type = 'category' AND v_product.category_id = ANY(s.target_ids))
      )
    ORDER BY s.discount_percent DESC
    LIMIT 1;

    -- Return calculated values
    original_price := v_product.price;
    
    IF v_best_sale IS NOT NULL THEN
        discount_percent := v_best_sale.discount_percent;
        final_price := v_product.price * (1 - v_best_sale.discount_percent::DECIMAL / 100);
        sale_name := v_best_sale.name;
    ELSE
        discount_percent := 0;
        final_price := v_product.price;
        sale_name := NULL;
    END IF;

    RETURN NEXT;
END;
$$;

-- Function to atomically decrement stock
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    -- Lock the row for update to prevent race conditions
    SELECT stock INTO v_current_stock
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF v_current_stock >= p_quantity THEN
        UPDATE products
        SET stock = stock - p_quantity,
            updated_at = now()
        WHERE id = p_product_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;

-- Function to restore stock (for cancellations)
CREATE OR REPLACE FUNCTION public.restore_stock(p_product_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE products
    SET stock = stock + p_quantity,
        updated_at = now()
    WHERE id = p_product_id;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply updated_at trigger to orders
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply updated_at trigger to settings
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger function to restore stock on order cancellation
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancellation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If status changes TO 'annulee' from something else
    IF NEW.status = 'annulee' AND OLD.status != 'annulee' AND NEW.product_id IS NOT NULL THEN
        PERFORM public.restore_stock(NEW.product_id, 1);
    END IF;
    RETURN NEW;
END;
$$;

-- Apply stock restoration trigger to orders
CREATE TRIGGER restore_stock_on_order_cancellation
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.restore_stock_on_cancellation();

-- =============================================
-- STORAGE BUCKET
-- =============================================

-- Create product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies: public read, admin write
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' 
    AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND public.has_role(auth.uid(), 'admin')
);