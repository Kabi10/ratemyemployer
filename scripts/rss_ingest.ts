/**
 * RSS ingestion script
 * Fetches RSS feeds and upserts items into the scraped_items table.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
 */
import 'dotenv/config';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  const parser = new Parser();
  const feeds = [
    'https://news.ycombinator.com/rss',
    'https://www.reddit.com/r/programming/.rss'
  ];

  try {
    const results = await Promise.all(feeds.map(u => parser.parseURL(u)));

    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({ scraper_type: 'rss', data_source: 'rss', status: 'completed' })
      .select()
      .single();
    if (jobError || !job) {
      throw jobError || new Error('Failed to create job');
    }

    for (const res of results) {
      for (const item of res.items) {
        const { error } = await supabase.from('scraped_items').upsert(
          {
            job_id: job.id,
            url: item.link ?? '',
            title: item.title,
            published_at: item.isoDate ? new Date(item.isoDate).toISOString() : null,
            source: 'rss',
            raw: { feed: res.feedUrl, ...item }
          },
          { onConflict: 'url' }
        );
        if (error) console.error(error.message);
      }
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

main();
