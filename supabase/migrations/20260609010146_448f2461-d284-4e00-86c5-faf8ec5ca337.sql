-- We can't use migrations for storage bucket creation, but we can setup policies if we assume they'll be created.
-- However, for this environment, I'll stick to updating table schemas if needed.
-- The existing tables already have logo_url, banner_url, and image_url.
-- Let's add more customization columns to restaurants table for better branding.

ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS border_radius TEXT DEFAULT '1rem',
ADD COLUMN IF NOT EXISTS card_style TEXT DEFAULT 'glass',
ADD COLUMN IF NOT EXISTS show_delivery_status BOOLEAN DEFAULT true;

-- Grant access to all existing tables (just in case)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.restaurants TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.categories TO anon;
