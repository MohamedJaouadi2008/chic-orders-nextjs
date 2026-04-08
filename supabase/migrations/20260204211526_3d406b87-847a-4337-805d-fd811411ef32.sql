-- The set_order_short_id function queries the orders table but RLS might block it
-- Even though it's SECURITY DEFINER, let's ensure it has proper search_path
-- Also, we need to disable RLS check within the function by using a different approach

-- Actually, the issue is that the trigger function queries orders table
-- and RLS blocks that query for non-admin users.
-- Since it's SECURITY DEFINER, it should bypass RLS, but let's verify
-- by recreating with explicit security settings

CREATE OR REPLACE FUNCTION public.set_order_short_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_id text;
  attempts integer := 0;
BEGIN
  LOOP
    new_id := generate_short_id();
    -- Check if unique (SECURITY DEFINER bypasses RLS)
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE short_id = new_id) THEN
      NEW.short_id := new_id;
      EXIT;
    END IF;
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique short_id';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$function$;

-- Also recreate the other trigger functions with explicit schema references
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_current_stock INTEGER;
BEGIN
    -- Skip if no product_id
    IF NEW.product_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Lock row and check stock
    SELECT stock INTO v_current_stock
    FROM public.products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found: %', NEW.product_id;
    END IF;

    IF v_current_stock < 1 THEN
        RAISE EXCEPTION 'Insufficient stock for product: %', NEW.product_id;
    END IF;

    -- Decrement stock
    UPDATE public.products
    SET stock = stock - 1, updated_at = now()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_price_snapshot_on_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_product RECORD;
    v_price_info RECORD;
BEGIN
    -- Get product name
    SELECT name, price INTO v_product
    FROM public.products
    WHERE id = NEW.product_id;

    IF v_product IS NULL THEN
        RAISE EXCEPTION 'Product not found: %', NEW.product_id;
    END IF;

    -- Get calculated price
    SELECT original_price, discount_percent, final_price
    INTO v_price_info
    FROM public.calculate_product_final_price(NEW.product_id);

    -- Overwrite with DB-calculated values (frontend values ignored)
    NEW.product_name_snapshot := v_product.name;
    NEW.product_price_snapshot := v_price_info.original_price;
    NEW.discount_applied := COALESCE(v_price_info.discount_percent, 0);
    NEW.final_price := v_price_info.final_price;

    RETURN NEW;
END;
$function$;