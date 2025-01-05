create extension if not exists "citext" with schema "extensions";

create extension if not exists "pg_trgm" with schema "extensions";

create extension if not exists "pgaudit" with schema "extensions";


create type "public"."employment_status" as enum ('Full-time', 'Part-time', 'Contract', 'Intern');

create type "public"."rate_limit_type" as enum ('review', 'company');

create type "public"."review_status" as enum ('pending', 'approved', 'rejected');

create type "public"."verification_status" as enum ('pending', 'verified', 'rejected');

create sequence "public"."companies_id_seq";

create sequence "public"."reviews_id_seq";

create table "public"."companies" (
    "id" bigint not null default nextval('companies_id_seq'::regclass),
    "name" character varying not null,
    "industry" character varying,
    "website" character varying,
    "logo_url" character varying,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "benefits" text,
    "company_values" text,
    "ceo" character varying(255),
    "verification_status" verification_status default 'pending'::verification_status,
    "average_rating" numeric(3,2) default 0,
    "total_reviews" integer default 0,
    "description" text,
    "recommendation_rate" numeric default 0,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "created_by" uuid,
    "verified" boolean default false,
    "verification_date" timestamp with time zone,
    "location" character varying(255) not null default ''::character varying
);


alter table "public"."companies" enable row level security;

create table "public"."reviews" (
    "id" bigint not null default nextval('reviews_id_seq'::regclass),
    "company_id" bigint,
    "user_id" uuid,
    "rating" integer,
    "title" character varying,
    "pros" text,
    "cons" text,
    "position" character varying,
    "employment_status" character varying,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "status" review_status default 'pending'::review_status,
    "content" text,
    "reviewer_name" character varying(50),
    "reviewer_email" character varying(255),
    "is_current_employee" boolean default false
);


alter table "public"."reviews" enable row level security;

create table "public"."user_profiles" (
    "id" uuid not null,
    "username" text,
    "email" text,
    "is_verified" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "role" text default 'user'::text
);


alter table "public"."user_profiles" enable row level security;

alter sequence "public"."companies_id_seq" owned by "public"."companies"."id";

alter sequence "public"."reviews_id_seq" owned by "public"."reviews"."id";

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE INDEX idx_companies_name ON public.companies USING btree (name);

CREATE INDEX idx_companies_user_time ON public.companies USING btree (created_by, created_at);

CREATE INDEX idx_reviews_company_id ON public.reviews USING btree (company_id);

CREATE INDEX idx_reviews_company_time ON public.reviews USING btree (company_id, created_at);

CREATE INDEX idx_reviews_status ON public.reviews USING btree (status);

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);

CREATE INDEX idx_reviews_user_time ON public.reviews USING btree (user_id, created_at);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX user_profiles_email_key ON public.user_profiles USING btree (email);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_profiles_username_key ON public.user_profiles USING btree (username);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."companies" add constraint "companies_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."companies" validate constraint "companies_created_by_fkey";

alter table "public"."reviews" add constraint "reviews_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) not valid;

