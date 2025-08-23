-- Insight helper functions

CREATE OR REPLACE FUNCTION public.get_industry_statistics()
RETURNS jsonb AS $$
  SELECT jsonb_build_object(
    'by_industry',
    COALESCE(
      to_jsonb(array_agg(jsonb_build_object('industry', industry, 'score', score)))
        FILTER (WHERE industry IS NOT NULL),
      '[]'::jsonb
    )
  )
  FROM (
    SELECT c.industry,
           AVG(COALESCE(r.rating,0)) AS score
    FROM public.companies c
    LEFT JOIN public.reviews r
      ON r.company_id = c.id AND (r.status IS NULL OR r.status = 'approved')
    GROUP BY c.industry
  ) s;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_rising_startup_companies()
RETURNS jsonb AS $$
  SELECT COALESCE(
    to_jsonb(array_agg(t)),
    '[]'::jsonb
  )
  FROM (
    SELECT c.id AS company_id,
           c.name,
           c.industry,
           AVG(COALESCE(r.rating,0)) AS score
    FROM public.companies c
    LEFT JOIN public.reviews r ON r.company_id = c.id AND (r.status IS NULL OR r.status = 'approved')
    WHERE c.size = 'Startup'
    GROUP BY c.id, c.name, c.industry
    ORDER BY score DESC
    LIMIT 10
  ) AS t;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_financial_distress_companies()
RETURNS jsonb AS $$
  SELECT COALESCE(
    to_jsonb(array_agg(t)),
    '[]'::jsonb
  )
  FROM (
    SELECT c.id AS company_id,
           c.name,
           c.industry,
           AVG(COALESCE(r.rating,0)) AS score
    FROM public.companies c
    LEFT JOIN public.reviews r ON r.company_id = c.id AND (r.status IS NULL OR r.status = 'approved')
    GROUP BY c.id, c.name, c.industry
    HAVING AVG(COALESCE(r.rating,0)) < 2.5
    ORDER BY score ASC
    LIMIT 10
  ) AS t;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_growth_statistics()
RETURNS jsonb AS $$
  SELECT public.get_industry_statistics();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_distress_statistics()
RETURNS jsonb AS $$
  SELECT public.get_industry_statistics();
$$ LANGUAGE sql STABLE;

