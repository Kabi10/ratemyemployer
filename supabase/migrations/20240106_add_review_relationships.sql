-- Add foreign key relationships for reviews table
alter table if exists "public"."reviews" 
  add constraint "reviews_user_id_fkey"
  foreign key ("user_id") 
  references "public"."user_profiles" ("id")
  on delete cascade;

alter table if exists "public"."reviews"
  add constraint "reviews_company_id_fkey"
  foreign key ("company_id")
  references "public"."companies" ("id")
  on delete cascade;

-- Add indexes for better query performance
create index if not exists "reviews_user_id_idx" 
  on "public"."reviews" ("user_id");

create index if not exists "reviews_company_id_idx"
  on "public"."reviews" ("company_id"); 