CREATE OR REPLACE FUNCTION public.admin_create_pin_session(_password_hash text, _restaurant_id uuid)
RETURNS TABLE(session_token text, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_token text;
  new_expires timestamptz;
BEGIN
  IF NOT public.verify_admin_password(_password_hash) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  new_token := encode(gen_random_bytes(32), 'hex');
  new_expires := now() + interval '30 days';

  INSERT INTO public.restaurant_pin_sessions (restaurant_id, session_token, expires_at)
  VALUES (_restaurant_id, new_token, new_expires);

  RETURN QUERY SELECT new_token, new_expires;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_pin_session(text, uuid) TO anon, authenticated;