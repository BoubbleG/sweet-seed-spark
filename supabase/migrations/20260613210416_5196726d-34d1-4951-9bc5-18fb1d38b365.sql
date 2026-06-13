
-- ============================================================
-- 1) Lock down app_settings (admin password hash)
-- ============================================================

DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can update app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can upsert app settings" ON public.app_settings;

-- Allow first-time setup only (when no row exists yet)
CREATE POLICY "First-time admin setup only" ON public.app_settings
  FOR INSERT TO anon, authenticated
  WITH CHECK (id = 1 AND NOT EXISTS (SELECT 1 FROM public.app_settings WHERE id = 1));

-- Service role keeps full access (already default for service_role, but be explicit)
GRANT ALL ON public.app_settings TO service_role;
-- Revoke direct read of password hash from anon/authenticated; access via RPC
REVOKE SELECT ON public.app_settings FROM anon, authenticated;
GRANT INSERT ON public.app_settings TO anon, authenticated;

-- Secure functions to check / verify password without exposing the hash
CREATE OR REPLACE FUNCTION public.admin_password_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_settings
     WHERE id = 1 AND admin_password_hash IS NOT NULL
  );
$$;
GRANT EXECUTE ON FUNCTION public.admin_password_exists() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_admin_password(_password_hash text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_settings
     WHERE id = 1 AND admin_password_hash = _password_hash
  );
$$;
GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;

-- ============================================================
-- 2) Move edit_token out of public restaurants table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.restaurant_edit_tokens (
  restaurant_id uuid PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
  edit_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- No anon/authenticated grants — only accessed via SECURITY DEFINER RPCs
GRANT ALL ON public.restaurant_edit_tokens TO service_role;

ALTER TABLE public.restaurant_edit_tokens ENABLE ROW LEVEL SECURITY;

-- Migrate existing tokens
INSERT INTO public.restaurant_edit_tokens (restaurant_id, edit_token)
SELECT id, edit_token
  FROM public.restaurants
 WHERE edit_token IS NOT NULL
ON CONFLICT (restaurant_id) DO NOTHING;

-- Lookup by token (used by /editar/$token)
CREATE OR REPLACE FUNCTION public.find_restaurant_by_edit_token(_token text)
RETURNS SETOF public.restaurants
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.*
    FROM public.restaurants r
    JOIN public.restaurant_edit_tokens t ON t.restaurant_id = r.id
   WHERE t.edit_token = _token
   LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.find_restaurant_by_edit_token(text) TO anon, authenticated;

-- Rotate token (used by admin "regenerate link" button)
-- Gated by master admin password
CREATE OR REPLACE FUNCTION public.admin_rotate_edit_token(
  _password_hash text,
  _restaurant_id uuid,
  _new_token text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_password(_password_hash) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.restaurant_edit_tokens (restaurant_id, edit_token)
  VALUES (_restaurant_id, _new_token)
  ON CONFLICT (restaurant_id) DO UPDATE
    SET edit_token = EXCLUDED.edit_token,
        updated_at = now();
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_rotate_edit_token(text, uuid, text) TO anon, authenticated;

-- Create-token-on-new-restaurant helper (gated by admin password)
CREATE OR REPLACE FUNCTION public.admin_ensure_edit_token(
  _password_hash text,
  _restaurant_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing text;
  new_token text;
BEGIN
  IF NOT public.verify_admin_password(_password_hash) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT edit_token INTO existing
    FROM public.restaurant_edit_tokens
   WHERE restaurant_id = _restaurant_id;
  IF existing IS NOT NULL THEN
    RETURN existing;
  END IF;
  new_token := encode(gen_random_bytes(24), 'hex');
  INSERT INTO public.restaurant_edit_tokens (restaurant_id, edit_token)
  VALUES (_restaurant_id, new_token);
  RETURN new_token;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_ensure_edit_token(text, uuid) TO anon, authenticated;

-- Admin-only: list all edit tokens (gated by password)
CREATE OR REPLACE FUNCTION public.admin_list_edit_tokens(_password_hash text)
RETURNS TABLE(restaurant_id uuid, edit_token text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_password(_password_hash) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT t.restaurant_id, t.edit_token
      FROM public.restaurant_edit_tokens t;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_edit_tokens(text) TO anon, authenticated;

-- Finally drop the column from the public restaurants table
ALTER TABLE public.restaurants DROP COLUMN IF EXISTS edit_token;
