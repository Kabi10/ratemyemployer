import { supabase } from './supabaseClient';
import { fetchNewsWithKluster } from './klusterAi';

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
      const articles = await fetchNewsWithKluster(company);
      results[company] = articles;

      // Store the articles in the database for caching
      if (articles.length > 0) {
        const newsArticles: DatabaseNewsArticle[] = articles.map(article => ({
          company_name: company,
          title: article.title,
          description: article.description,
          url: article.url,
          published_at: article.publishedAt,
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
          }
        } catch (dbError) {
          console.error('Database operation failed for', company, ':', dbError);
        }
      }
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

    // If no cached articles, fetch fresh ones from Kluster AI
    return await fetchNewsWithKluster(companyName);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};