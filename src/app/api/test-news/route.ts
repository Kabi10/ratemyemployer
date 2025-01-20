import { NextResponse } from 'next/server';


interface FormattedNews {
  title: string;
  url: string;
  source: string;
  date: string;
  summary?: string;
  sentiment: number;
}

function formatDate(timestamp: number | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testCompany = searchParams.get('company') || 'Amazon';
  const results: FormattedNews[] = [];

  try {
    // Hacker News
    try {
      const hnResponse = await fetch(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(testCompany + ' workers OR employees OR workplace')}&tags=story`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      if (!hnResponse.ok) throw new Error(`HTTP error! status: ${hnResponse.status}`);
      const hnData = await hnResponse.json();
      
      results.push(...hnData.hits
        .filter((hit: any) => hit.title && hit.url)
        .map((hit: any) => ({
          title: hit.title,
          url: hit.url,
          source: 'Hacker News',
          date: formatDate(hit.created_at),
          sentiment: 0 // Will be calculated later
        }))
      );
    } catch (e) {
      console.error('Hacker News Error:', e);
    }

    // Reddit (multiple relevant subreddits)
    const subreddits = ['antiwork', 'WorkReform', 'jobs', 'cscareerquestions'];
    for (const subreddit of subreddits) {
      try {
        const redditResponse = await fetch(
          `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(testCompany + ' company')}&restrict_sr=1&sort=new&t=month`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );
        if (!redditResponse.ok) throw new Error(`HTTP error! status: ${redditResponse.status}`);
        const redditData = await redditResponse.json();
        
        results.push(...redditData.data.children
          .filter((post: any) => post.data.title && !post.data.over_18)
          .map((post: any) => ({
            title: post.data.title,
            url: `https://reddit.com${post.data.permalink}`,
            source: `Reddit r/${subreddit}`,
            date: formatDate(post.data.created_utc * 1000),
            summary: post.data.selftext?.slice(0, 200) + '...',
            sentiment: 0 // Will be calculated later
          }))
        );
      } catch (e) {
        console.error(`Reddit (${subreddit}) Error:`, e);
      }
    }

    // Calculate sentiment for all news items
    results.forEach(item => {
      const text = `${item.title} ${item.summary || ''}`.toLowerCase();
      
      // Enhanced negative keywords for workplace issues
      const negativeKeywords = [
        'layoff', 'fired', 'lawsuit', 'discrimination', 'toxic',
        'harassment', 'overwork', 'underpaid', 'strike', 'protest',
        'union', 'complaint', 'violation', 'scandal', 'controversy',
        'abuse', 'hostile', 'unfair', 'unsafe', 'exploitation'
      ];

      // Count negative keywords
      const negativeCount = negativeKeywords.reduce((count, word) => 
        count + (text.includes(word) ? 1 : 0), 0
      );

      // Set sentiment (-1 to 0 scale, more negative = more relevant for Wall of Shame)
      item.sentiment = Math.max(-1, -negativeCount / 5);
    });

    // Sort by sentiment (most negative first) and date
    results.sort((a, b) => {
      if (a.sentiment !== b.sentiment) {
        return a.sentiment - b.sentiment;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Sort results by date (newest first) and limit to 10
    const limitedResults = results.slice(0, 10);

    return NextResponse.json({ 
      success: true,
      company: testCompany,
      results: limitedResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Test Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}