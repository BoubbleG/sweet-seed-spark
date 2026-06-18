
CREATE INDEX IF NOT EXISTS idx_products_restaurant_available ON public.products (restaurant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_status_order ON public.categories (restaurant_id, status, display_order);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status_created ON public.orders (restaurant_id, status, created_at DESC);

CREATE OR REPLACE FUNCTION public.public_get_menu(_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.restaurants%ROWTYPE;
  result jsonb;
BEGIN
  SELECT * INTO r FROM public.restaurants WHERE slug = _slug LIMIT 1;
  IF r.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'restaurant', to_jsonb(r),
    'categories', COALESCE((
      SELECT jsonb_agg(to_jsonb(c.*) ORDER BY c.display_order)
        FROM public.categories c
       WHERE c.restaurant_id = r.id AND c.status = 'active'
    ), '[]'::jsonb),
    'products', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(p.*) || jsonb_build_object(
          'option_groups', COALESCE((
            SELECT jsonb_agg(
              to_jsonb(g.*) || jsonb_build_object(
                'options', COALESCE((
                  SELECT jsonb_agg(to_jsonb(o.*) ORDER BY o.display_order)
                    FROM public.product_options o
                   WHERE o.group_id = g.id AND o.is_available = true
                ), '[]'::jsonb)
              )
              ORDER BY g.display_order
            )
              FROM public.product_option_groups g
             WHERE g.product_id = p.id
          ), '[]'::jsonb)
        )
      )
        FROM public.products p
       WHERE p.restaurant_id = r.id AND p.is_available = true
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.public_get_menu(text) TO anon, authenticated, service_role;
