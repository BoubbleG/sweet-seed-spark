-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_number int NOT NULL DEFAULT 0,
  customer_name text NOT NULL,
  customer_phone text,
  customer_address text,
  customer_neighborhood text,
  customer_reference text,
  payment_method text,
  change_for numeric,
  notes text,
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  order_type text NOT NULL DEFAULT 'delivery',
  status text NOT NULL DEFAULT 'novo',
  printed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public can delete orders" ON public.orders FOR DELETE USING (true);

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  unit_price numeric NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon, authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "public can insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update order_items" ON public.order_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public can delete order_items" ON public.order_items FOR DELETE USING (true);

-- Sequential order number per restaurant
CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = 0 THEN
    SELECT COALESCE(MAX(order_number), 0) + 1
      INTO NEW.order_number
      FROM public.orders
      WHERE restaurant_id = NEW.restaurant_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.assign_order_number();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_orders_restaurant_created ON public.orders(restaurant_id, created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;