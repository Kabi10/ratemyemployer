-- Create tables and functions for Financial Distress and Rising Startups sections
-- This migration adds comprehensive tracking for company financial health and growth indicators

-- Create enum for company status categories
CREATE TYPE company_status_type AS ENUM (
    'stable',
    'financial_distress',
    'rising_startup',
    'declining',
    'acquired',
    'ipo_ready'
);

-- Create enum for distress indicators
CREATE TYPE distress_indicator_type AS ENUM (
    'layoffs',
    'funding_issues',
    'revenue_decline',
    'leadership_changes',
    'office_closures',
    'bankruptcy_filing',
    'acquisition_rumors',
    'stock_decline',
    'negative_news',
    'employee_exodus'
);

-- Create enum for growth indicators
CREATE TYPE growth_indicator_type AS ENUM (
    'funding_round',
    'revenue_growth',
    'hiring_spree',
    'expansion',
    'new_products',
    'partnerships',
    'awards',
    'positive_news',
    'ipo_preparation',
    'acquisition_interest'
);

-- Create company_status_tracking table
CREATE TABLE IF NOT EXISTS "public"."company_status_tracking" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "company_id" bigint REFERENCES companies(id) ON DELETE CASCADE,
    "status" company_status_type NOT NULL DEFAULT 'stable',
    "confidence_score" integer CHECK (confidence_score >= 0 AND confidence_score <= 100) DEFAULT 50,
    "last_updated" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "automated_detection" boolean DEFAULT false,
    "manual_override" boolean DEFAULT false,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create financial_distress_indicators table
CREATE TABLE IF NOT EXISTS "public"."financial_distress_indicators" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "company_id" bigint REFERENCES companies(id) ON DELETE CASCADE,
    "indicator_type" distress_indicator_type NOT NULL,
    "severity" integer CHECK (severity >= 1 AND severity <= 5) DEFAULT 3,
    "description" text NOT NULL,
    "source_url" text,
    "detected_at" timestamp with time zone DEFAULT now() NOT NULL,
    "verified" boolean DEFAULT false,
    "verified_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "impact_score" integer CHECK (impact_score >= 1 AND impact_score <= 10) DEFAULT 5,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create rising_startup_indicators table
CREATE TABLE IF NOT EXISTS "public"."rising_startup_indicators" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "company_id" bigint REFERENCES companies(id) ON DELETE CASCADE,
    "indicator_type" growth_indicator_type NOT NULL,
    "growth_score" integer CHECK (growth_score >= 1 AND growth_score <= 10) DEFAULT 5,
    "description" text NOT NULL,
    "source_url" text,
    "detected_at" timestamp with time zone DEFAULT now() NOT NULL,
    "verified" boolean DEFAULT false,
    "verified_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "funding_amount" numeric(15,2),
    "valuation" numeric(15,2),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create company_metrics table for tracking quantitative indicators
