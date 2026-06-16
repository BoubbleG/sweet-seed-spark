
-- =========================================================
-- 1) Helper: validar sessão PIN do restaurante
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_pin_session_valid(_token text, _restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_pin_sessions
     WHERE session_token = _token
       AND restaurant_id = _restaurant_id
       AND expires_at > now()
  )
$$;

-- =========================================================
-- 2) customer_profiles: tranca acesso público
-- =========================================================
DROP POLICY IF EXISTS "Anyone can manage customer profiles" ON public.customer_profiles;

-- Sem políticas = ninguém acessa via Data API (RLS ativo bloqueia tudo)
REVOKE ALL ON public.customer_profiles FROM anon, authenticated;
GRANT ALL ON public.customer_profiles TO service_role;

-- RPCs públicas: autoatendimento do cliente final no checkout (sem token)
CREATE OR REPLACE FUNCTION public.find_customer_profile(_restaurant_id uuid, _phone text)
RETURNS TABLE(
  name text, phone text, address text, neighborhood text,
  reference text, payment_method text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT name, phone, address, neighborhood, reference, payment_method
    FROM public.customer_profiles
   WHERE restaurant_id = _restaurant_id
     AND phone = regexp_replace(_phone, '\D', '', 'g')
   LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.upsert_customer_profile(
  _restaurant_id uuid, _phone text, _name text, _address text,
  _neighborhood text, _reference text, _payment_method text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned_phone text;
BEGIN
  cleaned_phone := regexp_replace(coalesce(_phone,''), '\D', '', 'g');
  IF length(cleaned_phone) < 10 THEN
    RETURN;
  END IF;
  INSERT INTO public.customer_profiles (
    restaurant_id, phone, name, address, neighborhood, reference, payment_method, last_order_at
  ) VALUES (
    _restaurant_id, cleaned_phone,
    NULLIF(_name,''), NULLIF(_address,''), NULLIF(_neighborhood,''),
    NULLIF(_reference,''), NULLIF(_payment_method,''), now()
  )
  ON CONFLICT (restaurant_id, phone) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.customer_profiles.name),
    address = COALESCE(EXCLUDED.address, public.customer_profiles.address),
    neighborhood = COALESCE(EXCLUDED.neighborhood, public.customer_profiles.neighborhood),
    reference = COALESCE(EXCLUDED.reference, public.customer_profiles.reference),
    payment_method = COALESCE(EXCLUDED.payment_method, public.customer_profiles.payment_method),
    last_order_at = now(),
    updated_at = now();
END;
$$;

-- RPC para admin do restaurante (com PIN) apagar perfil de cliente
CREATE OR REPLACE FUNCTION public.delete_customer_profile(
  _session_token text, _restaurant_id uuid, _phone text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_pin_session_valid(_session_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM public.customer_profiles
   WHERE restaurant_id = _restaurant_id
     AND phone = regexp_replace(_phone, '\D', '', 'g');
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_customer_profile(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_customer_profile(uuid, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_customer_profile(text, uuid, text) TO anon, authenticated;

-- =========================================================
-- 3) restaurant_snapshots: tranca acesso público
-- =========================================================
DROP POLICY IF EXISTS "Anyone can manage snapshots" ON public.restaurant_snapshots;

REVOKE ALL ON public.restaurant_snapshots FROM anon, authenticated;
GRANT ALL ON public.restaurant_snapshots TO service_role;

CREATE OR REPLACE FUNCTION public.record_restaurant_snapshot(
  _session_token text,
  _restaurant_id uuid,
  _label text,
  _scope text,
  _snapshot jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF NOT public.is_pin_session_valid(_session_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.restaurant_snapshots (restaurant_id, label, scope, snapshot)
  VALUES (_restaurant_id, _label, COALESCE(_scope,'full'), _snapshot)
  RETURNING id INTO new_id;

  -- Mantém somente os 100 últimos
  DELETE FROM public.restaurant_snapshots
   WHERE restaurant_id = _restaurant_id
     AND id NOT IN (
       SELECT id FROM public.restaurant_snapshots
        WHERE restaurant_id = _restaurant_id
        ORDER BY created_at DESC
        LIMIT 100
     );
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_restaurant_snapshots(
  _session_token text, _restaurant_id uuid
) RETURNS TABLE(
  id uuid, restaurant_id uuid, label text, scope text, created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_pin_session_valid(_session_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT s.id, s.restaurant_id, s.label, s.scope, s.created_at
      FROM public.restaurant_snapshots s
     WHERE s.restaurant_id = _restaurant_id
     ORDER BY s.created_at DESC
     LIMIT 100;
END;
$$;

-- restore_restaurant_snapshot já existia. Reforçar exigindo PIN session do dono.
CREATE OR REPLACE FUNCTION public.restore_restaurant_snapshot_secure(
  _session_token text, _snapshot_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_rest uuid;
BEGIN
  SELECT restaurant_id INTO target_rest
    FROM public.restaurant_snapshots WHERE id = _snapshot_id;
  IF target_rest IS NULL THEN
    RAISE EXCEPTION 'Snapshot not found';
  END IF;
  IF NOT public.is_pin_session_valid(_session_token, target_rest) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  PERFORM public.restore_restaurant_snapshot(_snapshot_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_restaurant_snapshot(text, uuid, text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_restaurant_snapshots(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_restaurant_snapshot_secure(text, uuid) TO anon, authenticated;
-- A função antiga restore_restaurant_snapshot continua existindo para o painel master.

-- =========================================================
-- 4) orders / order_items: remove DELETE público
-- =========================================================
DROP POLICY IF EXISTS "public can delete orders" ON public.orders;
DROP POLICY IF EXISTS "public can delete order_items" ON public.order_items;

-- RPC para o admin do restaurante apagar um pedido (com sessão PIN)
CREATE OR REPLACE FUNCTION public.delete_restaurant_order(
  _session_token text, _order_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid uuid;
BEGIN
  SELECT restaurant_id INTO rid FROM public.orders WHERE id = _order_id;
  IF rid IS NULL THEN
    RETURN;
  END IF;
  IF NOT public.is_pin_session_valid(_session_token, rid) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM public.order_items WHERE order_id = _order_id;
  DELETE FROM public.orders WHERE id = _order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_restaurant_order(text, uuid) TO anon, authenticated;
