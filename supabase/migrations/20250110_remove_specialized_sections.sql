-- Remove specialized sections (financial distress, rising startups, wall of fame/shame)
-- This migration removes database structures that are not needed for MVP

-- Drop functions first (due to dependencies)
DROP FUNCTION IF EXISTS public.get_financial_distress_companies(integer);
DROP FUNCTION IF EXISTS public.get_rising_startup_companies(integer);
DROP FUNCTION IF EXISTS public.get_wall_companies(text, integer);
DROP FUNCTION IF EXISTS public.calculate_distress_score(bigint);
DROP FUNCTION IF EXISTS public.calculate_growth_score(bigint);

-- Drop tables
DROP TABLE IF EXISTS public.financial_distress_indicators;
DROP TABLE IF EXISTS public.rising_startup_indicators;
DROP TABLE IF EXISTS public.company_status_tracking;
DROP TABLE IF EXISTS public.company_metrics;

-- Update company_status_type enum to remove specialized statuses
-- Note: This requires careful handling in production to avoid breaking existing data
-- For MVP, we'll keep the enum but remove the specialized functionality

-- Remove any remaining indexes (they should be dropped with tables, but just in case)
DROP INDEX IF EXISTS financial_distress_indicators_company_id_idx;
DROP INDEX IF EXISTS financial_distress_indicators_type_idx;
DROP INDEX IF EXISTS financial_distress_indicators_detected_at_idx;
DROP INDEX IF EXISTS financial_distress_indicators_severity_idx;
DROP INDEX IF EXISTS rising_startup_indicators_company_id_idx;
DROP INDEX IF EXISTS rising_startup_indicators_type_idx;
DROP INDEX IF EXISTS rising_startup_indicators_detected_at_idx;
DROP INDEX IF EXISTS rising_startup_indicators_growth_score_idx;
DROP INDEX IF EXISTS company_status_tracking_company_id_idx;
DROP INDEX IF EXISTS company_status_tracking_last_updated_idx;
DROP INDEX IF EXISTS company_metrics_company_id_idx;

-- Add comment
COMMENT ON SCHEMA public IS 'Removed specialized sections for MVP simplification';