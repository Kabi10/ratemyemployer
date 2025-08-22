create extension if not exists pgcrypto;

create table if not exists public.scraping_jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null default 'queued',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.scraped_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.scraping_jobs(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  url text not null,
  title text,
  published_at timestamptz,
  source text,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- De-dupe by URL for upserts from RSS
create unique index if not exists uniq_scraped_items_url on public.scraped_items(url);

-- Helpful indexes
create index if not exists idx_scraped_items_company on public.scraped_items(company_id);
create index if not exists idx_scraped_items_published on public.scraped_items(published_at);

-- RLS: read for all (writes via service role key)
alter table public.scraping_jobs enable row level security;
alter table public.scraped_items enable row level security;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='scraping_jobs' and policyname='read_all_jobs';
  if not found then
    create policy read_all_jobs on public.scraping_jobs for select using (true);
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='scraped_items' and policyname='read_all_items';
  if not found then
    create policy read_all_items on public.scraped_items for select using (true);
  end if;
end $$;
