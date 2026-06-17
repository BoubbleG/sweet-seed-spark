
-- 1) Lock down orders & order_items: remove public read/update, keep public insert (customer checkout).
DROP POLICY IF EXISTS "public can read orders" ON public.orders;
DROP POLICY IF EXISTS "public can update orders" ON public.orders;
DROP POLICY IF EXISTS "public can read order_items" ON public.order_items;
DROP POLICY IF EXISTS "public can update order_items" ON public.order_items;

-- 2) Owner-only RPCs gated by PIN session token. SECURITY DEFINER + explicit
--    token check via is_restaurant_session_valid.

CREATE OR REPLACE FUNCTION public.owner_list_orders(_token text, _restaurant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_restaurant_session_valid(_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_jsonb(o.*) || jsonb_build_object('items', items)), '[]'::jsonb)
  INTO result
  FROM (
    SELECT o.*,
      COALESCE((
        SELECT jsonb_agg(row_to_jsonb(oi.*))
        FROM public.order_items oi
        WHERE oi.order_id = o.id
      ), '[]'::jsonb) AS items
    FROM public.orders o
    WHERE o.restaurant_id = _restaurant_id
    ORDER BY o.created_at DESC
    LIMIT 200
  ) o;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.owner_update_order_status(
  _token text, _restaurant_id uuid, _order_id uuid, _status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_restaurant_session_valid(_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF _status NOT IN ('novo','preparando','pronto','entregue','cancelado') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.orders
     SET status = _status, updated_at = now()
   WHERE id = _order_id AND restaurant_id = _restaurant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.owner_mark_order_printed(
  _token text, _restaurant_id uuid, _order_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_restaurant_session_valid(_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  UPDATE public.orders
     SET printed_at = now(), updated_at = now()
   WHERE id = _order_id AND restaurant_id = _restaurant_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.owner_list_orders(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_update_order_status(text, uuid, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_mark_order_printed(text, uuid, uuid) TO anon, authenticated;

-- 3) Remove orders & order_items from realtime publication so changes aren't
--    broadcast to all subscribers. Owner panel will poll instead.
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;
ALTER PUBLICATION supabase_realtime DROP TABLE public.order_items;

-- 4) Restaurant PIN fields: revoke column-level SELECT from anon/authenticated
--    so they cannot be read via the public Data API.
REVOKE SELECT (pin_hash, pin_failed_attempts, pin_locked_until)
  ON public.restaurants FROM anon, authenticated, PUBLIC;

-- Helper RPC so the client can know if a slug needs a PIN without reading the hash.
CREATE OR REPLACE FUNCTION public.restaurant_pin_required(_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT pin_hash IS NOT NULL FROM public.restaurants WHERE slug = _slug LIMIT 1
  ), false);
$$;

GRANT EXECUTE ON FUNCTION public.restaurant_pin_required(text) TO anon, authenticated;
