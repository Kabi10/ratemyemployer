-- MVP Database Schema Simplification
-- This migration removes non-MVP tables and simplifies core tables for MVP functionality
-- Focus: Keep only essential features for employer review platform

-- ============================================================================
-- STEP 1: Remove Non-MVP Tables and Infrastructure
-- ============================================================================

-- Drop web scraping infrastructure (not needed for MVP)
DROP TABLE IF EXISTS public.scraped_items CASCADE;
DROP TABLE IF EXISTS public.scraping_jobs CASCADE;
DROP TABLE IF EXISTS public.scraping_logs CASCADE;
DROP TABLE IF EXISTS public.scraped_data CASCADE;
DROP TABLE IF EXISTS public.company_data_enhancements CASCADE;
DROP TABLE IF EXISTS public.scraping_rate_limits CASCADE;
DROP TABLE IF EXISTS public.data_quality_checks CASCADE;
DROP TABLE IF EXISTS public.robots_txt_cache CASCADE;

-- Drop company news table (not essential for MVP)
DROP TABLE IF EXISTS public.company_news CASCADE;

-- Drop user profiles table (auth.users is sufficient for MVP)
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- ============================================================================
-- STEP 2: Drop Non-MVP Functions
-- ============================================================================

-- Drop web scraping functions
DROP FUNCTION IF EXISTS public.check_rate_limit(data_source, text);
DROP FUNCTION IF EXISTS public.get_pending_scraping_jobs(integer);

-- Drop complex admin functions (keep basic ones)
DROP FUNCTION IF EXISTS public.check_trigger_and_function_status();
DROP FUNCTION IF EXISTS public.cleanup_triggers_and_functions();
DROP FUNCTION IF EXISTS public.get_admin_stats();
DROP FUNCTION IF EXISTS public.list_users();
DROP FUNCTION IF EXISTS public.update_user_role(text, text, text);

-- Keep essential functions for MVP:
-- - get_company_rating (for calculating averages)
-- - safe_division (utility function)
-- - is_admin (basic admin check)
-- - get_user_role (basic role check)
-- - create_admin_user (admin setup)
-- - check_rate_limit and get_remaining_limits (basic rate limiting)

-- ============================================================================
-- STEP 3: Drop Non-MVP Enums
-- ============================================================================

-- Drop web scraping enums
DROP TYPE IF EXISTS scraping_status CASCADE;
DROP TYPE IF EXISTS scraper_type CASCADE;
DROP TYPE IF EXISTS data_source CASCADE;
DROP TYPE IF EXISTS scraper_type_enum CASCADE;

-- Drop specialized section enums (already removed but ensure cleanup)
DROP TYPE IF EXISTS company_status_type CASCADE;
DROP TYPE IF EXISTS distress_indicator_type CASCADE;
DROP TYPE IF EXISTS growth_indicator_type CASCADE;

-- Keep essential enums:
-- - employment_status (useful for reviews)
-- - rate_limit_type (basic rate limiting)
-- - review_status (essential for moderation)
-- - verification_status (useful for company verification)

-- ============================================================================
-- STEP 4: Simplify Companies Table
-- ============================================================================

-- Remove non-essential columns from companies table
ALTER TABLE public.companies DROP COLUMN IF EXISTS benefits CASCADE;
ALTER TABLE public.companies DROP COLUMN IF EXISTS ceo CASCADE;
ALTER TABLE public.companies DROP COLUMN IF EXISTS company_values CASCADE;
ALTER TABLE public.companies DROP COLUMN IF EXISTS verification_date CASCADE;
ALTER TABLE public.companies DROP COLUMN IF EXISTS verification_status CASCADE;

-- Keep essential columns:
-- - id, name, location, industry, website, logo_url
-- - created_at, updated_at, created_by
-- - verified (simple boolean)
-- - average_rating, total_reviews, recommendation_rate (calculated fields)

-- ============================================================================
-- STEP 5: Simplify Reviews Table
-- ============================================================================

-- Remove non-essential columns from reviews table
ALTER TABLE public.reviews DROP COLUMN IF EXISTS employment_status CASCADE;
ALTER TABLE public.reviews DROP COLUMN IF EXISTS is_current_employee CASCADE;
ALTER TABLE public.reviews DROP COLUMN IF EXISTS reviewer_email CASCADE;
ALTER TABLE public.reviews DROP COLUMN IF EXISTS reviewer_name CASCADE;

-- Rename company_name to be consistent (use company_id relationship)
ALTER TABLE public.reviews DROP COLUMN IF EXISTS company_name CASCADE;

-- Keep essential columns:
-- - id, company_id, user_id
-- - rating, title, pros, cons, content
-- - position (job title)
-- - status (for moderation)
-- - created_at

