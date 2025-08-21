insert into public.companies (name, industry, location)
values
  ('Maple Labs', 'Biotech', 'Vancouver, BC'),
  ('Island Forge', 'Software', 'Colombo, Sri Lanka')
on conflict do nothing;

with c as (select id from public.companies where name in ('Maple Labs','Island Forge'))
insert into public.reviews (company_id, rating, recommend, status)
select id, 5, true, 'approved' from c
union all
select id, 4, true, 'approved' from c
on conflict do nothing;
