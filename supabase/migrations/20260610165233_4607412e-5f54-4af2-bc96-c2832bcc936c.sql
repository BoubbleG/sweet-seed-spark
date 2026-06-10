CREATE POLICY "Public read restaurant-assets" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'restaurant-assets');
CREATE POLICY "Public insert restaurant-assets" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'restaurant-assets');
CREATE POLICY "Public update restaurant-assets" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'restaurant-assets');
CREATE POLICY "Public delete restaurant-assets" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'restaurant-assets');