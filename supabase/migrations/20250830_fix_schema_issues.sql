-- Fix critical database schema issues
-- This migration addresses missing columns and schema misalignments

-- 1. Fix reviews table - ensure recommend column exists
DO $$
BEGIN
    -- Check if recommend column exists and add if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'recommend'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reviews 
        ADD COLUMN recommend boolean DEFAULT NULL;
        
        RAISE NOTICE 'Added recommend column to reviews table';
    ELSE
        RAISE NOTICE 'recommend column already exists in reviews table';
    END IF;
END $$;

-- 2. Fix companies table - ensure all required columns exist
DO $$
BEGIN
    -- Add description column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN description text;
        
        RAISE NOTICE 'Added description column to companies table';
    END IF;

    -- Add average_rating column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'average_rating'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN average_rating numeric(3,2) DEFAULT 0;
        
        RAISE NOTICE 'Added average_rating column to companies table';
    END IF;

    -- Add total_reviews column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'total_reviews'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN total_reviews integer DEFAULT 0;
        
        RAISE NOTICE 'Added total_reviews column to companies table';
    END IF;

    -- Add recommendation_rate column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'recommendation_rate'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN recommendation_rate numeric DEFAULT 0;
        
        RAISE NOTICE 'Added recommendation_rate column to companies table';
    END IF;
END $$;

-- 3. Update reviews table with proper constraints and defaults
DO $$
BEGIN
    -- Add content column if missing (for review descriptions)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'content'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reviews 
        ADD COLUMN content text;
        
        RAISE NOTICE 'Added content column to reviews table';
    END IF;

    -- Add is_current_employee column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'is_current_employee'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reviews 
        ADD COLUMN is_current_employee boolean DEFAULT false;
        
        RAISE NOTICE 'Added is_current_employee column to reviews table';
    END IF;
END $$;

-- 4. Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS reviews_recommend_idx ON public.reviews(recommend);
CREATE INDEX IF NOT EXISTS reviews_content_idx ON public.reviews USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS companies_average_rating_idx ON public.companies(average_rating);
CREATE INDEX IF NOT EXISTS companies_total_reviews_idx ON public.companies(total_reviews);

-- 5. Create/update stored procedures for Wall of Fame/Shame
CREATE OR REPLACE FUNCTION get_wall_companies(wall_type text, limit_count integer DEFAULT 10)
RETURNS TABLE (
    id bigint,
    name varchar,
    industry varchar,
    location varchar,
    description text,
    logo_url varchar,
    website varchar,
    average_rating numeric,
    total_reviews integer,
    recommendation_rate numeric,
    review_count bigint,
    recommend_percentage numeric
) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH company_stats AS (
        SELECT 
            c.id,
            c.name,
            c.industry,
            c.location,
            c.description,
            c.logo_url,
            c.website,
            COALESCE(c.average_rating, 0) as average_rating,
            COALESCE(c.total_reviews, 0) as total_reviews,
            COALESCE(c.recommendation_rate, 0) as recommendation_rate,
            COUNT(r.id) as review_count,
            CASE 
                WHEN COUNT(r.id) > 0 THEN
                    ROUND((COUNT(CASE WHEN r.recommend = true THEN 1 END)::numeric / COUNT(r.id)::numeric) * 100, 1)
                ELSE 0
            END as recommend_percentage
        FROM companies c
        LEFT JOIN reviews r ON c.id = r.company_id AND r.status = 'approved'
        GROUP BY c.id, c.name, c.industry, c.location, c.description, c.logo_url, c.website, c.average_rating, c.total_reviews, c.recommendation_rate
        HAVING COUNT(r.id) >= 3  -- Minimum reviews for inclusion
    )
    SELECT 
        cs.id,
        cs.name,
        cs.industry,
        cs.location,
        cs.description,
        cs.logo_url,
        cs.website,
        cs.average_rating,
        cs.total_reviews,
        cs.recommendation_rate,
        cs.review_count,
        cs.recommend_percentage
    FROM company_stats cs
    ORDER BY 
        CASE 
            WHEN wall_type = 'fame' THEN cs.average_rating 
            ELSE (5.0 - cs.average_rating)
        END DESC,
        cs.review_count DESC
    LIMIT limit_count;
END;
$$;

