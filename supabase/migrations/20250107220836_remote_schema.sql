

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgaudit" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."employment_status" AS ENUM (
    'Full-time',
    'Part-time',
    'Contract',
    'Intern'
);


ALTER TYPE "public"."employment_status" OWNER TO "postgres";


CREATE TYPE "public"."rate_limit_type" AS ENUM (
    'review',
    'company'
);


ALTER TYPE "public"."rate_limit_type" OWNER TO "postgres";


CREATE TYPE "public"."review_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."review_status" OWNER TO "postgres";


CREATE TYPE "public"."verification_status" AS ENUM (
    'pending',
    'verified',
    'rejected'
);


ALTER TYPE "public"."verification_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_company_rate_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM companies
    WHERE created_by = auth.uid()
    AND created_at > NOW() - INTERVAL '24 hours'
  ) >= 5 THEN
    RAISE EXCEPTION 'You can only create up to 5 companies per day';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_company_rate_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rate_limit"("user_id" "text", "limit_type" "public"."rate_limit_type", "company_id" integer DEFAULT NULL::integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Simple implementation - can be enhanced later
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."check_rate_limit"("user_id" "text", "limit_type" "public"."rate_limit_type", "company_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rate_limit"("user_id" "uuid", "limit_type" "public"."rate_limit_type", "company_id" bigint DEFAULT NULL::bigint) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    daily_limit integer := 5;
    time_window interval := interval '24 hours';
BEGIN
    CASE limit_type
        WHEN 'company' THEN
            RETURN (
                SELECT COUNT(*) < daily_limit
                FROM companies
                WHERE created_by = check_rate_limit.user_id
                AND created_at > NOW() - time_window
            );

        WHEN 'review' THEN
            IF company_id IS NOT NULL AND EXISTS (
                SELECT 1
                FROM reviews r
                WHERE r.user_id = check_rate_limit.user_id
                AND r.company_id = check_rate_limit.company_id
                AND r.created_at > NOW() - time_window
            ) THEN
                RETURN FALSE;
            END IF;

            RETURN (
                SELECT COUNT(*) < daily_limit
                FROM reviews r
                WHERE r.user_id = check_rate_limit.user_id
                AND r.created_at > NOW() - time_window
            );
    END CASE;
END;
$$;


ALTER FUNCTION "public"."check_rate_limit"("user_id" "uuid", "limit_type" "public"."rate_limit_type", "company_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_review_rate_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if user has posted a review for this company in the last 24 hours
  IF EXISTS (
    SELECT 1 FROM reviews
    WHERE user_id = NEW.user_id
    AND company_id = NEW.company_id
    AND created_at > NOW() - INTERVAL '24 hours'
  ) THEN
    RAISE EXCEPTION 'You can only post one review per company every 24 hours';
  END IF;
  
  -- Check if user has posted more than 5 reviews in the last 24 hours
  IF (
    SELECT COUNT(*)
    FROM reviews
    WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours'
  ) >= 5 THEN
    RAISE EXCEPTION 'You can only post up to 5 reviews per day';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_review_rate_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_trigger_and_function_status"() RETURNS TABLE("trigger_name" "text", "trigger_table" "text", "trigger_event" "text", "function_name" "text", "function_status" "text", "error_message" "text")
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    -- Check triggers
    RETURN QUERY
    SELECT
        CAST(t.trigger_name AS TEXT),
        CAST(t.event_object_table AS TEXT),
        CAST(t.event_manipulation AS TEXT),
        CAST(regexp_replace(t.action_statement, '^EXECUTE (?:PROCEDURE|FUNCTION) (.*)\(\)$', '\1') AS TEXT),
        CASE
            WHEN p.proname IS NOT NULL THEN 'OK'
            ELSE 'ERROR'
        END AS function_status,
        CASE
            WHEN p.proname IS NULL THEN 'Function not found'
            ELSE ''
        END AS error_message
    FROM
        information_schema.triggers t
    LEFT JOIN
        pg_proc p ON p.proname = regexp_replace(t.action_statement, '^EXECUTE (?:PROCEDURE|FUNCTION) (.*)\(\)$', '\1')
    WHERE
        t.trigger_name IN ('update_company_ratings_trigger', 'update_company_rating_trigger')
        AND t.event_object_table = 'reviews';

    -- Check function code for overall_rating (potential error)
    RETURN QUERY
    SELECT
        '',
        '',
        '',
        CAST(proname AS TEXT),
        CASE
            WHEN prosrc LIKE '%overall_rating%' THEN 'POTENTIAL ERROR'
            ELSE 'OK'
        END AS function_status,
        CASE
            WHEN prosrc LIKE '%overall_rating%' THEN 'Function code might contain incorrect reference to overall_rating'
            ELSE ''
        END AS error_message
    FROM
        pg_proc p
    WHERE
        proname IN ('update_company_ratings', 'update_company_rating');
END;
$_$;


ALTER FUNCTION "public"."check_trigger_and_function_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_triggers_and_functions"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- 1. Clean up duplicate triggers for update_company_ratings_trigger
    FOR trigger_record IN (
        SELECT
            trigger_name,
            count(*) OVER (PARTITION BY trigger_name) as count
        FROM
            information_schema.triggers
        WHERE
            trigger_name = 'update_company_ratings_trigger'
            AND event_object_table = 'reviews'
    )
    LOOP
        IF trigger_record.count > 1 THEN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON reviews', trigger_record.trigger_name);
        END IF;
    END LOOP;

    -- 2. Clean up duplicate triggers for update_company_rating_trigger
    FOR trigger_record IN (
        SELECT
            trigger_name,
            count(*) OVER (PARTITION BY trigger_name) as count
        FROM
            information_schema.triggers
        WHERE
            trigger_name = 'update_company_rating_trigger'
            AND event_object_table = 'reviews'
    )
    LOOP
        IF trigger_record.count > 1 THEN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON reviews', trigger_record.trigger_name);
        END IF;
    END LOOP;

    -- 3. (Optional) Remove update_company_rating function and trigger if redundant
    -- Check if update_company_ratings is intended to handle all updates.
    -- If so, you might want to remove the update_company_rating function and its trigger.
    -- Uncomment the following lines if you want to remove them:

    -- DROP FUNCTION IF EXISTS update_company_rating();
    -- DROP TRIGGER IF EXISTS update_company_rating_trigger ON reviews;

    RAISE NOTICE 'Triggers and functions cleaned up successfully.';
END;
$$;


ALTER FUNCTION "public"."cleanup_triggers_and_functions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."company_rate_limit_check"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NOT check_rate_limit(NEW.created_by, 'company'::rate_limit_type) THEN
        RAISE EXCEPTION 'Rate limit exceeded for company creation';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."company_rate_limit_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_admin_user"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    role
  ) VALUES (
    'admin@ratemyemployer.com',
    crypt('admin2025', gen_salt('bf')),
    now(),
    'admin'
  );
END;
$$;


ALTER FUNCTION "public"."create_admin_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Insert new profile if doesn't exist
    INSERT INTO public.user_profiles (
        id,
        email,
        username,
        role,
        created_at,
        updated_at,
        is_verified
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NOW(),
        NOW(),
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Handle potential race condition with username
        UPDATE public.user_profiles
        SET username = split_part(NEW.email, '@', 1) || '_' || floor(random() * 1000)::text
        WHERE id = NEW.id
        AND username = split_part(NEW.email, '@', 1);
        RETURN NEW;
    WHEN others THEN
        RAISE LOG 'Error in create_new_user_profile: %', SQLERRM;
        RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_new_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_stats"() RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    company_count integer;
    review_count integer;
    pending_count integer;
BEGIN
    -- Get total companies
    SELECT COUNT(*) INTO company_count FROM companies;

    -- Get total reviews
    SELECT COUNT(*) INTO review_count FROM reviews;

    -- Get pending reviews
    SELECT COUNT(*) INTO pending_count FROM reviews WHERE status = 'pending';

    -- Return all stats as JSON
    RETURN json_build_object(
        'totalCompanies', company_count,
        'totalReviews', review_count,
        'pendingReviews', pending_count
    );
END;
$$;


ALTER FUNCTION "public"."get_admin_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_company_rating"("company_id_param" bigint) RETURNS double precision
    LANGUAGE "plpgsql" STABLE
    AS $$
begin
    return coalesce((
        select avg(rating)::float
        from reviews
        where company_id = company_id_param
    ), 0);
end;
$$;


ALTER FUNCTION "public"."get_company_rating"("company_id_param" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_remaining_limits"("user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    daily_limit integer := 5;
    time_window interval := interval '24 hours';
    company_count integer;
    review_count integer;
BEGIN
    SELECT COUNT(*) INTO company_count
    FROM companies
    WHERE created_by = user_id
    AND created_at > NOW() - time_window;

    SELECT COUNT(*) INTO review_count
    FROM reviews
    WHERE user_id = user_id
    AND created_at > NOW() - time_window;

    RETURN jsonb_build_object(
        'remaining_companies', daily_limit - company_count,
        'remaining_reviews', daily_limit - review_count,
        'reset_in_hours', extract(hour from (
            SELECT MIN(created_at) + time_window - NOW()
            FROM (
                SELECT created_at FROM companies WHERE created_by = user_id
                UNION ALL
                SELECT created_at FROM reviews WHERE user_id = user_id
            ) AS actions
            WHERE created_at > NOW() - time_window
        ))
    );
END;
$$;


ALTER FUNCTION "public"."get_remaining_limits"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT role
        FROM user_profiles
        WHERE id = user_id
    );
END;
$$;


ALTER FUNCTION "public"."get_user_role"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_review_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    affected_company_id bigint;
BEGIN
    -- Determine which company needs stats update
    IF TG_OP = 'DELETE' THEN
        affected_company_id := OLD.company_id;
    ELSE
        affected_company_id := NEW.company_id;
    END IF;

    -- Update company stats
    WITH review_stats AS (
        SELECT 
            COUNT(*) as total_reviews,
            ROUND(AVG(rating::numeric), 2)::NUMERIC(4,2) as avg_rating,
            safe_division(
                COUNT(CASE WHEN rating >= 4 THEN 1 END)::NUMERIC * 100,
                NULLIF(COUNT(*), 0)
            )::NUMERIC(5,2) as recommendation_rate
        FROM reviews
        WHERE company_id = affected_company_id
    )
    UPDATE companies
    SET 
        total_reviews = review_stats.total_reviews,
        average_rating = review_stats.avg_rating,
        recommendation_rate = review_stats.recommendation_rate,
        updated_at = NOW()
    FROM review_stats
    WHERE id = affected_company_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."handle_review_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    CASE TG_OP
    WHEN 'INSERT' THEN
        -- Ensure raw_app_meta_data has the role
        NEW.raw_app_meta_data = COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
            
        -- Create initial profile
        INSERT INTO public.user_profiles (
            id,
            email,
            username,
            role,
            created_at,
            updated_at,
            is_verified
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_app_meta_data->>'role', 'user'),
            NOW(),
            NOW(),
            FALSE
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            updated_at = NOW();

    WHEN 'UPDATE' THEN
        -- Update profile if email or role changes
        IF NEW.email <> OLD.email OR NEW.raw_app_meta_data->>'role' <> OLD.raw_app_meta_data->>'role' THEN
            UPDATE public.user_profiles
            SET 
                email = NEW.email,
                role = COALESCE(NEW.raw_app_meta_data->>'role', 'user'),
                updated_at = NOW()
            WHERE id = NEW.id;
        END IF;

    WHEN 'DELETE' THEN
        -- Optional: Handle user deletion
        NULL;
    END CASE;

    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN unique_violation THEN
        -- Handle username conflicts
        UPDATE public.user_profiles
        SET username = split_part(NEW.email, '@', 1) || '_' || floor(random() * 1000)::text
        WHERE id = NEW.id;
        RETURN NEW;
    WHEN others THEN
        RAISE LOG 'Error in handle_user_changes: %', SQLERRM;
        RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_user_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE id = user_id
        AND role = 'admin'
    );
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_users"() RETURNS TABLE("id" "uuid", "email" "text", "role" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT up.id, up.email, up.role, up.created_at -- Select the role column
    FROM public.user_profiles up
    ORDER BY up.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."list_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."review_rate_limit_check"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NOT check_rate_limit(NEW.user_id, 'review'::rate_limit_type, NEW.company_id) THEN
        RAISE EXCEPTION 'Rate limit exceeded for reviews';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."review_rate_limit_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."safe_division"("numerator" numeric, "denominator" numeric) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF denominator = 0 THEN
        RETURN 0;
    ELSE
        RETURN numerator / denominator;
    END IF;
END;
$$;


ALTER FUNCTION "public"."safe_division"("numerator" numeric, "denominator" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_company_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    WITH review_stats AS (
        SELECT 
            company_id,
            COUNT(*) as total_reviews,
            ROUND(AVG(rating::numeric), 2)::NUMERIC(4,2) as avg_rating,
            (COUNT(CASE WHEN rating >= 4 THEN 1 END)::NUMERIC * 100 / NULLIF(COUNT(*), 0))::NUMERIC(5,2) as recommendation_rate
        FROM reviews
        WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
        GROUP BY company_id
    )
    UPDATE companies c
    SET 
        total_reviews = COALESCE(rs.total_reviews, 0),
        average_rating = COALESCE(rs.avg_rating, 0),
        recommendation_rate = COALESCE(rs.recommendation_rate, 0)
    FROM review_stats rs
    WHERE c.id = rs.company_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_company_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_role"("target_user_id" "uuid", "new_role" "text", "admin_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check if the admin_user_id is actually an admin
    IF NOT is_admin(admin_user_id) THEN
        RETURN FALSE;
    END IF;

    -- Update the role
    UPDATE user_profiles
    SET 
        role = new_role,
        updated_at = NOW()
    WHERE id = target_user_id;

    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."update_user_role"("target_user_id" "uuid", "new_role" "text", "admin_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" bigint NOT NULL,
    "name" character varying NOT NULL,
    "industry" character varying,
    "website" character varying,
    "logo_url" character varying,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "benefits" "text",
    "company_values" "text",
    "ceo" character varying(255),
    "verification_status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status",
    "average_rating" numeric(3,2) DEFAULT 0,
    "total_reviews" integer DEFAULT 0,
    "description" "text",
    "recommendation_rate" numeric DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_by" "uuid",
    "verified" boolean DEFAULT false,
    "verification_date" timestamp with time zone,
    "location" character varying(255) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."companies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."companies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."companies_id_seq" OWNED BY "public"."companies"."id";



CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" bigint NOT NULL,
    "company_id" bigint,
    "user_id" "uuid",
    "rating" integer,
    "title" character varying,
    "pros" "text",
    "cons" "text",
    "position" character varying,
    "employment_status" character varying,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "status" "public"."review_status" DEFAULT 'pending'::"public"."review_status",
    "content" "text",
    "reviewer_name" character varying(50),
    "reviewer_email" character varying(255),
    "is_current_employee" boolean DEFAULT false,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."reviews_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."reviews_id_seq" OWNED BY "public"."reviews"."id";



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "email" "text",
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "role" "text" DEFAULT 'user'::"text"
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."companies" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."companies_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."reviews" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."reviews_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_username_key" UNIQUE ("username");



CREATE INDEX "idx_companies_name" ON "public"."companies" USING "btree" ("name");



CREATE INDEX "idx_companies_user_time" ON "public"."companies" USING "btree" ("created_by", "created_at");



CREATE INDEX "idx_reviews_company_id" ON "public"."reviews" USING "btree" ("company_id");



CREATE INDEX "idx_reviews_company_time" ON "public"."reviews" USING "btree" ("company_id", "created_at");



CREATE INDEX "idx_reviews_status" ON "public"."reviews" USING "btree" ("status");



CREATE INDEX "idx_reviews_user_id" ON "public"."reviews" USING "btree" ("user_id");



CREATE INDEX "idx_reviews_user_time" ON "public"."reviews" USING "btree" ("user_id", "created_at");



CREATE OR REPLACE TRIGGER "company_rate_limit_trigger" BEFORE INSERT ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."company_rate_limit_check"();



CREATE OR REPLACE TRIGGER "company_stats_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_company_stats"();



CREATE OR REPLACE TRIGGER "handle_review_changes_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."handle_review_changes"();



CREATE OR REPLACE TRIGGER "review_rate_limit_trigger" BEFORE INSERT ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."review_rate_limit_check"();



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow admins to DELETE companies" ON "public"."companies" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "user_profiles"."id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow admins to manually UPDATE companies" ON "public"."companies" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "user_profiles"."id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."role" = 'admin'::"text")))) WITH CHECK (("auth"."uid"() IN ( SELECT "user_profiles"."id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow authenticated users to INSERT companies" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow public SELECT on companies" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "Allow stats updates on companies" ON "public"."companies" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow users to SELECT their own profile" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Companies are insertable by authenticated users" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can create reviews" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND (NOT (EXISTS ( SELECT 1
   FROM "public"."reviews" "r"
  WHERE (("r"."user_id" = "auth"."uid"()) AND ("r"."company_id" = "reviews"."company_id")))))));



CREATE POLICY "Users can insert their own profile" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can read all reviews" ON "public"."reviews" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews_delete_policy" ON "public"."reviews" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "reviews_insert_policy" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "reviews_select_policy" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "reviews_update_policy" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



















































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."check_company_rate_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_company_rate_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_company_rate_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rate_limit"("user_id" "text", "limit_type" "public"."rate_limit_type", "company_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("user_id" "text", "limit_type" "public"."rate_limit_type", "company_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("user_id" "text", "limit_type" "public"."rate_limit_type", "company_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rate_limit"("user_id" "uuid", "limit_type" "public"."rate_limit_type", "company_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("user_id" "uuid", "limit_type" "public"."rate_limit_type", "company_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("user_id" "uuid", "limit_type" "public"."rate_limit_type", "company_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_review_rate_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_review_rate_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_review_rate_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_trigger_and_function_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_trigger_and_function_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_trigger_and_function_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_triggers_and_functions"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_triggers_and_functions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_triggers_and_functions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."company_rate_limit_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."company_rate_limit_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."company_rate_limit_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_admin_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_admin_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_admin_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_company_rating"("company_id_param" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_company_rating"("company_id_param" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_company_rating"("company_id_param" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_remaining_limits"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_remaining_limits"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_remaining_limits"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_review_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_review_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_review_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."list_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."list_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."review_rate_limit_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."review_rate_limit_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."review_rate_limit_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."safe_division"("numerator" numeric, "denominator" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."safe_division"("numerator" numeric, "denominator" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."safe_division"("numerator" numeric, "denominator" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_company_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_company_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_company_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_role"("target_user_id" "uuid", "new_role" "text", "admin_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_role"("target_user_id" "uuid", "new_role" "text", "admin_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_role"("target_user_id" "uuid", "new_role" "text", "admin_user_id" "uuid") TO "service_role";






























GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";
GRANT ALL ON TABLE "public"."companies" TO PUBLIC;



GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";
GRANT ALL ON TABLE "public"."reviews" TO PUBLIC;



GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reviews_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
