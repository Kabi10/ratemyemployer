-- Scraping tables and policies
DROP EXTENSION IF EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.scraping_jobs (
  id bigserial PRIMARY KEY,
  status text,
  scraper_type text,
  data_source text,
  target_company_name text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

CREATE TABLE IF NOT EXISTS public.scraped_items (
  id bigserial PRIMARY KEY,
  job_id bigint REFERENCES public.scraping_jobs(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  published_at timestamptz,
  source text,
  raw jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_scraped_items_url ON public.scraped_items(url);

ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select scraping_jobs" ON public.scraping_jobs
  FOR SELECT USING (true);

CREATE POLICY "Public select scraped_items" ON public.scraped_items
  FOR SELECT USING (true);
