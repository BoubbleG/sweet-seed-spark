-- 1) Column-level: hide pin_hash and counters from anon/authenticated clients.
-- SECURITY DEFINER RPCs (verify_restaurant_pin, find_restaurant_by_pin_session,
-- admin_*) keep working because they run as the function owner.
REVOKE SELECT (pin_hash, pin_failed_attempts, pin_locked_until)
  ON public.restaurants FROM anon, authenticated;

-- 2) Remove permissive INSERT policy on app_settings. Admin password
-- bootstrap must go exclusively through a SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "First-time admin setup only" ON public.app_settings;
REVOKE INSERT, UPDATE, DELETE ON public.app_settings FROM anon, authenticated;