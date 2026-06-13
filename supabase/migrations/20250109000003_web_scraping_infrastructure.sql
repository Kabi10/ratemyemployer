-- Web Scraping Infrastructure Database Schema
-- Comprehensive system for automated data collection and enhancement

-- Create enum types for scraping operations
CREATE TYPE scraping_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'paused',
    'cancelled'
);

CREATE TYPE scraper_type AS ENUM (
    'company_data',
    'job_listings',
    'reviews',
    'news',
    'social_media',
    'financial_data',
    'employee_data',
    'glassdoor',
    'linkedin',
    'indeed',
    'custom'
);

CREATE TYPE data_source AS ENUM (
    'glassdoor',
    'indeed',
    'linkedin',
    'crunchbase',
    'company_website',
    'news_sites',
    'social_media',
    'government_data',
    'financial_apis',
    'job_boards',
    'review_sites',
    'custom_api'
);

-- Create scraping_jobs table for managing scraping operations
CREATE TABLE IF NOT EXISTS "public"."scraping_jobs" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "job_name" text NOT NULL,
    "scraper_type" scraper_type NOT NULL,
    "data_source" data_source NOT NULL,
    "target_url" text,
    "target_company_id" bigint REFERENCES companies(id) ON DELETE CASCADE,
    "target_company_name" text,
    "status" scraping_status DEFAULT 'pending' NOT NULL,
    "priority" integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    "scheduled_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "retry_count" integer DEFAULT 0,
    "max_retries" integer DEFAULT 3,
    "error_message" text,
    "configuration" jsonb DEFAULT '{}',
    "results_summary" jsonb DEFAULT '{}',
    "created_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create scraped_data table for storing raw scraped content
CREATE TABLE IF NOT EXISTS "public"."scraped_data" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "scraping_job_id" uuid REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    "company_id" bigint REFERENCES companies(id) ON DELETE CASCADE,
    "data_type" text NOT NULL,
    "source_url" text,
    "raw_data" jsonb NOT NULL,
    "processed_data" jsonb DEFAULT '{}',
    "data_hash" text, -- For deduplication
    "confidence_score" numeric(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    "is_processed" boolean DEFAULT false,
    "is_validated" boolean DEFAULT false,
    "validation_notes" text,
    "scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create company_data_enhancements table for enhanced company information
CREATE TABLE IF NOT EXISTS "public"."company_data_enhancements" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "company_id" bigint REFERENCES companies(id) ON DELETE CASCADE,
    "data_source" data_source NOT NULL,
    "enhancement_type" text NOT NULL,
    "data_field" text NOT NULL,
    "original_value" text,
    "enhanced_value" text NOT NULL,
    "confidence_score" numeric(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    "source_url" text,
    "is_verified" boolean DEFAULT false,
    "verified_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(company_id, data_source, enhancement_type, data_field)
);

-- Create scraping_rate_limits table for managing API and scraping limits
CREATE TABLE IF NOT EXISTS "public"."scraping_rate_limits" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "data_source" data_source NOT NULL,
    "endpoint" text,
    "requests_per_minute" integer DEFAULT 60,
    "requests_per_hour" integer DEFAULT 1000,
    "requests_per_day" integer DEFAULT 10000,
    "current_minute_count" integer DEFAULT 0,
    "current_hour_count" integer DEFAULT 0,
    "current_day_count" integer DEFAULT 0,
    "last_request_at" timestamp with time zone,
    "reset_minute_at" timestamp with time zone DEFAULT now() + interval '1 minute',
    "reset_hour_at" timestamp with time zone DEFAULT now() + interval '1 hour',
    "reset_day_at" timestamp with time zone DEFAULT now() + interval '1 day',
    "is_blocked" boolean DEFAULT false,
    "blocked_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(data_source, endpoint)
);

-- Create scraping_logs table for detailed logging
CREATE TABLE IF NOT EXISTS "public"."scraping_logs" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "scraping_job_id" uuid REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    "log_level" text DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error')),
    "message" text NOT NULL,
    "details" jsonb DEFAULT '{}',
    "url" text,
    "response_code" integer,
    "response_time_ms" integer,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create data_quality_checks table for validation rules
