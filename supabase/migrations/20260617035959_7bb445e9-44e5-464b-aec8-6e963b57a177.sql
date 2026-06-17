
-- Modo de cobrança de cada grupo de opções
DO $$ BEGIN
  CREATE TYPE public.option_pricing_mode AS ENUM ('free', 'per_option', 'most_expensive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Grupos de opções
CREATE TABLE IF NOT EXISTS public.product_option_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_select integer NOT NULL DEFAULT 0,
  max_select integer NOT NULL DEFAULT 1,
  pricing_mode public.option_pricing_mode NOT NULL DEFAULT 'free',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_option_groups TO anon, authenticated;
GRANT ALL ON public.product_option_groups TO service_role;

ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product option groups"
  ON public.product_option_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can manage product option groups"
  ON public.product_option_groups FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS product_option_groups_product_id_idx
  ON public.product_option_groups(product_id, display_order);

CREATE TRIGGER product_option_groups_updated_at
  BEFORE UPDATE ON public.product_option_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Opções de cada grupo
CREATE TABLE IF NOT EXISTS public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  extra_price numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_options TO anon, authenticated;
GRANT ALL ON public.product_options TO service_role;

ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product options"
  ON public.product_options FOR SELECT USING (true);
CREATE POLICY "Anyone can manage product options"
  ON public.product_options FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS product_options_group_id_idx
  ON public.product_options(group_id, display_order);

CREATE TRIGGER product_options_updated_at
  BEFORE UPDATE ON public.product_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
