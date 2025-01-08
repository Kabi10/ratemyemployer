drop policy "Authenticated users can create reviews" on "public"."reviews";

drop policy "Users can delete their own reviews" on "public"."reviews";

drop policy "Users can update their own reviews" on "public"."reviews";

alter table "public"."reviews" drop constraint "reviews_user_id_fkey";

drop index if exists "public"."reviews_user_id_idx";

alter table "public"."companies" drop column "description";

alter table "public"."reviews" drop column "user_id";

alter table "public"."reviews" alter column "reviewer_name" set data type character varying(255) using "reviewer_name"::character varying(255);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_timestamps()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = timezone('utc'::text, now());
        NEW.updated_at = timezone('utc'::text, now());
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = timezone('utc'::text, now());
    END IF;
    RETURN NEW;
END;
$function$
;

create policy "Public can create reviews"
on "public"."reviews"
as permissive
for insert
to public
with check (true);


create policy "Public can delete reviews"
on "public"."reviews"
as permissive
for delete
to public
using (true);


create policy "Public can update reviews"
on "public"."reviews"
as permissive
for update
to public
using (true)
with check (true);


create policy "Public can view all reviews"
on "public"."reviews"
as permissive
for select
to public
using (true);


CREATE TRIGGER review_rate_limit_trigger BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION review_rate_limit_check();