CREATE TABLE IF NOT EXISTS "public"."data_quality_checks" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "check_name" text NOT NULL,
    "data_type" text NOT NULL,
    "validation_rule" jsonb NOT NULL,
    "error_threshold" numeric(3,2) DEFAULT 0.1,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create robots_txt_cache table for respecting robots.txt
CREATE TABLE IF NOT EXISTS "public"."robots_txt_cache" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "domain" text NOT NULL UNIQUE,
    "robots_content" text,
    "crawl_delay" integer DEFAULT 1,
    "allowed_paths" text[],
    "disallowed_paths" text[],
    "last_fetched" timestamp with time zone DEFAULT now() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT now() + interval '24 hours',
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "scraping_jobs_status_idx" ON "public"."scraping_jobs" ("status");
CREATE INDEX IF NOT EXISTS "scraping_jobs_scheduled_idx" ON "public"."scraping_jobs" ("scheduled_at");
CREATE INDEX IF NOT EXISTS "scraping_jobs_company_idx" ON "public"."scraping_jobs" ("target_company_id");
CREATE INDEX IF NOT EXISTS "scraping_jobs_type_idx" ON "public"."scraping_jobs" ("scraper_type");

CREATE INDEX IF NOT EXISTS "scraped_data_company_idx" ON "public"."scraped_data" ("company_id");
CREATE INDEX IF NOT EXISTS "scraped_data_job_idx" ON "public"."scraped_data" ("scraping_job_id");
CREATE INDEX IF NOT EXISTS "scraped_data_type_idx" ON "public"."scraped_data" ("data_type");
CREATE INDEX IF NOT EXISTS "scraped_data_hash_idx" ON "public"."scraped_data" ("data_hash");

CREATE INDEX IF NOT EXISTS "company_enhancements_company_idx" ON "public"."company_data_enhancements" ("company_id");
CREATE INDEX IF NOT EXISTS "company_enhancements_source_idx" ON "public"."company_data_enhancements" ("data_source");
CREATE INDEX IF NOT EXISTS "company_enhancements_verified_idx" ON "public"."company_data_enhancements" ("is_verified");

CREATE INDEX IF NOT EXISTS "rate_limits_source_idx" ON "public"."scraping_rate_limits" ("data_source");
CREATE INDEX IF NOT EXISTS "rate_limits_blocked_idx" ON "public"."scraping_rate_limits" ("is_blocked");

CREATE INDEX IF NOT EXISTS "scraping_logs_job_idx" ON "public"."scraping_logs" ("scraping_job_id");
CREATE INDEX IF NOT EXISTS "scraping_logs_level_idx" ON "public"."scraping_logs" ("log_level");
CREATE INDEX IF NOT EXISTS "scraping_logs_created_idx" ON "public"."scraping_logs" ("created_at");

-- Enable Row Level Security
ALTER TABLE "public"."scraping_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scraped_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."company_data_enhancements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scraping_rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scraping_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."data_quality_checks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."robots_txt_cache" ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to relevant data
CREATE POLICY "Public can view completed scraping jobs" ON "public"."scraping_jobs"
    FOR SELECT USING (status = 'completed');

CREATE POLICY "Public can view validated scraped data" ON "public"."scraped_data"
    FOR SELECT USING (is_validated = true);

CREATE POLICY "Public can view verified enhancements" ON "public"."company_data_enhancements"
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Public can view robots.txt cache" ON "public"."robots_txt_cache"
    FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can manage scraping jobs" ON "public"."scraping_jobs"
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage scraped data" ON "public"."scraped_data"
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage enhancements" ON "public"."company_data_enhancements"
    FOR ALL USING (auth.role() = 'authenticated');

