-- Add short_id column
ALTER TABLE orders ADD COLUMN short_id text UNIQUE;

-- Create function to generate unique short ID
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..7 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Create trigger function to auto-generate short_id on insert
CREATE OR REPLACE FUNCTION public.set_order_short_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_id text;
  attempts integer := 0;
BEGIN
  LOOP
    new_id := generate_short_id();
    -- Check if unique
    IF NOT EXISTS (SELECT 1 FROM orders WHERE short_id = new_id) THEN
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
$$;

-- Create trigger to auto-generate short_id on insert
CREATE TRIGGER trigger_set_order_short_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_short_id();

-- Backfill existing orders with unique short_ids
DO $$
DECLARE
  order_rec RECORD;
  new_id text;
BEGIN
  FOR order_rec IN SELECT id FROM orders WHERE short_id IS NULL LOOP
    LOOP
      new_id := public.generate_short_id();
      IF NOT EXISTS (SELECT 1 FROM orders WHERE short_id = new_id) THEN
        UPDATE orders SET short_id = new_id WHERE id = order_rec.id;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END $$;