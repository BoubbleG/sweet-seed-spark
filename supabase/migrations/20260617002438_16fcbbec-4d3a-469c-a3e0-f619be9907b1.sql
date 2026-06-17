CREATE OR REPLACE FUNCTION public.extend_pin_session(_token text)
RETURNS timestamptz
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_expires timestamptz;
BEGIN
  IF _token IS NULL OR length(_token) = 0 THEN
    RETURN NULL;
  END IF;
  new_expires := now() + interval '30 days';
  UPDATE public.restaurant_pin_sessions
     SET expires_at = new_expires
   WHERE session_token = _token
     AND expires_at > now()
  RETURNING expires_at INTO new_expires;
  RETURN new_expires;
END;
$$;

GRANT EXECUTE ON FUNCTION public.extend_pin_session(text) TO anon, authenticated;