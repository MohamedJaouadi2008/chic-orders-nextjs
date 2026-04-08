
-- Phase 1.1: Add missing foreign key constraints

-- orders.product_id -> products.id (SET NULL on delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_product_id_fkey' AND table_name = 'orders'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
END $$;

-- admin_stock_log.product_id -> products.id (SET NULL on delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'admin_stock_log_product_id_fkey_real' AND table_name = 'admin_stock_log'
  ) THEN
    ALTER TABLE public.admin_stock_log
      ADD CONSTRAINT admin_stock_log_product_id_fkey_real
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
END $$;

-- user_roles.user_id -> auth.users(id) (CASCADE on delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey' AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Phase 1.2: Drop permissive public INSERT on orders
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;

-- Phase 1.3: Drop permissive system INSERT on archived_orders
DROP POLICY IF EXISTS "System can archive orders" ON public.archived_orders;
