-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables in public
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Make sure RLS is enabled and policies exist
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select restaurants" ON public.restaurants;
CREATE POLICY "Public select restaurants" ON public.restaurants FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select categories" ON public.categories;
CREATE POLICY "Public select categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select products" ON public.products;
CREATE POLICY "Public select products" ON public.products FOR SELECT USING (true);
