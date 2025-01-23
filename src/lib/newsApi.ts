import axios, { AxiosError } from 'axios';

import { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabaseClient';

const SERP_API_KEY = process.env.NEXT_PUBLIC_SERP_API_KEY;

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
  };
  date: string;
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

const supabase = createClient();

// This function is for initial data gathering only
export async function fetchAndStoreCompanyNews(companies: string[], isPositive: boolean = false): Promise<boolean> {
  if (!SERP_API_KEY) {
    console.error('SerpAPI key not found');
    return false;
  }

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

    console.log('Fetching news with query:', companyQueries[0]); // Log first query for debugging
    
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
    }).catch((error: AxiosError) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('SerpAPI error response:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from SerpAPI:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up SerpAPI request:', error.message);
      }
      throw error;
    });

    if (!response || !response.data) {
      console.error('No response data from SerpAPI');
      return false;
    }

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

        try {
          // Delete existing news for this company before inserting new ones
          const { error: deleteError } = await supabase
            .from('company_news')
            .delete()
            .eq('company_name', company);

          if (deleteError) {
            console.error('Error deleting old news for', company, ':', deleteError);
            continue;
          }

          const { error: insertError } = await supabase.from('company_news').insert(newsArticles);
          if (insertError) {
            console.error('Error inserting news for', company, ':', insertError);
            continue;
          }
        } catch (dbError) {
          console.error('Database operation failed for', company, ':', dbError);
          continue;
        }
      } else {
        console.log(`No relevant articles found for ${company}`);
      }
    }

    return true;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('SerpAPI request failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } else {
      console.error('Unexpected error:', error);
    }
    return false;
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