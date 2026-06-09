-- Policies for private bucket access
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'menu-files');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-files');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'menu-files');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'menu-files');
