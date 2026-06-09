-- Drop existing policies that require authentication
DROP POLICY IF EXISTS "Authenticated users can manage restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Public restaurants are viewable by everyone" ON public.restaurants;

-- Create new policies for anonymous access
CREATE POLICY "Anyone can view active restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Anyone can manage restaurants" ON public.restaurants FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Ensure anon has grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;
