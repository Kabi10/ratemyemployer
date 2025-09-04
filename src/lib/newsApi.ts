import { supabase } from './supabaseClient';

// Define our own types instead of trying to access them from the Database type
interface CompanyNewsInsert {
  company_name: string;
  title: string;
  description: string | null;
  url: string | null;
  published_at: string;
  source_name: string;
  created_at?: string;
}

interface CompanyNewsRow extends CompanyNewsInsert {
  id: number;
}

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}

// Use our CompanyNewsInsert type for database operations
type DatabaseNewsArticle = CompanyNewsInsert;

// Use this function to get news for multiple companies
export async function fetchNewsForCompanies(companies: string[]): Promise<{ [company: string]: NewsArticle[] }> {
  try {
    const results: { [company: string]: NewsArticle[] } = {};

    for (const company of companies) {
      // Get cached news from database only (KlusterAI removed)
      const articles = await fetchCompanyNews(company);
      results[company] = articles;
    }

    return results;
  } catch (error) {
    console.error('Error fetching news:', error);
    return {};
  }
}

export const fetchCompanyNews = async (companyName: string): Promise<NewsArticle[]> => {
  try {
    // First, try to get cached news from the database
    const { data: cachedArticles } = await supabase
      .from('company_news')
      .select('*')
      .eq('company_name', companyName)
      .order('published_at', { ascending: false })
      .limit(5);

    if (cachedArticles && cachedArticles.length > 0) {
      return cachedArticles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.published_at,
        source: {
          name: article.source_name
        }
      }));
    }

    // No cached articles found, return empty array (KlusterAI removed)
    return [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Function to manually store news articles (for future integration with other news sources)
export async function storeNewsArticles(companyName: string, articles: NewsArticle[]): Promise<boolean> {
  try {
    if (articles.length === 0) return true;

    const newsArticles: DatabaseNewsArticle[] = articles.map(article => ({
      company_name: companyName,
      title: article.title,
      description: article.description,
      url: article.url,
      published_at: article.publishedAt,
      source_name: article.source.name,
      created_at: new Date().toISOString()
    }));

    // Delete existing news for this company before inserting new ones
    const { error: deleteError } = await supabase
      .from('company_news')
      .delete()
      .eq('company_name', companyName);

    if (deleteError) {
      console.error('Error deleting old news for', companyName, ':', deleteError);
      return false;
    }

    const { error: insertError } = await supabase
      .from('company_news')
      .insert(newsArticles);

    if (insertError) {
      console.error('Error inserting news for', companyName, ':', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error storing news articles:', error);
    return false;
  }
};