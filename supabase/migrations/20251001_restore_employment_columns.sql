-- Restore employment_status and is_current_employee columns
-- These were dropped in 20250910_simplify_mvp_schema.sql but are still
-- actively used by ReviewForm, ReviewCard, and EnhancedReviewListContainer.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS employment_status character varying(20),
  ADD COLUMN IF NOT EXISTS is_current_employee boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS reviews_employment_status_idx
  ON public.reviews(employment_status)
  WHERE employment_status IS NOT NULL;