-- Functions for scraping operations
CREATE OR REPLACE FUNCTION "public"."check_rate_limit"(
    source_param data_source,
    endpoint_param text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rate_limit_record RECORD;
    current_time timestamp := NOW();
BEGIN
    -- Get or create rate limit record
    SELECT * INTO rate_limit_record
    FROM scraping_rate_limits
    WHERE data_source = source_param
    AND (endpoint_param IS NULL OR endpoint = endpoint_param);
    
    IF NOT FOUND THEN
        -- Create default rate limit record
        INSERT INTO scraping_rate_limits (data_source, endpoint)
        VALUES (source_param, endpoint_param);
        RETURN true;
    END IF;
    
    -- Check if blocked
    IF rate_limit_record.is_blocked AND rate_limit_record.blocked_until > current_time THEN
        RETURN false;
    END IF;
    
    -- Reset counters if needed
    IF current_time > rate_limit_record.reset_minute_at THEN
        UPDATE scraping_rate_limits
        SET current_minute_count = 0,
            reset_minute_at = current_time + interval '1 minute'
        WHERE id = rate_limit_record.id;
        rate_limit_record.current_minute_count := 0;
    END IF;
    
    IF current_time > rate_limit_record.reset_hour_at THEN
        UPDATE scraping_rate_limits
        SET current_hour_count = 0,
            reset_hour_at = current_time + interval '1 hour'
        WHERE id = rate_limit_record.id;
        rate_limit_record.current_hour_count := 0;
    END IF;
    
    IF current_time > rate_limit_record.reset_day_at THEN
        UPDATE scraping_rate_limits
        SET current_day_count = 0,
            reset_day_at = current_time + interval '1 day'
        WHERE id = rate_limit_record.id;
        rate_limit_record.current_day_count := 0;
    END IF;
    
    -- Check limits
    IF rate_limit_record.current_minute_count >= rate_limit_record.requests_per_minute OR
       rate_limit_record.current_hour_count >= rate_limit_record.requests_per_hour OR
       rate_limit_record.current_day_count >= rate_limit_record.requests_per_day THEN
        RETURN false;
    END IF;
    
    -- Increment counters
    UPDATE scraping_rate_limits
    SET current_minute_count = current_minute_count + 1,
        current_hour_count = current_hour_count + 1,
        current_day_count = current_day_count + 1,
        last_request_at = current_time
    WHERE id = rate_limit_record.id;
    
    RETURN true;
END;
$$;

-- Function to get pending scraping jobs
CREATE OR REPLACE FUNCTION "public"."get_pending_scraping_jobs"(limit_param integer DEFAULT 10)
RETURNS TABLE(
    job_id uuid,
    job_name text,
    scraper_type scraper_type,
    data_source data_source,
    target_url text,
    target_company_id bigint,
    target_company_name text,
    configuration jsonb,
    priority integer
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        id,
        job_name,
        scraper_type,
        data_source,
        target_url,
        target_company_id,
        target_company_name,
        configuration,
        priority
    FROM scraping_jobs
    WHERE status = 'pending'
    AND (scheduled_at IS NULL OR scheduled_at <= NOW())
    ORDER BY priority DESC, created_at ASC
    LIMIT limit_param;
$$;

-- Grant necessary permissions
GRANT ALL ON "public"."scraping_jobs" TO authenticated;
GRANT ALL ON "public"."scraped_data" TO authenticated;
GRANT ALL ON "public"."company_data_enhancements" TO authenticated;
GRANT ALL ON "public"."scraping_rate_limits" TO authenticated;
GRANT ALL ON "public"."scraping_logs" TO authenticated;
GRANT ALL ON "public"."data_quality_checks" TO authenticated;
GRANT ALL ON "public"."robots_txt_cache" TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."check_rate_limit"(data_source, text) TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_pending_scraping_jobs"(integer) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE "public"."scraping_jobs" IS 'Manages automated scraping operations and job scheduling';
COMMENT ON TABLE "public"."scraped_data" IS 'Stores raw and processed data from scraping operations';
COMMENT ON TABLE "public"."company_data_enhancements" IS 'Enhanced company data from various sources';
COMMENT ON TABLE "public"."scraping_rate_limits" IS 'Rate limiting configuration and tracking';
COMMENT ON TABLE "public"."scraping_logs" IS 'Detailed logs for scraping operations';
COMMENT ON TABLE "public"."data_quality_checks" IS 'Validation rules for scraped data quality';
COMMENT ON TABLE "public"."robots_txt_cache" IS 'Cached robots.txt files for ethical scraping';

COMMENT ON FUNCTION "public"."check_rate_limit"(data_source, text) IS 'Checks and enforces rate limits for scraping operations';
COMMENT ON FUNCTION "public"."get_pending_scraping_jobs"(integer) IS 'Returns pending scraping jobs ordered by priority';
