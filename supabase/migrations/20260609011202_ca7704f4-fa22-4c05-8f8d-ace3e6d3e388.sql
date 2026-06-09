-- Ensure categories have status/active flag if not already fully utilized
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enhance products with more detail and variant support for rapid creation
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estimated_time TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS nutritional_info TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Grant permissions (standard procedure)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;