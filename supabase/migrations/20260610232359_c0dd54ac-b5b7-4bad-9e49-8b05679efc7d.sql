
-- 1) Edit token per restaurant
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS edit_token text;

UPDATE public.restaurants
  SET edit_token = encode(gen_random_bytes(24), 'hex')
  WHERE edit_token IS NULL;

ALTER TABLE public.restaurants
  ALTER COLUMN edit_token SET NOT NULL,
  ALTER COLUMN edit_token SET DEFAULT encode(gen_random_bytes(24), 'hex');

CREATE UNIQUE INDEX IF NOT EXISTS restaurants_edit_token_idx
  ON public.restaurants (edit_token);

-- 2) Promo fields on products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS promo_price numeric,
  ADD COLUMN IF NOT EXISTS is_on_promo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS promo_label text;

-- 3) App settings (single-row) for admin password
CREATE TABLE IF NOT EXISTS public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  admin_password_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = 1)
);

GRANT SELECT, INSERT, UPDATE ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;
CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can upsert app settings" ON public.app_settings;
CREATE POLICY "Anyone can upsert app settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update app settings" ON public.app_settings;
CREATE POLICY "Anyone can update app settings"
  ON public.app_settings FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
