/**
 * Run with:  npx ts-node --transpile-only scripts/rss_ingest.ts
 * Requires:  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (NOT anon)
 */
import Parser from 'rss-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service role bypasses RLS
const FEEDS = [
  'https://news.ycombinator.com/rss',
  'https://feeds.bbci.co.uk/news/technology/rss.xml'
];

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const parser = new Parser();

  // create job
  const { data: job, error: jobErr } = await supabase
    .from('scraping_jobs')
    .insert({ source: 'rss', status: 'running' })
    .select()
    .single();
  if (jobErr) throw jobErr;

  for (const feed of FEEDS) {
    const res = await parser.parseURL(feed);
    for (const item of res.items) {
      const url = item.link || '';
      if (!url) continue;

      const title = item.title || '';
      const published_at = item.isoDate ? new Date(item.isoDate).toISOString() : null;

      // Upsert on unique URL
      const { error } = await supabase.from('scraped_items').upsert({
        job_id: job.id,
        url,
        title,
        published_at,
        source: 'rss',
        raw: {
          feed,
          title: item.title,
          contentSnippet: item.contentSnippet
        }
      }, { onConflict: 'url' });
      if (error) console.error('Upsert error:', error.message);
    }
  }

  await supabase.from('scraping_jobs')
    .update({ status: 'finished', finished_at: new Date().toISOString() })
    .eq('id', job.id);

  console.log('RSS ingest complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
