import axios, { AxiosError } from 'axios';

import { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabaseClient';

const SERP_API_KEY = 'db313510e725130ead277b13cb64416fd4ed6f8551c7f00cbc9b9163d44e548f';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

// Cache duration in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type CompanyNewsInsert = Database['public']['Tables']['company_news']['Insert'];
type CompanyNewsRow = Database['public']['Tables']['company_news']['Row'];

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface SerpApiNewsResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  source: {
    name: string;
    icon?: string;
    authors?: string[];
  };
  date: string;
  thumbnail?: string;
  thumbnail_small?: string;
  story_token?: string;
}

interface DatabaseNewsArticle {
  company_name: string;
  title: string;
  description: string | null;
  url: string | null;
  published_at: string;
  source_name: string;
  created_at: string;
}

interface SerpApiResponse {
  news_results: SerpApiNewsResult[];
}

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsAPIArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsItem {
  company_name: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  published_at: string;
  image_url: string | null;
}

const supabase = createClient();

function isNewsStale(lastFetchedDate: string | null): boolean {
  if (!lastFetchedDate) return true;
  const lastFetched = new Date(lastFetchedDate).getTime();
  const now = new Date().getTime();
  return now - lastFetched > CACHE_DURATION;
}

// This function is for initial data gathering only
export async function fetchAndStoreCompanyNews(companies: string[], isPositive: boolean = false): Promise<boolean> {
  try {
    const companyQueries = companies.map(company => {
      const searchTerms = isPositive 
        ? ['best places to work', 'great workplace', 'employee satisfaction', 'workplace awards']
        : ['layoffs', 'bankruptcy', 'workplace violation', 'OSHA violation', 'discrimination lawsuit', 
           'labor dispute', 'strike', 'unfair labor practice', 'employee complaints', 'toxic workplace',
           'investigation', 'scandal', 'misconduct', 'fined', 'sued'];
      
      // Create a more targeted search query
      return `"${company}" (${searchTerms.join(' OR ')})`;
    });
    
    const response = await axios.get<SerpApiResponse>('https://serpapi.com/search.json', {
      params: {
        engine: 'google_news',
        q: companyQueries.join(' OR '),
        api_key: SERP_API_KEY,
        num: 100,
        tbm: 'nws',
        tbs: 'qdr:y', // Last year's news
        safe: 'active'
      }
    });

    const allArticles = response.data.news_results || [];
    console.log(`Found ${allArticles.length} total articles for ${companies.length} companies`);
    
    // Process and store articles for each company
    for (const company of companies) {
      const companyArticles = allArticles
        .filter((article) => {
          const content = (article.title + ' ' + article.snippet).toLowerCase();
          const companyName = company.toLowerCase();
          // Ensure the article is actually about this company
          return content.includes(companyName) && 
                 // Verify it's not just a passing mention
                 (content.indexOf(companyName) < 100 || 
                  content.split(companyName).length > 2);
        })
        .slice(0, 10);

      if (companyArticles.length > 0) {
        console.log(`Found ${companyArticles.length} articles for ${company}`);
        const newsArticles: DatabaseNewsArticle[] = companyArticles.map((article) => ({
          company_name: company,
          title: article.title,
          description: article.snippet,
          url: article.link,
          published_at: article.date,
          source_name: article.source.name,
          created_at: new Date().toISOString()
        }));

        const { error } = await supabase.from('company_news').insert(newsArticles);
        if (error) throw error;
      }
    }

    return true;
  } catch (error) {
    console.error('Error fetching and storing news:', error instanceof AxiosError ? error.response?.data : error);
    return false;
  }
}

// Use this function in your application to get news
export async function fetchCompanyNews(companyName: string): Promise<NewsItem[]> {
  if (!GNEWS_API_KEY) {
    console.error('GNews API key not found');
    return [];
  }

  try {
    // Simplified search query to get more results
    const keywords = encodeURIComponent(`${companyName} company`);
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${keywords}&lang=en&country=us,ca&sortby=publishedAt&max=10&apikey=${GNEWS_API_KEY}`
    );
    const data = await response.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      console.log('No articles found for', companyName);
      return [];
    }

    const newsItems = data.articles.map((article: GNewsArticle): NewsItem => ({
      company_name: companyName,
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      published_at: article.publishedAt,
      image_url: article.image || null
    }));

    // Cache the news items
    if (newsItems.length > 0) {
      const newsToInsert: CompanyNewsInsert[] = newsItems.map(item => ({
        company_name: item.company_name,
        title: item.title,
        description: item.description,
        url: item.url,
        source_name: item.source,
        published_at: item.published_at
      }));

      const { error } = await supabase
        .from('company_news')
        .insert(newsToInsert);

      if (error) {
        console.error('Error caching news:', error);
      }
    }

    // Log the response for debugging
    console.log('GNews response:', {
      query: keywords,
      articleCount: newsItems.length,
      totalArticles: data.totalArticles
    });

    return newsItems;
  } catch (error) {
    console.error('GNews API error:', error);
    return [];
  }
}

// Use this function to get news for multiple companies
export async function fetchNewsForCompanies(companies: string[]): Promise<{ [company: string]: NewsArticle[] }> {
  try {
    const supabase = createClient();
    const results: { [company: string]: NewsArticle[] } = {};

    for (const company of companies) {
      const { data: articles } = await supabase
        .from('company_news')
        .select('*')
        .eq('company_name', company)
        .order('published_at', { ascending: false })
        .limit(5);

      if (!articles) {
        results[company] = [];
        continue;
      }

      const dbArticles = articles as DatabaseNewsArticle[];
      const mappedArticles = dbArticles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.published_at,
        source: {
          name: article.source_name
        }
      }));

      results[company] = mappedArticles;
    }

    return results;

  } catch (error) {
    console.error('Error fetching news:', error);
    return {};
  }
}

// Add news articles manually if needed
export async function addCompanyNews(companyName: string, articles: Array<{
  title: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  sourceName?: string;
}>): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const newsArticles: DatabaseNewsArticle[] = articles.map(article => ({
      company_name: companyName,
      title: article.title,
      description: article.description || null,
      url: article.url || null,
      published_at: article.publishedAt || new Date().toISOString(),
      source_name: article.sourceName || 'Unknown Source',
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('company_news')
      .insert(newsArticles);

    if (error) {
      console.error('Error adding news:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding news:', error);
    return false;
  }
}