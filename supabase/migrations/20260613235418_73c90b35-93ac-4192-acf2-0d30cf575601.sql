ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS accepts_delivery boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accepts_pickup boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_methods jsonb NOT NULL DEFAULT '{"pix": true, "credit_card": true, "debit_card": true, "cash": true, "meal_voucher": false}'::jsonb;

UPDATE public.restaurants SET accepts_pickup = true WHERE slug = 'empadas-da-eva';