CREATE TABLE IF NOT EXISTS "public"."company_metrics" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "company_id" bigint REFERENCES companies(id) ON DELETE CASCADE,
    "metric_date" date NOT NULL,
    "employee_count" integer,
    "revenue_estimate" numeric(15,2),
    "funding_total" numeric(15,2),
    "valuation" numeric(15,2),
    "glassdoor_rating" numeric(3,2),
    "linkedin_followers" integer,
    "news_sentiment_score" numeric(3,2), -- -1 to 1 scale
    "review_velocity" integer, -- reviews per month
    "hiring_velocity" integer, -- new hires per month
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(company_id, metric_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "company_status_tracking_company_id_idx" ON "public"."company_status_tracking" ("company_id");
CREATE INDEX IF NOT EXISTS "company_status_tracking_status_idx" ON "public"."company_status_tracking" ("status");
CREATE INDEX IF NOT EXISTS "company_status_tracking_last_updated_idx" ON "public"."company_status_tracking" ("last_updated");

CREATE INDEX IF NOT EXISTS "financial_distress_indicators_company_id_idx" ON "public"."financial_distress_indicators" ("company_id");
CREATE INDEX IF NOT EXISTS "financial_distress_indicators_type_idx" ON "public"."financial_distress_indicators" ("indicator_type");
CREATE INDEX IF NOT EXISTS "financial_distress_indicators_detected_at_idx" ON "public"."financial_distress_indicators" ("detected_at");
CREATE INDEX IF NOT EXISTS "financial_distress_indicators_severity_idx" ON "public"."financial_distress_indicators" ("severity");

CREATE INDEX IF NOT EXISTS "rising_startup_indicators_company_id_idx" ON "public"."rising_startup_indicators" ("company_id");
CREATE INDEX IF NOT EXISTS "rising_startup_indicators_type_idx" ON "public"."rising_startup_indicators" ("indicator_type");
CREATE INDEX IF NOT EXISTS "rising_startup_indicators_detected_at_idx" ON "public"."rising_startup_indicators" ("detected_at");
CREATE INDEX IF NOT EXISTS "rising_startup_indicators_growth_score_idx" ON "public"."rising_startup_indicators" ("growth_score");

CREATE INDEX IF NOT EXISTS "company_metrics_company_id_idx" ON "public"."company_metrics" ("company_id");
CREATE INDEX IF NOT EXISTS "company_metrics_date_idx" ON "public"."company_metrics" ("metric_date");

-- Enable Row Level Security
ALTER TABLE "public"."company_status_tracking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."financial_distress_indicators" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."rising_startup_indicators" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."company_metrics" ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view company status" ON "public"."company_status_tracking"
    FOR SELECT USING (true);

CREATE POLICY "Public can view distress indicators" ON "public"."financial_distress_indicators"
    FOR SELECT USING (verified = true);

CREATE POLICY "Public can view startup indicators" ON "public"."rising_startup_indicators"
    FOR SELECT USING (verified = true);

CREATE POLICY "Public can view company metrics" ON "public"."company_metrics"
    FOR SELECT USING (true);

-- Create policies for admin/authenticated user modifications
CREATE POLICY "Authenticated users can insert status tracking" ON "public"."company_status_tracking"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update status tracking" ON "public"."company_status_tracking"
    FOR UPDATE USING (auth.uid() = updated_by OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can insert distress indicators" ON "public"."financial_distress_indicators"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert startup indicators" ON "public"."rising_startup_indicators"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert metrics" ON "public"."company_metrics"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to calculate company distress score
CREATE OR REPLACE FUNCTION "public"."calculate_distress_score"(company_id_param bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    distress_score integer := 0;
    indicator_record RECORD;
    recent_threshold timestamp := NOW() - INTERVAL '6 months';
BEGIN
    -- Calculate distress score based on recent indicators
    FOR indicator_record IN
        SELECT indicator_type, severity, impact_score, detected_at
        FROM financial_distress_indicators
        WHERE company_id = company_id_param
        AND detected_at >= recent_threshold
        AND verified = true
    LOOP
        -- Weight recent indicators more heavily
        IF indicator_record.detected_at >= NOW() - INTERVAL '1 month' THEN
            distress_score := distress_score + (indicator_record.severity * indicator_record.impact_score * 2);
        ELSIF indicator_record.detected_at >= NOW() - INTERVAL '3 months' THEN
            distress_score := distress_score + (indicator_record.severity * indicator_record.impact_score * 1.5);
        ELSE
            distress_score := distress_score + (indicator_record.severity * indicator_record.impact_score);
        END IF;
    END LOOP;
    
    -- Cap the score at 100
    RETURN LEAST(distress_score, 100);
END;
$$;

-- Function to calculate company growth score
CREATE OR REPLACE FUNCTION "public"."calculate_growth_score"(company_id_param bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    growth_score integer := 0;
    indicator_record RECORD;
    recent_threshold timestamp := NOW() - INTERVAL '12 months';
BEGIN
    -- Calculate growth score based on recent indicators
    FOR indicator_record IN
        SELECT indicator_type, growth_score as score, detected_at
        FROM rising_startup_indicators
        WHERE company_id = company_id_param
        AND detected_at >= recent_threshold
        AND verified = true
    LOOP
        -- Weight recent indicators more heavily
        IF indicator_record.detected_at >= NOW() - INTERVAL '3 months' THEN
            growth_score := growth_score + (indicator_record.score * 2);
        ELSIF indicator_record.detected_at >= NOW() - INTERVAL '6 months' THEN
            growth_score := growth_score + (indicator_record.score * 1.5);
        ELSE
            growth_score := growth_score + indicator_record.score;
        END IF;
    END LOOP;
    
    -- Cap the score at 100
    RETURN LEAST(growth_score, 100);
END;
$$;

-- Function to get companies in financial distress
CREATE OR REPLACE FUNCTION "public"."get_financial_distress_companies"(limit_param integer DEFAULT 20)
RETURNS TABLE(
    company_id bigint,
    company_name text,
    industry text,
    location text,
    distress_score integer,
    latest_indicator text,
    indicator_count bigint,
    average_rating numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    WITH distress_scores AS (
        SELECT 
            c.id,
            c.name,
            c.industry,
            c.location,
            calculate_distress_score(c.id) as score,
            COUNT(fdi.id) as indicator_count,
            c.average_rating
        FROM companies c
        LEFT JOIN financial_distress_indicators fdi ON c.id = fdi.company_id
        WHERE calculate_distress_score(c.id) > 10
        GROUP BY c.id, c.name, c.industry, c.location, c.average_rating
    ),
    latest_indicators AS (
        SELECT DISTINCT ON (company_id)
            company_id,
            description
        FROM financial_distress_indicators
        WHERE verified = true
        ORDER BY company_id, detected_at DESC
    )
    SELECT 
        ds.id,
        ds.name,
        ds.industry,
        ds.location,
        ds.score,
        COALESCE(li.description, 'No recent indicators'),
        ds.indicator_count,
        ds.average_rating
    FROM distress_scores ds
    LEFT JOIN latest_indicators li ON ds.id = li.company_id
    ORDER BY ds.score DESC, ds.indicator_count DESC
    LIMIT limit_param;
$$;

-- Function to get rising startup companies
CREATE OR REPLACE FUNCTION "public"."get_rising_startup_companies"(limit_param integer DEFAULT 20)
RETURNS TABLE(
    company_id bigint,
    company_name text,
    industry text,
    location text,
    growth_score integer,
    latest_indicator text,
    indicator_count bigint,
    average_rating numeric,
    latest_funding numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    WITH growth_scores AS (
        SELECT 
            c.id,
            c.name,
            c.industry,
            c.location,
            calculate_growth_score(c.id) as score,
            COUNT(rsi.id) as indicator_count,
            c.average_rating
        FROM companies c
        LEFT JOIN rising_startup_indicators rsi ON c.id = rsi.company_id
        WHERE calculate_growth_score(c.id) > 10
        GROUP BY c.id, c.name, c.industry, c.location, c.average_rating
    ),
    latest_indicators AS (
        SELECT DISTINCT ON (company_id)
            company_id,
            description,
            funding_amount
        FROM rising_startup_indicators
        WHERE verified = true
        ORDER BY company_id, detected_at DESC
    )
    SELECT 
        gs.id,
        gs.name,
        gs.industry,
        gs.location,
        gs.score,
        COALESCE(li.description, 'No recent indicators'),
        gs.indicator_count,
        gs.average_rating,
        li.funding_amount
    FROM growth_scores gs
    LEFT JOIN latest_indicators li ON gs.id = li.company_id
    ORDER BY gs.score DESC, gs.indicator_count DESC
    LIMIT limit_param;
$$;

-- Grant necessary permissions
GRANT ALL ON "public"."company_status_tracking" TO authenticated;
GRANT ALL ON "public"."financial_distress_indicators" TO authenticated;
GRANT ALL ON "public"."rising_startup_indicators" TO authenticated;
GRANT ALL ON "public"."company_metrics" TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."calculate_distress_score"(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."calculate_growth_score"(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_financial_distress_companies"(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_rising_startup_companies"(integer) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE "public"."company_status_tracking" IS 'Tracks overall company status and health indicators';
COMMENT ON TABLE "public"."financial_distress_indicators" IS 'Records specific indicators of financial distress';
COMMENT ON TABLE "public"."rising_startup_indicators" IS 'Records specific indicators of startup growth and success';
COMMENT ON TABLE "public"."company_metrics" IS 'Quantitative metrics for company performance tracking';

COMMENT ON FUNCTION "public"."calculate_distress_score"(bigint) IS 'Calculates weighted distress score based on recent indicators';
COMMENT ON FUNCTION "public"."calculate_growth_score"(bigint) IS 'Calculates weighted growth score based on recent indicators';
COMMENT ON FUNCTION "public"."get_financial_distress_companies"(integer) IS 'Returns companies ranked by financial distress score';
COMMENT ON FUNCTION "public"."get_rising_startup_companies"(integer) IS 'Returns companies ranked by growth potential score';
