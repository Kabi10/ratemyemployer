-- Rising startups
create or replace function public.get_rising_startup_companies(limit_count int default 20)
returns table (
  company_id uuid, name text, industry text, location text,
  avg_rating numeric, review_count bigint, growth_score numeric
)
language sql stable as $$
  select
    s.company_id, s.name, s.industry, s.location,
    s.avg_rating, s.review_count,
    (s.avg_rating * ln(1 + greatest(s.review_count,1)))::numeric(10,4) as growth_score
  from public.company_rating_stats s
  where s.review_count >= 2 and s.avg_rating >= 3.8
  order by growth_score desc
  limit limit_count;
$$;

-- Financial distress
create or replace function public.get_financial_distress_companies(limit_count int default 20)
returns table (
  company_id uuid, name text, industry text, location text,
  avg_rating numeric, review_count bigint, distress_score numeric
)
language sql stable as $$
  select
    s.company_id, s.name, s.industry, s.location,
    s.avg_rating, s.review_count,
    ((5 - s.avg_rating) * ln(1 + greatest(s.review_count,1)))::numeric(10,4) as distress_score
  from public.company_rating_stats s
  where s.review_count >= 2 and s.avg_rating <= 3.2
  order by distress_score desc
  limit limit_count;
$$;

-- Summary stats
create or replace function public.get_growth_statistics()
returns table (
  total_companies bigint, average_score numeric, total_funding numeric,
  by_industry jsonb, by_indicator_type jsonb, trend_data jsonb
)
language plpgsql stable as $$
begin
  return query
  with base as (
    select count(*)::bigint as total_companies,
           coalesce(avg((avg_rating * ln(1+review_count))),0)::numeric(10,4) as average_score
    from public.company_rating_stats
  ),
  by_ind as (
    select industry,
           coalesce(avg((avg_rating * ln(1+review_count))),0)::numeric(10,4) as score
    from public.company_rating_stats
    group by industry
  )
  select
    base.total_companies,
    base.average_score,
    0::numeric as total_funding,
    to_jsonb(array_agg(jsonb_build_object('industry', industry, 'score', score))) filter (where industry is not null),
    '[]'::jsonb,
    '[]'::jsonb
  from base left join by_ind on true;
end$$;

create or replace function public.get_distress_statistics()
returns table (
  total_companies bigint, average_score numeric,
  by_industry jsonb, by_indicator_type jsonb, trend_data jsonb
)
language plpgsql stable as $$
begin
  return query
  with base as (
    select count(*)::bigint as total_companies,
           coalesce(avg(((5-avg_rating) * ln(1+review_count))),0)::numeric(10,4) as average_score
    from public.company_rating_stats
  ),
  by_ind as (
    select industry,
           coalesce(avg(((5-avg_rating) * ln(1+review_count))),0)::numeric(10,4) as score
    from public.company_rating_stats
    group by industry
  )
  select
    base.total_companies,
    base.average_score,
    to_jsonb(array_agg(jsonb_build_object('industry', industry, 'score', score))) filter (where industry is not null),
    '[]'::jsonb,
    '[]'::jsonb
  from base left join by_ind on true;
end$$;
