import { createClient } from '@supabase/supabase-js';

import axios from 'axios';
import dotenv from 'dotenv';
import { supabase } from '@/lib/supabaseClient';
import { fetchCompanyNewsWithFreeAPIs } from '@/lib/freeNewsApi';
import type { Database } from '@/types/supabase';


// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

type Company = Database['public']['Tables']['companies']['Row'];

interface SerpApiNewsResult {
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

function formatDate(dateStr: string): string {
  try {
    // Parse the date string and convert to ISO format
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    console.error('Error parsing date:', dateStr);
    return new Date().toISOString();
  }
}

async function fetchAndStoreCompanyNews(companies: string[]): Promise<boolean> {
  // Check if SERP_API_KEY is available, otherwise use free alternatives
  if (!SERP_API_KEY) {
    console.log('🆓 SERP_API_KEY not found, using free news sources...');
    return await fetchCompanyNewsWithFreeAPIs(companies);
  }

  try {
    console.log('💰 Using SerpAPI (paid service)...');
    const companyQueries = companies.map(company =>
      `("${company}") ("best places to work" OR "great workplace" OR "employee satisfaction" OR "workplace awards" OR "employee benefits" OR "workplace culture" OR "diversity award" OR "sustainability initiatives")`
    );

    const response = await axios.get(`https://serpapi.com/search.json`, {
      params: {
        engine: 'google_news',
        q: companyQueries.join(' OR '),
        api_key: SERP_API_KEY,
        num: 100,
        tbm: 'nws'
      }
    });

    if (!response.data || !response.data.news_results) {
      console.error('No news results found in the response, falling back to free sources...');
      return await fetchCompanyNewsWithFreeAPIs(companies);
    }

    const allArticles = response.data.news_results as SerpApiNewsResult[];
    
    // Process and store articles for each company
    for (const company of companies) {
      const companyArticles = allArticles
        .filter(article => 
          (article.title?.toLowerCase() || '').includes(company.toLowerCase()) ||
          (article.snippet?.toLowerCase() || '').includes(company.toLowerCase())
        )
        .slice(0, 10);

      if (companyArticles.length > 0) {
        const newsArticles: DatabaseNewsArticle[] = companyArticles.map(article => ({
          company_name: company,
          title: article.title || '',
          description: article.snippet || null,
          url: article.link || null,
          published_at: formatDate(article.date),
          source_name: article.source?.name || 'Unknown Source',
          created_at: new Date().toISOString()
        }));

        const { error } = await supabaseClient.from('company_news').insert(newsArticles);
        if (error) {
          console.error(`Error storing news for ${company}:`, error);
        } else {
          console.log(`Successfully stored ${newsArticles.length} articles for ${company}`);
        }
      } else {
        console.log(`No relevant articles found for ${company}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error with SerpAPI, falling back to free sources:', error);
    return await fetchCompanyNewsWithFreeAPIs(companies);
  }
}

async function fetchTopCompanies(): Promise<Company[]> {
  // Get top 10 companies with average_rating > 4.0
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .gt('average_rating', 4.0)
    .order('average_rating', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching top companies:', error);
    return [];
  }

  return companies;
}

async function fetchTopCompaniesNews() {
  try {
    // Get top 10 companies with rating > 4.0
    const topCompanies = await fetchTopCompanies();
    
    if (topCompanies && topCompanies.length > 0) {
      console.log(`Fetching positive news for ${topCompanies.length} companies...`);
      const companyNames = topCompanies.map(c => c.name);
      
      // Fetch and store positive news
      const success = await fetchAndStoreCompanyNews(companyNames);
      
      if (success) {
        console.log('Successfully fetched and stored positive news articles');
      } else {
        console.error('Failed to fetch and store news articles');
      }
    } else {
      console.log('No top-rated companies found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
fetchTopCompaniesNews();