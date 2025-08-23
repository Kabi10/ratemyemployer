-- Reviews extras migration
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
    CREATE TYPE review_status AS ENUM ('pending','approved','rejected');
  END IF;
END;
$$;

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS recommend boolean;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS status review_status NOT NULL DEFAULT 'approved';

CREATE INDEX IF NOT EXISTS idx_reviews_approved_company_id
  ON public.reviews(company_id)
  WHERE status = 'approved';

CREATE OR REPLACE VIEW public.company_rating_stats AS
SELECT 
  c.id AS company_id,
  c.name,
  c.industry,
  c.location,
  avg(COALESCE(r.rating,0))::numeric(10,4) AS avg_rating,
  count(r.*) AS review_count
FROM public.companies c
LEFT JOIN public.reviews r
  ON r.company_id = c.id AND (r.status IS NULL OR r.status = 'approved')
GROUP BY c.id, c.name, c.industry, c.location;
