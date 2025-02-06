import { supabase } from './supabaseClient';

export interface MarketauxArticle {
  title: string;
  description: string;
  url: string;
  published_at: string;
  source: string;
  relevance_score?: number;
}

interface MarketauxResponse {
  meta?: {
    found: number;
    returned: number;
    limit: number;
  };
  data: {
    title: string;
    description: string;
    url: string;
    published_at: string;
    source: string;
    relevance_score?: number;
  }[];
}

/**
 * Fetches news articles for a company from Marketaux API with persistent caching
 */
export async function fetchCompanyNews(companyName: string, limit: number = 3): Promise<MarketauxArticle[]> {
  try {
    console.log(`Fetching news for ${companyName}...`);
    
    // First check cache
    const { data: cachedNews } = await supabase
      .from('company_news')
      .select('*')
      .eq('company_name', companyName)
      .order('relevance_score', { ascending: false })
      .limit(limit);
      
    // If we have cached results, return them
    if (cachedNews && cachedNews.length > 0) {
      console.log(`Found ${cachedNews.length} cached articles for ${companyName}`);
      return cachedNews.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        published_at: article.published_at,
        source: article.source,
        relevance_score: article.relevance_score
      }));
    }

    // If no cache, fetch from Marketaux
    console.log('No cache found, fetching from Marketaux...');
    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?` +
      new URLSearchParams({
        search: companyName,
        filter_entities: 'true',
        language: 'en',
        limit: limit.toString(),
        api_token: process.env.MARKETAUX_KEY || ''
      })
    );

    if (!response.ok) {
      throw new Error(`Marketaux API error: ${response.status}`);
    }

    const data = await response.json() as MarketauxResponse;
    
    if (!data.data || data.data.length === 0) {
      console.log('No articles found from Marketaux');
      return [];
    }

    // Transform articles
    const articles = data.data.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      published_at: article.published_at,
      source: article.source,
      relevance_score: article.relevance_score
    }));

    // Store in cache
    const { error: insertError } = await supabase
      .from('company_news')
      .upsert(
        articles.map(article => ({
          company_name: companyName,
          ...article,
          cached_at: new Date().toISOString()
        })),
        { onConflict: 'company_name,url' }
      );

    if (insertError) {
      console.error('Error caching articles:', insertError);
    } else {
      console.log(`Cached ${articles.length} new articles for ${companyName}`);
    }

    return articles;
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
}

/**
 * Bulk fetch news for multiple companies
 */
export async function fetchNewsForCompanies(
  companies: string[],
  limit: number = 3
): Promise<{ [company: string]: MarketauxArticle[] }> {
  const results: { [company: string]: MarketauxArticle[] } = {};
  
  for (const company of companies) {
    results[company] = await fetchCompanyNews(company, limit);
  }
  
  return results;
} 