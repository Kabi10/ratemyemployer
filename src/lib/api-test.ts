import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

interface ApiResponse {
  api: string;
  status: 'success' | 'error';
  data?: any;
  error?: string;
  timestamp: string;
  searchTerm?: string;
}

// Company identifiers and search terms
const SEARCH_TERMS = {
  // Keep company identifiers for comprehensive coverage
  company: ['BZAM', 'BZAM Ltd', 'The Green Organic Dutchman'],
  // Employment-related terms for filtering
  employment: ['employee', 'staff', 'workforce', 'layoff', 'hiring', 'jobs']
};

// Delay between API calls to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API response interfaces
interface MarketauxArticle {
  title: string;
  description: string;
  snippet: string;
  url: string;
  published_at: string;
  source: string;
}

interface MarketauxResponse {
  meta?: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: MarketauxArticle[];
}

async function testMarketaux(term: string) {
  try {
    console.log(`Testing Marketaux with ${term}...`);
    
    // Format date as YYYY-MM-DD
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const publishedAfter = sixMonthsAgo.toISOString().split('T')[0];
    
    // Use exact parameters that worked before
    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?` +
      new URLSearchParams({
        search: term,
        filter_entities: 'true',  // This worked before
        language: 'en',
        limit: '3',
        api_token: process.env.MARKETAUX_KEY || ''
      })
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json() as MarketauxResponse;
    
    // Log full response for debugging
    console.log('Marketaux raw response:', JSON.stringify(data, null, 2));
    
    return {
      api: 'Marketaux',
      status: 'success',
      data,
      timestamp: new Date().toISOString(),
      searchTerm: term
    } as ApiResponse;
  } catch (error: any) {
    console.error(`Marketaux API error for ${term}:`, error);
    return {
      api: 'Marketaux',
      status: 'error',
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      searchTerm: term
    } as ApiResponse;
  }
}

async function runTests() {
  console.log('Starting company news search...');
  const allResults: ApiResponse[] = [];
  
  // Use just company name
  const term = 'BZAM';
  
  // Test Marketaux
  const marketauxResult = await testMarketaux(term);
  allResults.push(marketauxResult);

  // Format results
  let output = 'BZAM News Search Results\n';
  output += '================================\n\n';
  output += `Search Term: ${term}\n`;
  output += `Search Time: ${new Date().toLocaleString()}\n\n`;
  
  // Output results
  for (const result of allResults) {
    output += `API: ${result.api}\n`;
    output += '------------------------\n';
    
    if (result.error) {
      output += `Error: ${result.error}\n`;
    } else if (result.data) {
      const articles = result.data.data;
      const totalFound = result.data.meta?.found || 0;
      
      output += `Total articles available: ${totalFound}\n`;
      output += `Articles in this batch: ${articles.length}\n\n`;
      
      if (articles.length > 0) {
        output += 'Articles:\n';
        articles.forEach((article: MarketauxArticle, index: number) => {
          output += `\n[${index + 1}] `;
          output += `${article.title}\n`;
          output += `Published: ${article.published_at}\n`;
          output += `Source: ${article.source}\n`;
          
          // Check for employment-related content
          const content = [
            article.title,
            article.description || '',
            article.snippet || ''
          ].join(' ').toLowerCase();
          
          const matchedTerms = SEARCH_TERMS.employment.filter(term => 
            content.includes(term.toLowerCase())
          );
          
          if (matchedTerms.length > 0) {
            output += `Employment Terms Found: ${matchedTerms.join(', ')}\n`;
          }
          
          output += `URL: ${article.url}\n`;
          if (article.description) {
            output += `Summary: ${article.description}\n`;
          }
          output += '\n';
        });
      }
    }
    output += '\n------------------------\n\n';
  }

  // Save results
  const filename = `bzam-news-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
  await fs.writeFile(filename, output, 'utf8');
  console.log(`Results saved to ${filename}`);
  
  return allResults;
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
} 