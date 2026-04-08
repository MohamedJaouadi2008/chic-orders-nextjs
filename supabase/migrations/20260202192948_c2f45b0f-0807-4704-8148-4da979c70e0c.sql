-- =============================================
-- PHASE 1.1: BACKEND WIRING FIXES
-- =============================================

-- 1️⃣ STOCK HANDLING: Decrement on INSERT
-- =============================================
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    -- Skip if no product_id
    IF NEW.product_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Lock row and check stock
    SELECT stock INTO v_current_stock
    FROM products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found: %', NEW.product_id;
    END IF;

    IF v_current_stock < 1 THEN
        RAISE EXCEPTION 'Insufficient stock for product: %', NEW.product_id;
    END IF;

    -- Decrement stock
    UPDATE products
    SET stock = stock - 1, updated_at = now()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_decrement_stock_on_order_insert
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION decrement_stock_on_order_insert();

-- 1️⃣ STOCK HANDLING: Restore on cancellation
-- =============================================
-- Function already exists, just attach trigger
CREATE TRIGGER trg_restore_stock_on_cancellation
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (NEW.status = 'annulee' AND OLD.status IS DISTINCT FROM 'annulee')
EXECUTE FUNCTION restore_stock_on_cancellation();

-- 2️⃣ PRICE SNAPSHOT ENFORCEMENT
-- =============================================
CREATE OR REPLACE FUNCTION public.enforce_price_snapshot_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_product RECORD;
    v_price_info RECORD;
BEGIN
    -- Get product name
    SELECT name, price INTO v_product
    FROM products
    WHERE id = NEW.product_id;

    IF v_product IS NULL THEN
        RAISE EXCEPTION 'Product not found: %', NEW.product_id;
    END IF;

    -- Get calculated price
    SELECT original_price, discount_percent, final_price
    INTO v_price_info
    FROM calculate_product_final_price(NEW.product_id);

    -- Overwrite with DB-calculated values (frontend values ignored)
    NEW.product_name_snapshot := v_product.name;
    NEW.product_price_snapshot := v_price_info.original_price;
    NEW.discount_applied := COALESCE(v_price_info.discount_percent, 0);
    NEW.final_price := v_price_info.final_price;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_price_snapshot
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION enforce_price_snapshot_on_order();

-- 3️⃣ UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER trg_update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4️⃣ FEATURED PRODUCTS UNIQUE POSITION
-- =============================================
ALTER TABLE featured_products
ADD CONSTRAINT featured_products_position_unique UNIQUE (position);