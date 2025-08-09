-- Create usage monitoring tables and functions for Supabase cost tracking
-- This migration adds comprehensive monitoring capabilities for database usage

-- Create usage_logs table for historical tracking
CREATE TABLE IF NOT EXISTS "public"."usage_logs" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "database_size_mb" integer NOT NULL DEFAULT 0,
    "bandwidth_gb" numeric(10,3) NOT NULL DEFAULT 0,
    "storage_gb" numeric(10,3) NOT NULL DEFAULT 0,
    "active_users" integer NOT NULL DEFAULT 0,
    "api_requests" integer NOT NULL DEFAULT 0,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "usage_logs_recorded_at_idx" ON "public"."usage_logs" ("recorded_at");
CREATE INDEX IF NOT EXISTS "usage_logs_created_at_idx" ON "public"."usage_logs" ("created_at");

-- Enable Row Level Security
ALTER TABLE "public"."usage_logs" ENABLE ROW LEVEL SECURITY;

-- Create policy for usage logs (admin only)
CREATE POLICY "Admin can view usage logs" ON "public"."usage_logs"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create policy for inserting usage logs (service role only)
CREATE POLICY "Service role can insert usage logs" ON "public"."usage_logs"
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Function to get database size in bytes
CREATE OR REPLACE FUNCTION "public"."get_database_size"() 
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT pg_database_size(current_database());
$$;

