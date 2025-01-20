import axios, { AxiosError } from 'axios';


import { createClient } from '@/lib/supabaseClient';

const SERP_API_KEY = 'db313510e725130ead277b13cb64416fd4ed6f8551c7f00cbc9b9163d44e548f';

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

// This function is for initial data gathering only
export async function fetchAndStoreCompanyNews(companies: string[], isPositive: boolean = false): Promise<boolean> {
  try {
    const companyQueries = companies.map(company => {
      if (isPositive) {
        return `("${company}") ("best places to work" OR "great workplace" OR "employee satisfaction" OR "workplace awards" OR "employee benefits" OR "workplace culture" OR "diversity award" OR "sustainability initiatives")`
      }
      return `("${company}") (layoffs OR "workplace violation" OR "OSHA fine" OR "discrimination lawsuit" OR "labor dispute")`
    });
    
    const response = await axios.get<SerpApiResponse>('https://serpapi.com/search.json', {
      params: {
        engine: 'google_news',
        q: companyQueries.join(' OR '),
        api_key: SERP_API_KEY,
        num: 100,
        tbm: 'nws'
      }
    });

    const allArticles = response.data.news_results || [];
    const supabase = createClient();
    
    // Process and store articles for each company
    for (const company of companies) {
      const companyArticles = allArticles
        .filter((article) => 
          article.title.toLowerCase().includes(company.toLowerCase()) ||
          article.snippet.toLowerCase().includes(company.toLowerCase())
        )
        .slice(0, 10);

      if (companyArticles.length > 0) {
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
export async function fetchCompanyNews(companyName: string, filterNegative: boolean = false): Promise<NewsArticle[]> {
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('company_news')
      .select('*')
      .eq('company_name', companyName)
      .order('published_at', { ascending: false })
      .limit(5);

    if (filterNegative) {
      // Filter out news containing negative keywords
      const negativeKeywords = [
        'lawsuit', 'discrimination', 'layoff', 'layoffs', 'violation', 
        'fine', 'penalty', 'dispute', 'complaint', 'investigation'
      ];
      
      negativeKeywords.forEach(keyword => {
        query = query.not('title', 'ilike', `%${keyword}%`);
      });
    }

    const { data: articles, error } = await query;

    if (error || !articles) {
      console.error('Error fetching news:', error);
      return [];
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

    return mappedArticles;

  } catch (error) {
    console.error('Error fetching news:', error);
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