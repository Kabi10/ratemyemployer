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

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE "public"."company_verification_status" AS ENUM (
        'pending',
        'verified',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TYPE "public"."company_verification_status" OWNER TO "postgres";

-- Create functions
CREATE OR REPLACE FUNCTION "public"."handle_companies_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    BEGIN
        IF TG_OP = 'UPDATE' THEN
            IF NEW IS DISTINCT FROM OLD THEN
                NEW.updated_at = CURRENT_TIMESTAMP;
            END IF;
            RETURN NEW;
        END IF;
        
        -- Log unexpected operations
        PERFORM public.log_error(
            TG_OP,
            TG_TABLE_NAME::text,
            'Unexpected trigger operation',
            jsonb_build_object('operation', TG_OP)
        );
        RAISE EXCEPTION 'Unexpected trigger operation: %', TG_OP;
    EXCEPTION
        WHEN others THEN
            -- Log any other errors
            PERFORM public.log_error(
                TG_OP,
                TG_TABLE_NAME::text,
                SQLERRM,
                jsonb_build_object(
                    'operation', TG_OP,
                    'error_detail', SQLSTATE
                )
            );
            RAISE;
    END;
END;
$$;

ALTER FUNCTION "public"."handle_companies_updated_at"() OWNER TO "postgres";

-- Create other functions
CREATE OR REPLACE FUNCTION "public"."is_valid_url"("url" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $_$
BEGIN
    RETURN url ~ '^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#\[\]@!$&''()*+,;=]*)?$';
EXCEPTION
    WHEN others THEN
        RETURN false;
END;
$_$;

ALTER FUNCTION "public"."is_valid_url"("url" "text") OWNER TO "postgres";

COMMENT ON FUNCTION "public"."is_valid_url"("url" "text") IS 'Validates URLs using a comprehensive regex pattern';

-- Create error logging function
CREATE OR REPLACE FUNCTION "public"."log_error"("operation" "text", "table_name" "text", "error_message" "text", "details" "jsonb" DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO "public"."error_logs" 
        ("operation", "table_name", "error_message", "details")
    VALUES 
        (operation, table_name, error_message, details);
EXCEPTION
    WHEN others THEN
        -- If we can't log the error, at least raise it
        RAISE WARNING 'Error logging failed: %', SQLERRM;
END;
$$;

ALTER FUNCTION "public"."log_error"("operation" "text", "table_name" "text", "error_message" "text", "details" "jsonb") OWNER TO "postgres";

COMMENT ON FUNCTION "public"."log_error"("operation" "text", "table_name" "text", "error_message" "text", "details" "jsonb") IS 'Centralized error logging function for tracking database operations';

-- Create name normalization function
CREATE OR REPLACE FUNCTION "public"."normalize_company_name"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN lower(trim(regexp_replace(name, '\s+', ' ', 'g')));
END;
$$;

ALTER FUNCTION "public"."normalize_company_name"("name" "text") OWNER TO "postgres";

-- Create industry normalization function
CREATE OR REPLACE FUNCTION "public"."normalize_industry"("industry" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN trim(regexp_replace(lower(industry), '\s+', ' ', 'g'));
EXCEPTION
    WHEN others THEN
        RETURN null;
END;
$$;

ALTER FUNCTION "public"."normalize_industry"("industry" "text") OWNER TO "postgres";

COMMENT ON FUNCTION "public"."normalize_industry"("industry" "text") IS 'Normalizes industry names for consistent comparison';

-- Create error_logs table if it doesn't exist
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS "public"."error_logs" (
        "id" bigint GENERATED BY DEFAULT AS IDENTITY,
        "error_time" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "operation" "text" NOT NULL,
        "table_name" "text" NOT NULL,
        "error_message" "text" NOT NULL,
        "details" "jsonb"
    );
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

ALTER TABLE "public"."error_logs" OWNER TO "postgres";

COMMENT ON TABLE "public"."error_logs" IS 'System-wide error logging table for tracking and debugging issues';

-- Add primary keys if they don't exist
DO $$ 
DECLARE
    constraint_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'error_logs'
        AND constraint_name = 'error_logs_pkey'
    ) INTO constraint_exists;

    IF NOT constraint_exists THEN
        ALTER TABLE ONLY "public"."error_logs"
            ADD CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id");
    END IF;
END $$;

-- Create unique index on normalized company name
DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_companies_normalized_name" ON "public"."companies" USING btree ("public"."normalize_company_name"(("name")::text));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create trigger if it doesn't exist
DO $$ BEGIN
    CREATE TRIGGER "companies_handle_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."handle_companies_updated_at"();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable RLS
ALTER TABLE "public"."error_logs" ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ BEGIN
    CREATE POLICY "Allow authenticated users to view error_logs" ON "public"."error_logs" FOR SELECT TO "authenticated" USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow service role full access to error_logs" ON "public"."error_logs" TO "service_role" USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set ownership
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

-- Grant permissions
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

-- Grant function permissions
GRANT ALL ON FUNCTION "public"."handle_companies_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_companies_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_companies_updated_at"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_valid_url"("url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_valid_url"("url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_valid_url"("url" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."log_error"("operation" "text", "table_name" "text", "error_message" "text", "details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_error"("operation" "text", "table_name" "text", "error_message" "text", "details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_error"("operation" "text", "table_name" "text", "error_message" "text", "details" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."normalize_company_name"("name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_company_name"("name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_company_name"("name" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."normalize_industry"("industry" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_industry"("industry" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_industry"("industry" "text") TO "service_role";

-- Grant table permissions
GRANT ALL ON TABLE "public"."error_logs" TO "anon";
GRANT ALL ON TABLE "public"."error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."error_logs" TO "service_role";

-- Set default privileges
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
