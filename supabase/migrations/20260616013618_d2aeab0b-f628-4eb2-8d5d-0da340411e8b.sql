
-- Snapshots / histórico de versões
CREATE TABLE public.restaurant_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  label text NOT NULL,
  scope text NOT NULL DEFAULT 'full',
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX restaurant_snapshots_rest_created_idx
  ON public.restaurant_snapshots (restaurant_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_snapshots TO anon, authenticated;
GRANT ALL ON public.restaurant_snapshots TO service_role;

ALTER TABLE public.restaurant_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage snapshots" ON public.restaurant_snapshots
  FOR ALL USING (true) WITH CHECK (true);

-- Função de restauração (aplica snapshot em transação)
CREATE OR REPLACE FUNCTION public.restore_restaurant_snapshot(_snapshot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  snap jsonb;
  rest_id uuid;
  rest jsonb;
  cats jsonb;
  prods jsonb;
BEGIN
  SELECT snapshot, restaurant_id INTO snap, rest_id
    FROM public.restaurant_snapshots WHERE id = _snapshot_id;
  IF snap IS NULL THEN
    RAISE EXCEPTION 'Snapshot not found';
  END IF;

  rest := snap->'restaurant';
  cats := snap->'categories';
  prods := snap->'products';

  IF rest IS NOT NULL THEN
    UPDATE public.restaurants SET
      name = COALESCE(rest->>'name', name),
      logo_url = rest->>'logo_url',
      banner_url = rest->>'banner_url',
      business_type = COALESCE(rest->>'business_type', business_type),
      description = rest->>'description',
      whatsapp = COALESCE(rest->>'whatsapp', whatsapp),
      address = rest->>'address',
      city = rest->>'city',
      opening_hours = rest->>'opening_hours',
      delivery_fee = COALESCE((rest->>'delivery_fee')::numeric, delivery_fee),
      min_order_for_free_delivery = NULLIF(rest->>'min_order_for_free_delivery','')::numeric,
      average_delivery_time = rest->>'average_delivery_time',
      instagram = rest->>'instagram',
      status = COALESCE(rest->>'status', status),
      primary_color = COALESCE(rest->>'primary_color', primary_color),
      secondary_color = COALESCE(rest->>'secondary_color', secondary_color),
      button_color = COALESCE(rest->>'button_color', button_color),
      visual_style = COALESCE(rest->>'visual_style', visual_style),
      font_family = COALESCE(rest->>'font_family', font_family),
      border_radius = COALESCE(rest->>'border_radius', border_radius),
      card_style = COALESCE(rest->>'card_style', card_style),
      show_delivery_status = COALESCE((rest->>'show_delivery_status')::boolean, show_delivery_status),
      header_style = COALESCE(rest->>'header_style', header_style),
      category_layout = COALESCE(rest->>'category_layout', category_layout),
      product_card_layout = COALESCE(rest->>'product_card_layout', product_card_layout),
      background_color = COALESCE(rest->>'background_color', background_color),
      text_color = COALESCE(rest->>'text_color', text_color),
      show_search = COALESCE((rest->>'show_search')::boolean, show_search),
      show_categories = COALESCE((rest->>'show_categories')::boolean, show_categories),
      custom_css = rest->>'custom_css',
      accepts_delivery = COALESCE((rest->>'accepts_delivery')::boolean, accepts_delivery),
      accepts_pickup = COALESCE((rest->>'accepts_pickup')::boolean, accepts_pickup),
      payment_methods = COALESCE(rest->'payment_methods', payment_methods)
    WHERE id = rest_id;
  END IF;

  IF cats IS NOT NULL THEN
    DELETE FROM public.categories WHERE restaurant_id = rest_id;
    INSERT INTO public.categories (id, restaurant_id, name, icon, banner_url, display_order, status, is_active)
    SELECT
      (c->>'id')::uuid,
      rest_id,
      c->>'name',
      c->>'icon',
      c->>'banner_url',
      COALESCE((c->>'display_order')::int, 0),
      COALESCE(c->>'status','active'),
      COALESCE((c->>'is_active')::boolean, true)
    FROM jsonb_array_elements(cats) c;
  END IF;

  IF prods IS NOT NULL THEN
    DELETE FROM public.products WHERE restaurant_id = rest_id;
    INSERT INTO public.products (
      id, restaurant_id, category_id, name, description, price, image_url,
      is_featured, is_best_seller, is_available, options, internal_notes,
      estimated_time, nutritional_info, variants, promo_price, is_on_promo,
      promo_label, has_sizes, price_p, price_m, price_g, sides_note
    )
    SELECT
      (p->>'id')::uuid,
      rest_id,
      (p->>'category_id')::uuid,
      p->>'name',
      p->>'description',
      COALESCE((p->>'price')::numeric, 0),
      p->>'image_url',
      COALESCE((p->>'is_featured')::boolean, false),
      COALESCE((p->>'is_best_seller')::boolean, false),
      COALESCE((p->>'is_available')::boolean, true),
      COALESCE(p->'options', '[]'::jsonb),
      p->>'internal_notes',
      p->>'estimated_time',
      p->>'nutritional_info',
      COALESCE(p->'variants', '[]'::jsonb),
      NULLIF(p->>'promo_price','')::numeric,
      COALESCE((p->>'is_on_promo')::boolean, false),
      p->>'promo_label',
      COALESCE((p->>'has_sizes')::boolean, false),
      NULLIF(p->>'price_p','')::numeric,
      NULLIF(p->>'price_m','')::numeric,
      NULLIF(p->>'price_g','')::numeric,
      p->>'sides_note'
    FROM jsonb_array_elements(prods) p;
  END IF;

  -- Garante limite de 100 snapshots por restaurante
  DELETE FROM public.restaurant_snapshots
   WHERE restaurant_id = rest_id
     AND id IN (
       SELECT id FROM public.restaurant_snapshots
        WHERE restaurant_id = rest_id
        ORDER BY created_at DESC
        OFFSET 100
     );
END;
$$;

GRANT EXECUTE ON FUNCTION public.restore_restaurant_snapshot(uuid) TO anon, authenticated, service_role;

-- Perfis de clientes recorrentes
CREATE TABLE public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  phone text NOT NULL,
  name text,
  address text,
  neighborhood text,
  reference text,
  payment_method text,
  last_order_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, phone)
);
CREATE INDEX customer_profiles_rest_phone_idx
  ON public.customer_profiles (restaurant_id, phone);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_profiles TO anon, authenticated;
GRANT ALL ON public.customer_profiles TO service_role;

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage customer profiles" ON public.customer_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
