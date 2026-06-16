-- 1) Marca de demonstração
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- 2) Duplica os 4 cardápios modelo (restaurante + categorias + produtos)
DO $$
DECLARE
  src_slug text;
  new_slug text;
  src_id uuid;
  new_id uuid;
  cat_map jsonb;
  cat_old uuid;
  cat_new uuid;
  source_slugs text[] := ARRAY[
    'point-do-gordinho',
    'delicias-da-taty',
    'cardapio-saudavel',
    'empadas-da-eva'
  ];
BEGIN
  FOREACH src_slug IN ARRAY source_slugs LOOP
    new_slug := 'modelo-' || src_slug;

    -- pula se já existe
    IF EXISTS (SELECT 1 FROM public.restaurants WHERE slug = new_slug) THEN
      CONTINUE;
    END IF;

    SELECT id INTO src_id FROM public.restaurants WHERE slug = src_slug;
    IF src_id IS NULL THEN
      CONTINUE;
    END IF;

    new_id := gen_random_uuid();

    -- clona o restaurante
    INSERT INTO public.restaurants (
      id, slug, name, business_type, description, whatsapp, address, city,
      opening_hours, delivery_fee, min_order_for_free_delivery, average_delivery_time,
      instagram, status, primary_color, secondary_color, button_color, visual_style,
      font_family, border_radius, card_style, show_delivery_status, header_style,
      category_layout, product_card_layout, background_color, text_color, show_search,
      show_categories, custom_css, accepts_delivery, accepts_pickup, payment_methods,
      logo_url, banner_url, is_demo
    )
    SELECT
      new_id, new_slug, name || ' (Modelo)', business_type, description, whatsapp,
      address, city, opening_hours, delivery_fee, min_order_for_free_delivery,
      average_delivery_time, instagram, status, primary_color, secondary_color,
      button_color, visual_style, font_family, border_radius, card_style,
      show_delivery_status, header_style, category_layout, product_card_layout,
      background_color, text_color, show_search, show_categories, custom_css,
      accepts_delivery, accepts_pickup, payment_methods, logo_url, banner_url,
      true
    FROM public.restaurants WHERE id = src_id;

    -- clona categorias mantendo um mapa old->new
    cat_map := '{}'::jsonb;
    FOR cat_old IN SELECT id FROM public.categories WHERE restaurant_id = src_id LOOP
      cat_new := gen_random_uuid();
      cat_map := cat_map || jsonb_build_object(cat_old::text, cat_new::text);
      INSERT INTO public.categories (id, restaurant_id, name, icon, banner_url, display_order, status, is_active)
      SELECT cat_new, new_id, name, icon, banner_url, display_order, status, is_active
        FROM public.categories WHERE id = cat_old;
    END LOOP;

    -- clona produtos usando o mapa de categorias
    INSERT INTO public.products (
      id, restaurant_id, category_id, name, description, price, image_url,
      is_featured, is_best_seller, is_available, options, internal_notes,
      estimated_time, nutritional_info, variants, promo_price, is_on_promo,
      promo_label, has_sizes, price_p, price_m, price_g, sides_note
    )
    SELECT
      gen_random_uuid(), new_id,
      (cat_map->>p.category_id::text)::uuid,
      p.name, p.description, p.price, p.image_url, p.is_featured, p.is_best_seller,
      p.is_available, p.options, p.internal_notes, p.estimated_time, p.nutritional_info,
      p.variants, p.promo_price, p.is_on_promo, p.promo_label, p.has_sizes,
      p.price_p, p.price_m, p.price_g, p.sides_note
    FROM public.products p
    WHERE p.restaurant_id = src_id
      AND cat_map ? p.category_id::text;
  END LOOP;
END $$;