-- 6. Create function to recalculate company statistics
CREATE OR REPLACE FUNCTION recalculate_company_stats(company_id_param bigint DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    company_record RECORD;
BEGIN
    -- If specific company_id provided, update just that company
    IF company_id_param IS NOT NULL THEN
        UPDATE companies 
        SET 
            average_rating = (
                SELECT COALESCE(ROUND(AVG(rating::numeric), 2), 0)
                FROM reviews 
                WHERE company_id = company_id_param AND status = 'approved'
            ),
            total_reviews = (
                SELECT COUNT(*)
                FROM reviews 
                WHERE company_id = company_id_param AND status = 'approved'
            ),
            recommendation_rate = (
                SELECT COALESCE(
                    ROUND((COUNT(CASE WHEN recommend = true THEN 1 END)::numeric / 
                           NULLIF(COUNT(*), 0)::numeric) * 100, 2), 0
                )
                FROM reviews 
                WHERE company_id = company_id_param AND status = 'approved'
            ),
            updated_at = NOW()
        WHERE id = company_id_param;
    ELSE
        -- Update all companies
        FOR company_record IN SELECT id FROM companies LOOP
            UPDATE companies 
            SET 
                average_rating = (
                    SELECT COALESCE(ROUND(AVG(rating::numeric), 2), 0)
                    FROM reviews 
                    WHERE company_id = company_record.id AND status = 'approved'
                ),
                total_reviews = (
                    SELECT COUNT(*)
                    FROM reviews 
                    WHERE company_id = company_record.id AND status = 'approved'
                ),
                recommendation_rate = (
                    SELECT COALESCE(
                        ROUND((COUNT(CASE WHEN recommend = true THEN 1 END)::numeric / 
                               NULLIF(COUNT(*), 0)::numeric) * 100, 2), 0
                    )
                    FROM reviews 
                    WHERE company_id = company_record.id AND status = 'approved'
                ),
                updated_at = NOW()
            WHERE id = company_record.id;
        END LOOP;
    END IF;
    
    RAISE NOTICE 'Company statistics recalculated successfully';
END;
$$;

-- 7. Create trigger to auto-update company stats when reviews change
DROP TRIGGER IF EXISTS update_company_stats_trigger ON reviews;

CREATE OR REPLACE FUNCTION trigger_update_company_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    affected_company_id bigint;
BEGIN
    -- Get the affected company ID
    IF TG_OP = 'DELETE' THEN
        affected_company_id := OLD.company_id;
    ELSE
        affected_company_id := NEW.company_id;
    END IF;
    
    -- Recalculate stats for the affected company
    PERFORM recalculate_company_stats(affected_company_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_company_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_company_stats();

-- 8. Initial data fix - recalculate all existing company stats
SELECT recalculate_company_stats();

-- 9. Create schema validation function
CREATE OR REPLACE FUNCTION validate_schema()
RETURNS TABLE (
    table_name text,
    column_name text,
    status text,
    message text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH required_columns AS (
        VALUES 
            ('companies', 'id', 'bigint'),
            ('companies', 'name', 'character varying'),
            ('companies', 'description', 'text'),
            ('companies', 'industry', 'character varying'),
            ('companies', 'location', 'character varying'),
            ('companies', 'website', 'character varying'),
            ('companies', 'logo_url', 'character varying'),
            ('companies', 'average_rating', 'numeric'),
            ('companies', 'total_reviews', 'integer'),
            ('companies', 'recommendation_rate', 'numeric'),
            ('reviews', 'id', 'bigint'),
            ('reviews', 'company_id', 'bigint'),
            ('reviews', 'user_id', 'uuid'),
            ('reviews', 'rating', 'smallint'),
            ('reviews', 'title', 'character varying'),
            ('reviews', 'pros', 'text'),
            ('reviews', 'cons', 'text'),
            ('reviews', 'content', 'text'),
            ('reviews', 'recommend', 'boolean'),
            ('reviews', 'status', 'character varying'),
            ('reviews', 'is_current_employee', 'boolean')
    ) AS t(table_name, column_name, expected_type)
    SELECT 
        rc.table_name::text,
        rc.column_name::text,
        CASE 
            WHEN c.column_name IS NOT NULL THEN 'OK'
            ELSE 'MISSING'
        END as status,
        CASE 
            WHEN c.column_name IS NOT NULL THEN 'Column exists'
            ELSE 'Column is missing and needs to be added'
        END as message
    FROM required_columns rc
    LEFT JOIN information_schema.columns c ON 
        c.table_name = rc.table_name 
        AND c.column_name = rc.column_name 
        AND c.table_schema = 'public'
    ORDER BY rc.table_name, rc.column_name;
END;
$$;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema fix migration completed successfully';
    RAISE NOTICE 'Run SELECT * FROM validate_schema() to verify schema integrity';
END $$;