alter table "public"."reviews" validate constraint "reviews_company_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_email_key" UNIQUE using index "user_profiles_email_key";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_username_key" UNIQUE using index "user_profiles_username_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_company_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_rate_limit(user_id text, limit_type rate_limit_type, company_id integer DEFAULT NULL::integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Simple implementation - can be enhanced later
    RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_rate_limit(user_id uuid, limit_type rate_limit_type, company_id bigint DEFAULT NULL::bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_review_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_trigger_and_function_status()
 RETURNS TABLE(trigger_name text, trigger_table text, trigger_event text, function_name text, function_status text, error_message text)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_triggers_and_functions()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.company_rate_limit_check()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT check_rate_limit(NEW.created_by, 'company'::rate_limit_type) THEN
        RAISE EXCEPTION 'Rate limit exceeded for company creation';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_admin_user()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_admin_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_company_rating(company_id_param bigint)
 RETURNS double precision
 LANGUAGE plpgsql
 STABLE
AS $function$
begin
    return coalesce((
        select avg(rating)::float
        from reviews
        where company_id = company_id_param
    ), 0);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_remaining_limits(user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT role
        FROM user_profiles
        WHERE id = user_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_review_changes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE id = user_id
        AND role = 'admin'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.list_users()
 RETURNS TABLE(id uuid, email text, role text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT up.id, up.email, up.role, up.created_at -- Select the role column
    FROM public.user_profiles up
    ORDER BY up.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.review_rate_limit_check()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT check_rate_limit(NEW.user_id, 'review'::rate_limit_type, NEW.company_id) THEN
        RAISE EXCEPTION 'Rate limit exceeded for reviews';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.safe_division(numerator numeric, denominator numeric)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF denominator = 0 THEN
        RETURN 0;
    ELSE
        RETURN numerator / denominator;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_company_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text, admin_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

grant delete on table "public"."companies" to "PUBLIC";

grant insert on table "public"."companies" to "PUBLIC";

grant references on table "public"."companies" to "PUBLIC";

grant select on table "public"."companies" to "PUBLIC";

grant trigger on table "public"."companies" to "PUBLIC";

grant truncate on table "public"."companies" to "PUBLIC";

grant update on table "public"."companies" to "PUBLIC";

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."reviews" to "PUBLIC";

grant insert on table "public"."reviews" to "PUBLIC";

grant references on table "public"."reviews" to "PUBLIC";

grant select on table "public"."reviews" to "PUBLIC";

grant trigger on table "public"."reviews" to "PUBLIC";

grant truncate on table "public"."reviews" to "PUBLIC";

grant update on table "public"."reviews" to "PUBLIC";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

create policy "Allow admins to DELETE companies"
on "public"."companies"
as permissive
for delete
to authenticated
using ((auth.uid() IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.role = 'admin'::text))));


create policy "Allow admins to manually UPDATE companies"
on "public"."companies"
as permissive
for update
to authenticated
using ((auth.uid() IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.role = 'admin'::text))))
with check ((auth.uid() IN ( SELECT user_profiles.id
   FROM user_profiles
  WHERE (user_profiles.role = 'admin'::text))));


create policy "Allow authenticated users to INSERT companies"
on "public"."companies"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow public SELECT on companies"
on "public"."companies"
as permissive
for select
to public
using (true);


create policy "Allow stats updates on companies"
on "public"."companies"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Companies are insertable by authenticated users"
on "public"."companies"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can create reviews"
on "public"."reviews"
as permissive
for insert
to authenticated
with check (((auth.uid() = user_id) AND (NOT (EXISTS ( SELECT 1
   FROM reviews r
  WHERE ((r.user_id = auth.uid()) AND (r.company_id = reviews.company_id)))))));


create policy "Users can read all reviews"
on "public"."reviews"
as permissive
for select
to authenticated
using (true);


create policy "Users can update their own reviews"
on "public"."reviews"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "reviews_delete_policy"
on "public"."reviews"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "reviews_insert_policy"
on "public"."reviews"
as permissive
for insert
to authenticated
with check (((auth.uid())::text = (user_id)::text));


create policy "reviews_select_policy"
on "public"."reviews"
as permissive
for select
to public
using (true);


create policy "reviews_update_policy"
on "public"."reviews"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Allow users to SELECT their own profile"
on "public"."user_profiles"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "Users can insert their own profile"
on "public"."user_profiles"
as permissive
for insert
to authenticated
with check ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."user_profiles"
as permissive
for update
to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));


CREATE TRIGGER company_rate_limit_trigger BEFORE INSERT ON public.companies FOR EACH ROW EXECUTE FUNCTION company_rate_limit_check();

CREATE TRIGGER company_stats_trigger AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_company_stats();

CREATE TRIGGER handle_review_changes_trigger AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION handle_review_changes();

CREATE TRIGGER review_rate_limit_trigger BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION review_rate_limit_check();


