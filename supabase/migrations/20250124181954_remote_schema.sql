

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


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."company_verification_status" AS ENUM (
    'pending',
    'verified',
    'rejected'
);


ALTER TYPE "public"."company_verification_status" OWNER TO "postgres";


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



CREATE OR REPLACE FUNCTION "public"."log_error"("operation" "text", "table_name" "text", "error_message" "text", "details" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
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



CREATE OR REPLACE FUNCTION "public"."normalize_company_name"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN lower(trim(regexp_replace(name, '\s+', ' ', 'g')));
END;
$$;


ALTER FUNCTION "public"."normalize_company_name"("name" "text") OWNER TO "postgres";


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


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" bigint NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "industry" character varying(50),
    "location" character varying(150),
    "website" character varying(2048),
    "logo_url" character varying(2048),
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "verified" boolean DEFAULT false,
    CONSTRAINT "companies_logo_url_check" CHECK (("public"."is_valid_url"(("logo_url")::"text") OR ("logo_url" IS NULL))),
    CONSTRAINT "companies_website_url_check" CHECK (("public"."is_valid_url"(("website")::"text") OR ("website" IS NULL)))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON TABLE "public"."companies" IS 'Companies that can be reviewed. Includes URL validation, unique normalized names, and automatic timestamp management.';



COMMENT ON COLUMN "public"."companies"."name" IS 'Company name';



COMMENT ON COLUMN "public"."companies"."description" IS 'Company description';



COMMENT ON COLUMN "public"."companies"."industry" IS 'Company industry';



COMMENT ON COLUMN "public"."companies"."location" IS 'Company location';



COMMENT ON COLUMN "public"."companies"."website" IS 'Company website URL';



COMMENT ON COLUMN "public"."companies"."logo_url" IS 'URL to company logo';



COMMENT ON COLUMN "public"."companies"."created_by" IS 'User who created the company entry';



COMMENT ON COLUMN "public"."companies"."verified" IS 'Whether the company is verified';



ALTER TABLE "public"."companies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."companies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."error_logs" (
    "id" bigint NOT NULL,
    "error_time" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "operation" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "error_message" "text" NOT NULL,
    "details" "jsonb"
);


ALTER TABLE "public"."error_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."error_logs" IS 'System-wide error logging table for tracking and debugging issues';



ALTER TABLE "public"."error_logs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."error_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_logs"
    ADD CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id");



CREATE INDEX "companies_industry_idx" ON "public"."companies" USING "btree" ("industry");



CREATE INDEX "companies_location_idx" ON "public"."companies" USING "btree" ("location");



CREATE INDEX "companies_name_idx" ON "public"."companies" USING "btree" ("name");



CREATE UNIQUE INDEX "idx_companies_normalized_name" ON "public"."companies" USING "btree" ("public"."normalize_company_name"(("name")::"text"));



CREATE OR REPLACE TRIGGER "companies_handle_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."handle_companies_updated_at"();



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow authenticated users to create companies" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to view error_logs" ON "public"."error_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow public read access to companies" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "Allow service role full access to error_logs" ON "public"."error_logs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow users to delete companies they created" ON "public"."companies" FOR DELETE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Allow users to update companies they created" ON "public"."companies" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_logs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































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


















GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."error_logs" TO "anon";
GRANT ALL ON TABLE "public"."error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."error_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."error_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."error_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."error_logs_id_seq" TO "service_role";



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
