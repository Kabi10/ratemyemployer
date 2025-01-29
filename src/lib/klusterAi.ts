import type { NewsArticle } from './newsApi';

// Get API key from environment variable
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

interface NewsResponse {
  articles: {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    sourceName: string;
  }[];
}

// Add delay between retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export async function fetchNewsWithKluster(companyName: string): Promise<NewsArticle[]> {
  if (!companyName.trim()) {
    console.error('Company name is required');
    return [];
  }

  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key is not configured');
    return [];
  }

  console.log(`Fetching news for company: ${companyName}`);
  
  let lastError: Error | null = null;
  
  // Retry loop
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        // Add exponential backoff delay for retries
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${retryDelay}ms delay...`);
        await delay(retryDelay);
      }

      console.log('Making API request to OpenRouter...');
      
      const messages = [
        {
          role: "system",
          content: "You are a news gathering assistant. Return ONLY a JSON object with an 'articles' array containing news items. Do not include any other text before or after the JSON. If no articles are found, return {\"articles\": []}."
        },
        {
          role: "user",
          content: `Find recent news articles about ${companyName} from reliable sources. Return ONLY this exact JSON format without any additional text:
{
  "articles": [
    {
      "title": "Article title here",
      "description": "Brief article description",
      "url": "Full article URL",
      "publishedAt": "2024-01-29T00:00:00Z",
      "sourceName": "News source name"
    }
  ]
}

Requirements:
- Only include real, verifiable articles from reputable sources
- Articles must be from the last 6 months
- URLs must be real and accessible
- Dates must be in ISO 8601 format
- No fictional or generated content`
        }
      ];

      const requestBody = {
        model: "anthropic/claude-2",
        messages,
        temperature: 0.3,
        max_tokens: 4000,
      };

      console.log('Request configuration:', {
        ...requestBody,
        messages: messages.map(m => ({ role: m.role, contentLength: m.content.length }))
      });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://ratemyemployer.com",
          "X-Title": "RateMyEmployer",
          "Content-Type": "application/json",
          "OR-PREFER-MODEL": "anthropic/claude-2"
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      
      // Log response headers for debugging
      console.log('Response headers:', {
        status: response.status,
        remaining: response.headers.get('x-ratelimit-remaining'),
        reset: response.headers.get('x-ratelimit-reset'),
        type: response.headers.get('content-type')
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          const resetTime = response.headers.get('x-ratelimit-reset');
          console.error('Rate limit exceeded. Reset time:', resetTime);
          throw new Error('Rate limit exceeded');
        }

        let errorDetail = '';
        try {
          const errorResponse = JSON.parse(responseText);
          errorDetail = errorResponse.error?.message || errorResponse.error || responseText;
        } catch (e) {
          errorDetail = responseText;
        }

        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          error: errorDetail
        });
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorDetail}`);
      }

      let completion;
      try {
        completion = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        console.error('Raw response:', responseText);
        throw new Error('Invalid JSON response from API');
      }

      console.log('Received response from OpenRouter:', {
        id: completion.id,
        model: completion.model,
        usage: completion.usage,
        choices: completion.choices?.map((c: any) => ({
          index: c.index,
          finish_reason: c.finish_reason,
          contentLength: c.message?.content?.length || 0
        }))
      });

      const content = completion.choices?.[0]?.message?.content;
      if (!content) {
        console.error('No content in response');
        return [];
      }

      // Extract JSON from the content if there's any text around it
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in content');
        return [];
      }

      const articles = parseNewsResponse(jsonMatch[0]);

      // Filter out articles older than 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      return articles.filter(article => {
        const articleDate = new Date(article.publishedAt);
        return articleDate >= sixMonthsAgo;
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES} failed:`, {
        name: lastError.name,
        message: lastError.message,
        stack: lastError.stack
      });

      // Don't retry on certain errors
      if (error instanceof Error) {
        const shouldNotRetry = [
          'Invalid JSON response from API',
          'OpenRouter API key is not configured'
        ].includes(error.message);

        if (shouldNotRetry) {
          console.log('Error type indicates retry would not help, stopping retry loop');
          break;
        }
      }

      // If this was the last attempt, throw the error
      if (attempt === MAX_RETRIES - 1) {
        throw lastError;
      }
    }
  }

  // If we got here without returning, all retries failed
  throw lastError || new Error('All retry attempts failed');
}

function parseNewsResponse(response: string): NewsArticle[] {
  try {
    console.log('Parsing news response');
    
    // Handle both string and parsed JSON responses
    let parsed: NewsResponse;
    try {
      parsed = typeof response === 'string' ? JSON.parse(response) : response;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', response);
      return [];
    }
    
    if (!parsed || typeof parsed !== 'object') {
      console.error('Invalid response format: not an object:', parsed);
      return [];
    }

    if (!Array.isArray(parsed.articles)) {
      console.error('Invalid response format: articles is not an array:', parsed);
      return [];
    }
    
    const articles = parsed.articles
      .map(article => {
        if (!article || typeof article !== 'object') {
          console.error('Invalid article format:', article);
          return null;
        }

        // Validate and clean article data
        const title = article.title?.trim();
        const description = article.description?.trim();
        const url = article.url?.trim();
        const publishedAt = article.publishedAt?.trim();
        const sourceName = article.sourceName?.trim();

        if (!title || !url || !publishedAt || !sourceName) {
          console.error('Missing required article fields:', { title, url, publishedAt, sourceName });
          return null;
        }

        // Validate URL format
        try {
          new URL(url);
        } catch (urlError) {
          console.error('Invalid article URL:', url);
          return null;
        }

        // Validate date format
        const date = new Date(publishedAt);
        if (isNaN(date.getTime())) {
          console.error('Invalid article date:', publishedAt);
          return null;
        }

        const validatedArticle: NewsArticle = {
          title,
          description: description || null,
          url,
          publishedAt,
          source: {
            name: sourceName
          }
        };

        return validatedArticle;
      })
      .filter((article): article is NewsArticle => article !== null);

    console.log(`Successfully parsed ${articles.length} articles`);
    return articles;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error parsing news response:', error.message);
      console.error('Raw response:', response);
    } else {
      console.error('Unknown error parsing news response');
    }
    return [];
  }
} 