-- ============================================================================
-- STEP 6: Update Indexes for Simplified Schema
-- ============================================================================

-- Drop indexes for removed columns
DROP INDEX IF EXISTS companies_verification_status_idx;
DROP INDEX IF EXISTS companies_ceo_idx;
DROP INDEX IF EXISTS reviews_employment_status_idx;
DROP INDEX IF EXISTS reviews_reviewer_email_idx;

-- Ensure essential indexes exist
CREATE INDEX IF NOT EXISTS companies_name_search_idx ON public.companies USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS companies_industry_idx ON public.companies(industry) WHERE industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS companies_location_idx ON public.companies(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS companies_verified_idx ON public.companies(verified);
CREATE INDEX IF NOT EXISTS companies_average_rating_idx ON public.companies(average_rating) WHERE average_rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS reviews_company_rating_idx ON public.reviews(company_id, rating);
CREATE INDEX IF NOT EXISTS reviews_status_created_idx ON public.reviews(status, created_at);
CREATE INDEX IF NOT EXISTS reviews_user_company_idx ON public.reviews(user_id, company_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- STEP 7: Update RLS Policies for Simplified Schema
-- ============================================================================

-- Clean up policies for removed tables
DROP POLICY IF EXISTS "Public can view company status" ON public.company_status_tracking;
DROP POLICY IF EXISTS "Public can view distress indicators" ON public.financial_distress_indicators;
DROP POLICY IF EXISTS "Public can view startup indicators" ON public.rising_startup_indicators;
DROP POLICY IF EXISTS "Public can view company metrics" ON public.company_metrics;

-- Ensure essential policies exist for companies
DROP POLICY IF EXISTS "Allow public read access to companies" ON public.companies;
CREATE POLICY "Public can read companies" ON public.companies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON public.companies;
CREATE POLICY "Authenticated users can create companies" ON public.companies
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update companies they created" ON public.companies;
CREATE POLICY "Users can update their companies" ON public.companies
    FOR UPDATE TO authenticated 
    USING (created_by = auth.uid()) 
    WITH CHECK (created_by = auth.uid());

-- Ensure essential policies exist for reviews
DROP POLICY IF EXISTS "Allow public read access to approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Allow authenticated users to create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their reviews" ON public.reviews
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid()) 
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STEP 8: Add Comments for Documentation
-- ============================================================================

COMMENT ON TABLE public.companies IS 'Core company information for MVP employer review platform';
COMMENT ON TABLE public.reviews IS 'User reviews and ratings for companies - core MVP functionality';

COMMENT ON COLUMN public.companies.id IS 'Primary key for company records';
COMMENT ON COLUMN public.companies.name IS 'Company name - required field';
COMMENT ON COLUMN public.companies.location IS 'Company location - optional';
COMMENT ON COLUMN public.companies.industry IS 'Company industry category - optional';
COMMENT ON COLUMN public.companies.website IS 'Company website URL - optional';
COMMENT ON COLUMN public.companies.logo_url IS 'Company logo image URL - optional';
COMMENT ON COLUMN public.companies.verified IS 'Whether company is verified - simple boolean';
COMMENT ON COLUMN public.companies.average_rating IS 'Calculated average rating from reviews';
COMMENT ON COLUMN public.companies.total_reviews IS 'Total number of reviews for this company';
COMMENT ON COLUMN public.companies.recommendation_rate IS 'Percentage of users who would recommend';

COMMENT ON COLUMN public.reviews.id IS 'Primary key for review records';
COMMENT ON COLUMN public.reviews.company_id IS 'Foreign key to companies table';
COMMENT ON COLUMN public.reviews.user_id IS 'Foreign key to auth.users - nullable for anonymous reviews';
COMMENT ON COLUMN public.reviews.rating IS 'Overall rating 1-5 stars - required';
COMMENT ON COLUMN public.reviews.title IS 'Review title/summary - optional';
COMMENT ON COLUMN public.reviews.pros IS 'Positive aspects - optional';
COMMENT ON COLUMN public.reviews.cons IS 'Negative aspects - optional';
COMMENT ON COLUMN public.reviews.content IS 'Main review content - optional';
COMMENT ON COLUMN public.reviews.position IS 'Job title/position - optional';
COMMENT ON COLUMN public.reviews.status IS 'Review moderation status - pending/approved/rejected';

-- ============================================================================
-- STEP 9: Final Cleanup
-- ============================================================================

-- Refresh materialized views if any exist
-- (None in current MVP schema)

-- Update table statistics
ANALYZE public.companies;
ANALYZE public.reviews;

-- Log completion
INSERT INTO public.schema_migrations (version, applied_at) 
VALUES ('20250910_simplify_mvp_schema', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();

COMMENT ON SCHEMA public IS 'Simplified MVP schema for employer review platform - focused on core functionality only';