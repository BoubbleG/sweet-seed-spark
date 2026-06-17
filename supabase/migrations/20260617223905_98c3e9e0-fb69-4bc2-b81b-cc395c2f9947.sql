
DROP FUNCTION IF EXISTS public.public_create_order(uuid, jsonb, jsonb, jsonb);

CREATE OR REPLACE FUNCTION public.public_create_order(
  _restaurant_id uuid,
  _customer jsonb,
  _totals jsonb,
  _items jsonb
) RETURNS TABLE(order_id uuid, order_no int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  new_num int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = _restaurant_id) THEN
    RAISE EXCEPTION 'Restaurante não encontrado';
  END IF;

  IF COALESCE(_customer->>'name','') = '' THEN
    RAISE EXCEPTION 'Nome do cliente é obrigatório';
  END IF;

  INSERT INTO public.orders (
    restaurant_id, customer_name, customer_phone, customer_address,
    customer_neighborhood, customer_reference, payment_method, change_for,
    notes, subtotal, delivery_fee, total, order_type, status
  ) VALUES (
    _restaurant_id,
    _customer->>'name',
    NULLIF(_customer->>'phone',''),
    NULLIF(_customer->>'address',''),
    NULLIF(_customer->>'neighborhood',''),
    NULLIF(_customer->>'reference',''),
    NULLIF(_customer->>'payment_method',''),
    NULLIF(_customer->>'change_for','')::numeric,
    NULLIF(_customer->>'notes',''),
    COALESCE((_totals->>'subtotal')::numeric, 0),
    COALESCE((_totals->>'delivery_fee')::numeric, 0),
    COALESCE((_totals->>'total')::numeric, 0),
    COALESCE(_customer->>'order_type','delivery'),
    'novo'
  )
  RETURNING orders.id, orders.order_number INTO new_id, new_num;

  IF _items IS NOT NULL AND jsonb_typeof(_items) = 'array' THEN
    INSERT INTO public.order_items (order_id, product_name, unit_price, quantity, notes, size)
    SELECT
      new_id,
      it->>'product_name',
      COALESCE((it->>'unit_price')::numeric, 0),
      COALESCE((it->>'quantity')::int, 1),
      NULLIF(it->>'notes',''),
      NULLIF(it->>'size','')
    FROM jsonb_array_elements(_items) AS it;
  END IF;

  order_id := new_id;
  order_no := new_num;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.public_create_order(uuid, jsonb, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_create_order(uuid, jsonb, jsonb, jsonb) TO anon, authenticated;
