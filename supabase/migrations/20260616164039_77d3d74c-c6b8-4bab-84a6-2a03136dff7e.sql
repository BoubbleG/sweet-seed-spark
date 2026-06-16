
-- Helper unificado: aceita PIN session OU edit_token para o mesmo restaurante
CREATE OR REPLACE FUNCTION public.is_restaurant_session_valid(_token text, _restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _token IS NOT NULL AND length(_token) > 0
    AND (
      EXISTS (
        SELECT 1 FROM public.restaurant_pin_sessions
         WHERE session_token = _token
           AND restaurant_id = _restaurant_id
           AND expires_at > now()
      )
      OR EXISTS (
        SELECT 1 FROM public.restaurant_edit_tokens
         WHERE edit_token = _token
           AND restaurant_id = _restaurant_id
      )
    )
$$;

-- Atualiza funções para usar o helper unificado
CREATE OR REPLACE FUNCTION public.record_restaurant_snapshot(
  _session_token text, _restaurant_id uuid, _label text, _scope text, _snapshot jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF NOT public.is_restaurant_session_valid(_session_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.restaurant_snapshots (restaurant_id, label, scope, snapshot)
  VALUES (_restaurant_id, _label, COALESCE(_scope,'full'), _snapshot)
  RETURNING id INTO new_id;
  DELETE FROM public.restaurant_snapshots
   WHERE restaurant_id = _restaurant_id
     AND id NOT IN (
       SELECT id FROM public.restaurant_snapshots
        WHERE restaurant_id = _restaurant_id ORDER BY created_at DESC LIMIT 100
     );
  RETURN new_id;
END; $$;

CREATE OR REPLACE FUNCTION public.list_restaurant_snapshots(
  _session_token text, _restaurant_id uuid
) RETURNS TABLE(id uuid, restaurant_id uuid, label text, scope text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_restaurant_session_valid(_session_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT s.id, s.restaurant_id, s.label, s.scope, s.created_at
      FROM public.restaurant_snapshots s
     WHERE s.restaurant_id = _restaurant_id
     ORDER BY s.created_at DESC LIMIT 100;
END; $$;

CREATE OR REPLACE FUNCTION public.get_latest_restaurant_snapshot(
  _session_token text, _restaurant_id uuid
) RETURNS TABLE(id uuid, restaurant_id uuid, label text, scope text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_restaurant_session_valid(_session_token, _restaurant_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT s.id, s.restaurant_id, s.label, s.scope, s.created_at
      FROM public.restaurant_snapshots s
     WHERE s.restaurant_id = _restaurant_id
     ORDER BY s.created_at DESC LIMIT 1;
END; $$;

CREATE OR REPLACE FUNCTION public.restore_restaurant_snapshot_secure(
  _session_token text, _snapshot_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_rest uuid;
BEGIN
  SELECT restaurant_id INTO target_rest
    FROM public.restaurant_snapshots WHERE id = _snapshot_id;
  IF target_rest IS NULL THEN RAISE EXCEPTION 'Snapshot not found'; END IF;
  IF NOT public.is_restaurant_session_valid(_session_token, target_rest) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  PERFORM public.restore_restaurant_snapshot(_snapshot_id);
END; $$;

GRANT EXECUTE ON FUNCTION public.get_latest_restaurant_snapshot(text, uuid) TO anon, authenticated;
