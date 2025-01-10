import { Company } from '@/types';

interface NewsSource {
  name: string;
  url: string;
  reliability: number;
}

interface NewsItem {
  title: string;
  url: string;
  source: NewsSource;
  publishedAt: string;
  summary?: string;
  sentiment?: number;
}

export async function fetchCompanyNews(company: Company): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = [];
  
  try {
    // Fetch from Hacker News
    const hnResponse = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(company.name)}&tags=story`
    );
    const hnData = await hnResponse.json();
    
    newsItems.push(
      ...hnData.hits.map((hit: any) => ({
        title: hit.title,
        url: hit.url,
        source: {
          name: 'Hacker News',
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          reliability: 0.7
        },
        publishedAt: new Date(hit.created_at).toISOString()
      }))
    );

    // Fetch from Reddit
    const subreddits = ['jobs', 'antiwork', 'cscareerquestions'];
    for (const subreddit of subreddits) {
      const redditResponse = await fetch(
        `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(company.name)}&restrict_sr=1&sort=new`
      );
      const redditData = await redditResponse.json();
      
      newsItems.push(
        ...redditData.data.children.map((post: any) => ({
          title: post.data.title,
          url: `https://reddit.com${post.data.permalink}`,
          source: {
            name: `Reddit r/${subreddit}`,
            url: `https://reddit.com/r/${subreddit}`,
            reliability: 0.5
          },
          publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
          summary: post.data.selftext.slice(0, 200) + '...'
        }))
      );
    }

    // Fetch from Wikipedia
    const wikiResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(company.name)}&prop=extracts&exintro=1&origin=*`
    );
    const wikiData = await wikiResponse.json();
    const pages = wikiData.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId !== '-1') {
      newsItems.push({
        title: `${company.name} - Wikipedia Overview`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(company.name)}`,
        source: {
          name: 'Wikipedia',
          url: 'https://www.wikipedia.org',
          reliability: 0.8
        },
        publishedAt: new Date().toISOString(),
        summary: pages[pageId].extract?.slice(0, 300) + '...'
      });
    }

  } catch (error) {
    console.error('Error fetching news:', error);
  }

  // Sort by date, most recent first
  return newsItems.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

// Utility function to analyze sentiment (basic implementation)
export function analyzeSentiment(text: string): number {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'positive', 'success'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'negative', 'fail'];
  
  const words = text.toLowerCase().split(/\W+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  return score / words.length; // Normalize by text length
}

// Cache management
const newsCache = new Map<string, { items: NewsItem[], timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export function getCachedNews(companyId: string | number): NewsItem[] | null {
  const cached = newsCache.get(companyId.toString());
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.items;
  }
  return null;
}

export function cacheNews(companyId: string | number, items: NewsItem[]): void {
  newsCache.set(companyId.toString(), {
    items,
    timestamp: Date.now()
  });
} 