-- Scraping tables and policies

CREATE TYPE scraping_status AS ENUM ('pending','running','completed','failed');
CREATE TYPE scraper_type_enum AS ENUM ('rss','web','api');

CREATE TABLE IF NOT EXISTS public.scraping_jobs (
  id bigserial PRIMARY KEY,
  status scraping_status NOT NULL DEFAULT 'pending',
  scraper_type scraper_type_enum NOT NULL,
  data_source text,
  target_company_name text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

CREATE TABLE IF NOT EXISTS public.scraped_items (
  id bigserial PRIMARY KEY,
  job_id bigint NOT NULL REFERENCES public.scraping_jobs(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  published_at timestamptz,
  source text,
  raw jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_scraped_items_url ON public.scraped_items(url);
CREATE INDEX IF NOT EXISTS idx_scraped_items_job_id ON public.scraped_items(job_id);
CREATE INDEX IF NOT EXISTS idx_scraped_items_published_at ON public.scraped_items(published_at);
CREATE INDEX IF NOT EXISTS idx_scraped_items_source ON public.scraped_items(source);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON public.scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_scraper_type ON public.scraping_jobs(scraper_type);

ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select scraping_jobs" ON public.scraping_jobs
  FOR SELECT USING (true);

CREATE POLICY "Public select scraped_items" ON public.scraped_items
  FOR SELECT USING (true);

CREATE POLICY "Service insert scraping jobs" ON public.scraping_jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service update scraping jobs" ON public.scraping_jobs
  FOR UPDATE USING (true);

CREATE POLICY "Service insert scraped items" ON public.scraped_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service update scraped items" ON public.scraped_items
  FOR UPDATE USING (true);

