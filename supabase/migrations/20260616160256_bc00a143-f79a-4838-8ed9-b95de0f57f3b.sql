
-- Enable pgcrypto for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ 1. PIN columns on restaurants ============
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS pin_hash text,
  ADD COLUMN IF NOT EXISTS pin_failed_attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pin_locked_until timestamptz;

-- ============ 2. Restaurant PIN sessions ============
CREATE TABLE IF NOT EXISTS public.restaurant_pin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pin_sessions_token ON public.restaurant_pin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_pin_sessions_restaurant ON public.restaurant_pin_sessions(restaurant_id);

GRANT ALL ON public.restaurant_pin_sessions TO service_role;
-- No anon/authenticated grants: only accessed via SECURITY DEFINER functions below.

ALTER TABLE public.restaurant_pin_sessions ENABLE ROW LEVEL SECURITY;
-- No policies: locked down; only definer functions read/write it.

-- ============ 3. Role system (foundation for admin login) ============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ 4. PIN management functions ============

-- Admin sets/resets PIN (requires master password hash, like other admin RPCs)
CREATE OR REPLACE FUNCTION public.admin_set_restaurant_pin(
  _password_hash text,
  _restaurant_id uuid,
  _pin text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_password(_password_hash) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF _pin !~ '^[0-9]{4,8}$' THEN
    RAISE EXCEPTION 'PIN must be 4-8 digits';
  END IF;
  UPDATE public.restaurants
     SET pin_hash = crypt(_pin, gen_salt('bf', 10)),
         pin_failed_attempts = 0,
         pin_locked_until = NULL
   WHERE id = _restaurant_id;
END;
$$;

-- Admin clears PIN (back to open access — or rather, no access)
CREATE OR REPLACE FUNCTION public.admin_clear_restaurant_pin(
  _password_hash text,
  _restaurant_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_password(_password_hash) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.restaurants
     SET pin_hash = NULL, pin_failed_attempts = 0, pin_locked_until = NULL
   WHERE id = _restaurant_id;
  DELETE FROM public.restaurant_pin_sessions WHERE restaurant_id = _restaurant_id;
END;
$$;

-- Admin checks which restaurants have PIN configured (returns status only — never the PIN itself)
CREATE OR REPLACE FUNCTION public.admin_list_pin_status(_password_hash text)
RETURNS TABLE(restaurant_id uuid, has_pin boolean, is_locked boolean, locked_until timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_password(_password_hash) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT r.id, r.pin_hash IS NOT NULL,
           (r.pin_locked_until IS NOT NULL AND r.pin_locked_until > now()),
           r.pin_locked_until
      FROM public.restaurants r;
END;
$$;

-- Public PIN check (by slug). Returns session token on success.
-- Implements rate limit: 5 failed attempts -> 15 min lock.
CREATE OR REPLACE FUNCTION public.verify_restaurant_pin(_slug text, _pin text)
RETURNS TABLE(session_token text, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r_id uuid;
  r_hash text;
  r_attempts int;
  r_locked timestamptz;
  new_token text;
  new_expires timestamptz;
BEGIN
  SELECT id, pin_hash, pin_failed_attempts, pin_locked_until
    INTO r_id, r_hash, r_attempts, r_locked
    FROM public.restaurants
   WHERE slug = _slug;

  IF r_id IS NULL THEN
    RAISE EXCEPTION 'Restaurante não encontrado';
  END IF;
  IF r_hash IS NULL THEN
    RAISE EXCEPTION 'PIN não configurado. Peça ao administrador.';
  END IF;
  IF r_locked IS NOT NULL AND r_locked > now() THEN
    RAISE EXCEPTION 'Bloqueado por muitas tentativas. Tente novamente em alguns minutos.';
  END IF;

  IF crypt(_pin, r_hash) <> r_hash THEN
    UPDATE public.restaurants
       SET pin_failed_attempts = pin_failed_attempts + 1,
           pin_locked_until = CASE
             WHEN pin_failed_attempts + 1 >= 5 THEN now() + interval '15 minutes'
             ELSE pin_locked_until
           END
     WHERE id = r_id;
    RAISE EXCEPTION 'PIN incorreto';
  END IF;

  -- Success
  UPDATE public.restaurants
     SET pin_failed_attempts = 0, pin_locked_until = NULL
   WHERE id = r_id;

  new_token := encode(gen_random_bytes(32), 'hex');
  new_expires := now() + interval '30 days';
  INSERT INTO public.restaurant_pin_sessions (restaurant_id, session_token, expires_at)
  VALUES (r_id, new_token, new_expires);

  RETURN QUERY SELECT new_token, new_expires;
END;
$$;

-- Validates a session token and returns the restaurant if valid
CREATE OR REPLACE FUNCTION public.find_restaurant_by_pin_session(_token text)
RETURNS SETOF public.restaurants
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT r.*
      FROM public.restaurants r
      JOIN public.restaurant_pin_sessions s ON s.restaurant_id = r.id
     WHERE s.session_token = _token
       AND s.expires_at > now()
     LIMIT 1;
END;
$$;

-- Public can call these definer functions
GRANT EXECUTE ON FUNCTION public.verify_restaurant_pin(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_restaurant_by_pin_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_restaurant_pin(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_clear_restaurant_pin(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_pin_status(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

-- Cleanup expired sessions (best-effort; called opportunistically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_pin_sessions()
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  DELETE FROM public.restaurant_pin_sessions WHERE expires_at < now();
$$;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_pin_sessions() TO anon, authenticated;
