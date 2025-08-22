create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type review_status as enum ('pending','approved','rejected');
  end if;
exception when duplicate_object then null;
end$$;

alter table if exists public.reviews
  add column if not exists recommend boolean,
  add column if not exists status review_status not null default 'approved';

create index if not exists idx_reviews_company_id on public.reviews(company_id);
create index if not exists idx_reviews_rating      on public.reviews(rating);

create or replace view public.company_rating_stats as
select
  c.id as company_id,
  c.name,
  c.industry,
  c.location,
  avg(coalesce(r.rating,0))::numeric(10,4) as avg_rating,
  count(r.*) as review_count
from public.companies c
left join public.reviews r
  on r.company_id = c.id
 and (r.status is null or r.status = 'approved')
group by c.id, c.name, c.industry, c.location;