-- Function to get table sizes for detailed analysis
CREATE OR REPLACE FUNCTION "public"."get_table_sizes"() 
RETURNS TABLE(
    table_name text,
    size_bytes bigint,
    size_mb numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        schemaname||'.'||tablename as table_name,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
        round(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2) as size_mb
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
$$;

-- Function to optimize database performance
CREATE OR REPLACE FUNCTION "public"."optimize_database_performance"() 
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    table_record RECORD;
    result_text text := '';
BEGIN
    -- Vacuum and analyze all tables
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'VACUUM ANALYZE public.' || quote_ident(table_record.tablename);
        result_text := result_text || 'Optimized table: ' || table_record.tablename || E'\n';
    END LOOP;
    
    -- Update table statistics
    EXECUTE 'ANALYZE';
    result_text := result_text || 'Updated database statistics';
    
    RETURN result_text;
EXCEPTION
    WHEN others THEN
        RETURN 'Error during optimization: ' || SQLERRM;
END;
$$;

-- Function to get comprehensive analytics with performance optimization
CREATE OR REPLACE FUNCTION "public"."get_comprehensive_analytics"() 
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    total_reviews integer;
    avg_rating numeric;
    total_companies integer;
    monthly_data json;
    rating_dist json;
BEGIN
    -- Get total reviews and average rating
    SELECT COUNT(*), ROUND(AVG(rating), 2) 
    INTO total_reviews, avg_rating
    FROM reviews;
    
    -- Get total companies
    SELECT COUNT(*) INTO total_companies FROM companies;
    
    -- Get monthly review data (last 12 months)
    WITH monthly_reviews AS (
        SELECT 
            DATE_TRUNC('month', created_at) as month,
            COUNT(*) as review_count,
            ROUND(AVG(rating), 2) as avg_rating
        FROM reviews 
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
    )
    SELECT json_agg(
        json_build_object(
            'month', TO_CHAR(month, 'YYYY-MM'),
            'totalReviews', review_count,
            'averageRating', avg_rating
        )
    ) INTO monthly_data FROM monthly_reviews;
    
    -- Get rating distribution
    WITH rating_distribution AS (
        SELECT 
            rating,
            COUNT(*) as count
        FROM reviews 
        GROUP BY rating
        ORDER BY rating
    )
    SELECT json_agg(
        json_build_object(
            'rating', rating,
            'count', count
        )
    ) INTO rating_dist FROM rating_distribution;
    
    -- Build final result
    result := json_build_object(
        'totalReviews', total_reviews,
        'averageRating', avg_rating,
        'totalCompanies', total_companies,
        'reviewsByMonth', COALESCE(monthly_data, '[]'::json),
        'ratingDistribution', COALESCE(rating_dist, '[]'::json),
        'generatedAt', NOW()
    );
    
    RETURN result;
EXCEPTION
    WHEN others THEN
        RETURN json_build_object(
            'error', SQLERRM,
            'generatedAt', NOW()
        );
END;
$$;

-- Function to get industry statistics
CREATE OR REPLACE FUNCTION "public"."get_industry_statistics"() 
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
    WITH industry_stats AS (
        SELECT 
            c.industry,
            COUNT(DISTINCT c.id) as company_count,
            COUNT(r.id) as review_count,
            ROUND(AVG(r.rating), 2) as avg_rating,
            ROUND(AVG(r.work_life_balance), 2) as avg_work_life_balance,
            ROUND(AVG(r.compensation_rating), 2) as avg_compensation,
            ROUND(AVG(r.career_growth), 2) as avg_career_growth,
            ROUND(AVG(r.culture_rating), 2) as avg_culture
        FROM companies c
        LEFT JOIN reviews r ON c.id = r.company_id
        WHERE c.industry IS NOT NULL
        GROUP BY c.industry
        HAVING COUNT(r.id) > 0
        ORDER BY review_count DESC
    )
    SELECT json_agg(
        json_build_object(
            'industry', industry,
            'companyCount', company_count,
            'reviewCount', review_count,
            'averageRating', avg_rating,
            'workLifeBalance', avg_work_life_balance,
            'compensation', avg_compensation,
            'careerGrowth', avg_career_growth,
            'culture', avg_culture
        )
    ) FROM industry_stats;
$$;

-- Function to get location statistics
CREATE OR REPLACE FUNCTION "public"."get_location_statistics"() 
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
    WITH location_stats AS (
        SELECT 
            c.location,
            COUNT(DISTINCT c.id) as company_count,
            COUNT(r.id) as review_count,
            ROUND(AVG(r.rating), 2) as avg_rating
        FROM companies c
        LEFT JOIN reviews r ON c.id = r.company_id
        WHERE c.location IS NOT NULL
        GROUP BY c.location
        HAVING COUNT(r.id) > 0
        ORDER BY review_count DESC
        LIMIT 20
    )
    SELECT json_agg(
        json_build_object(
            'location', location,
            'companyCount', company_count,
            'reviewCount', review_count,
            'averageRating', avg_rating
        )
    ) FROM location_stats;
$$;

-- Function to update table statistics
CREATE OR REPLACE FUNCTION "public"."update_table_statistics"() 
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    table_record RECORD;
    result_text text := '';
BEGIN
    -- Update statistics for all public tables
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE public.' || quote_ident(table_record.tablename);
        result_text := result_text || 'Updated statistics for: ' || table_record.tablename || E'\n';
    END LOOP;
    
    RETURN result_text;
EXCEPTION
    WHEN others THEN
        RETURN 'Error updating statistics: ' || SQLERRM;
END;
$$;

-- Function to clean up old usage logs (keep last 90 days)
CREATE OR REPLACE FUNCTION "public"."cleanup_old_usage_logs"() 
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM usage_logs 
    WHERE recorded_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
EXCEPTION
    WHEN others THEN
        RETURN -1;
END;
$$;

-- Create a view for easy access to recent usage metrics
CREATE OR REPLACE VIEW "public"."recent_usage_metrics" AS
SELECT 
    database_size_mb,
    bandwidth_gb,
    storage_gb,
    active_users,
    api_requests,
    recorded_at,
    LAG(database_size_mb) OVER (ORDER BY recorded_at) as prev_database_size,
    LAG(bandwidth_gb) OVER (ORDER BY recorded_at) as prev_bandwidth,
    LAG(active_users) OVER (ORDER BY recorded_at) as prev_active_users
FROM usage_logs
WHERE recorded_at >= NOW() - INTERVAL '30 days'
ORDER BY recorded_at DESC;

-- Grant necessary permissions
GRANT SELECT ON "public"."usage_logs" TO authenticated;
GRANT SELECT ON "public"."recent_usage_metrics" TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_database_size"() TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_table_sizes"() TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_comprehensive_analytics"() TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_industry_statistics"() TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."get_location_statistics"() TO authenticated;

-- Grant admin functions to service role only
GRANT EXECUTE ON FUNCTION "public"."optimize_database_performance"() TO service_role;
GRANT EXECUTE ON FUNCTION "public"."update_table_statistics"() TO service_role;
GRANT EXECUTE ON FUNCTION "public"."cleanup_old_usage_logs"() TO service_role;

-- Add comments for documentation
COMMENT ON TABLE "public"."usage_logs" IS 'Historical tracking of Supabase usage metrics for cost monitoring';
COMMENT ON FUNCTION "public"."get_database_size"() IS 'Returns current database size in bytes';
COMMENT ON FUNCTION "public"."get_comprehensive_analytics"() IS 'Returns comprehensive analytics data optimized for dashboard display';
COMMENT ON FUNCTION "public"."optimize_database_performance"() IS 'Performs VACUUM ANALYZE on all tables to optimize performance';
COMMENT ON VIEW "public"."recent_usage_metrics" IS 'View showing recent usage metrics with trend analysis';
