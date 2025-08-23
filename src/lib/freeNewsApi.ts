/**
 * Free News API Implementation
 * Replaces SerpAPI with free RSS feeds and news sources
 */

import { supabase } from './supabaseClient';
import type { Database } from '@/types/supabase';

type CompanyNewsInsert = Database['public']['Tables']['company_news']['Insert'];

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

interface NewsArticle {
  title: string;
  description: string | null;
  url: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}

// Free RSS news sources
const FREE_NEWS_SOURCES = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology'
  },
  {
    name: 'VentureBeat',
    url: 'https://venturebeat.com/feed/',
    category: 'technology'
  },
  {
    name: 'Business Insider',
    url: 'https://feeds.businessinsider.com/custom/all',
    category: 'business'
  },
  {
    name: 'Reuters Business',
    url: 'https://feeds.reuters.com/reuters/businessNews',
    category: 'business'
  },
  {
    name: 'PR Newswire',
    url: 'https://www.prnewswire.com/rss/news-releases-list.rss',
    category: 'press-releases'
  }
];

/**
 * Parse RSS feed XML to extract news items
 */
async function parseRSSFeed(url: string, sourceName: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RateMyEmployer-NewsBot/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // Simple XML parsing for RSS items
    const items: RSSItem[] = [];
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi);
    
    if (itemMatches) {
      for (const itemXml of itemMatches.slice(0, 10)) { // Limit to 10 items per source
        const title = extractXMLContent(itemXml, 'title');
        const link = extractXMLContent(itemXml, 'link');
        const description = extractXMLContent(itemXml, 'description');
        const pubDate = extractXMLContent(itemXml, 'pubDate');
        
        if (title && link) {
          items.push({
            title: cleanText(title),
            link: link.trim(),
            description: cleanText(description || ''),
            pubDate: pubDate || new Date().toISOString(),
            source: sourceName
          });
        }
      }
    }
    
    return items;
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    return [];
  }
}

/**
 * Extract content from XML tags
 */
function extractXMLContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Clean HTML tags and decode entities from text
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Check if news item is relevant to a company
 */
function isRelevantToCompany(item: RSSItem, companyName: string): boolean {
  const searchText = `${item.title} ${item.description}`.toLowerCase();
  const companyWords = companyName.toLowerCase().split(' ');
  
  // Check if company name appears in the content
  const hasCompanyName = companyWords.some(word => 
    word.length > 2 && searchText.includes(word)
  );
  
  // Check for workplace-related keywords
  const workplaceKeywords = [
    'employee', 'workplace', 'hiring', 'layoff', 'culture', 'benefits',
    'salary', 'compensation', 'work-life', 'diversity', 'inclusion',
    'award', 'best places to work', 'great workplace', 'employer'
  ];
  
  const hasWorkplaceKeywords = workplaceKeywords.some(keyword =>
    searchText.includes(keyword)
  );
  
  return hasCompanyName && hasWorkplaceKeywords;
}

/**
 * Fetch news for companies using free RSS sources
 */
export async function fetchCompanyNewsFromRSS(companies: string[]): Promise<boolean> {
  try {
    console.log(`🔍 Fetching news for ${companies.length} companies from free RSS sources...`);
    
    const allNewsItems: RSSItem[] = [];
    
    // Fetch from all RSS sources
    for (const source of FREE_NEWS_SOURCES) {
      console.log(`📰 Fetching from ${source.name}...`);
      const items = await parseRSSFeed(source.url, source.name);
      allNewsItems.push(...items);
      
      // Add delay to be respectful to RSS servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`📊 Found ${allNewsItems.length} total news items`);
    
    // Filter news items relevant to our companies
    const relevantNews: CompanyNewsInsert[] = [];
    
    for (const company of companies) {
      const companyNews = allNewsItems.filter(item => 
        isRelevantToCompany(item, company)
      );
      
      for (const item of companyNews.slice(0, 3)) { // Limit to 3 articles per company
        relevantNews.push({
          company_name: company,
          title: item.title,
          description: item.description,
          url: item.link,
          published_at: new Date(item.pubDate).toISOString(),
          source_name: item.source,
          created_at: new Date().toISOString()
        });
      }
    }
    
    console.log(`✅ Found ${relevantNews.length} relevant news articles`);
    
    // Store in database
    if (relevantNews.length > 0) {
      const { error } = await supabase
        .from('company_news')
        .upsert(relevantNews, {
          onConflict: 'company_name,title',
          ignoreDuplicates: true
        });
      
      if (error) {
        console.error('❌ Error storing news articles:', error);
        return false;
      }
      
      console.log(`💾 Successfully stored ${relevantNews.length} news articles`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error in fetchCompanyNewsFromRSS:', error);
    return false;
  }
}

/**
 * Fallback to Google News RSS (free, no API key required)
 */
export async function fetchFromGoogleNewsRSS(companyName: string): Promise<NewsArticle[]> {
  try {
    const query = encodeURIComponent(`"${companyName}" workplace OR employee OR hiring OR culture`);
    const googleNewsRSS = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    
    const items = await parseRSSFeed(googleNewsRSS, 'Google News');
    
    return items.slice(0, 5).map(item => ({
      title: item.title,
      description: item.description,
      url: item.link,
      publishedAt: new Date(item.pubDate).toISOString(),
      source: {
        name: item.source
      }
    }));
  } catch (error) {
    console.error(`Error fetching Google News RSS for ${companyName}:`, error);
    return [];
  }
}

/**
 * Main function to replace SerpAPI functionality
 */
export async function fetchCompanyNewsWithFreeAPIs(companies: string[]): Promise<boolean> {
  console.log('🆓 Using free news sources instead of SerpAPI');
  
  // Try RSS feeds first
  const rssSuccess = await fetchCompanyNewsFromRSS(companies);
  
  // If RSS didn't find much, try Google News RSS for each company
  if (rssSuccess) {
    for (const company of companies.slice(0, 5)) { // Limit to avoid rate limiting
      const googleNews = await fetchFromGoogleNewsRSS(company);
      
      if (googleNews.length > 0) {
        const newsInserts: CompanyNewsInsert[] = googleNews.map(article => ({
          company_name: company,
          title: article.title,
          description: article.description,
          url: article.url,
          published_at: article.publishedAt,
          source_name: article.source.name,
          created_at: new Date().toISOString()
        }));
        
        await supabase
          .from('company_news')
          .upsert(newsInserts, {
            onConflict: 'company_name,title',
            ignoreDuplicates: true
          });
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return rssSuccess;
}

// Simple wrapper used by legacy scrapers to fetch articles for a single company
export async function fetchCompanyNews(company: string, max = 20) {
  const articles = await fetchFromGoogleNewsRSS(company);
  return articles.slice(0, max).map((article) => ({
    title: article.title,
    description: article.description,
    link: article.url,
    date: article.publishedAt,
    source: { name: article.source.name },
  }));
}
