ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_sizes boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_p numeric,
  ADD COLUMN IF NOT EXISTS price_m numeric,
  ADD COLUMN IF NOT EXISTS price_g numeric,
  ADD COLUMN IF NOT EXISTS sides_note text;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS size text;