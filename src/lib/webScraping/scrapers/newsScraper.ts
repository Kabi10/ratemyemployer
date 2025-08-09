/**
 * News Scraper
 * Scrapes news articles and company mentions from various news sources
 */

import { supabase } from '@/lib/supabaseClient';
import { fetchCompanyNews } from '@/lib/freeNewsApi';
import type { 
  ScrapingResult, 
  NewsResult, 
  NewsScraperConfig 
} from '@/types/webScraping';

export class NewsScraper {
  private readonly NEWS_SOURCES = [
    'techcrunch.com',
    'reuters.com',
    'bloomberg.com',
    'wsj.com',
    'forbes.com',
    'businessinsider.com',
    'cnbc.com',
    'venturebeat.com'
  ];

  async scrape(job: any, signal: AbortSignal): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let dataCount = 0;
    let qualityScore = 0;

    try {
      const config: NewsScraperConfig = job.configuration || {};
      const companyName = job.target_company_name;

      if (!companyName) {
        throw new Error('Company name is required for news scraping');
      }

      // Fetch news articles using the existing RSS system
      const articles = await this.fetchNewsArticles(companyName, config, signal);

      if (articles.length > 0) {
        // Process and store articles
        for (const article of articles) {
          if (signal.aborted) break;

          try {
            // Enhance article with sentiment analysis
            const enhancedArticle = await this.enhanceArticle(article, companyName);
            
            // Store the article
            await this.storeNewsArticle(job, enhancedArticle);
            dataCount++;

          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            warnings.push(`Failed to process article: ${errorMsg}`);
          }
        }

        qualityScore = this.calculateNewsQuality(articles);
      }

      return {
        success: true,
        data_count: dataCount,
        errors,
        warnings,
        processing_time_ms: Date.now() - startTime,
        data_quality_score: qualityScore
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      return {
        success: false,
        data_count: dataCount,
        errors,
        warnings,
        processing_time_ms: Date.now() - startTime,
        data_quality_score: 0
      };
    }
  }

  /**
   * Fetch news articles for a company
   */
  private async fetchNewsArticles(
    companyName: string, 
    config: NewsScraperConfig, 
    signal: AbortSignal
  ): Promise<NewsResult[]> {
    const articles: NewsResult[] = [];

    try {
      // Use the existing RSS news fetching system
      const rssArticles = await fetchCompanyNews(companyName, config.max_articles || 20);

      for (const rssArticle of rssArticles) {
        if (signal.aborted) break;

        const article: NewsResult = {
          title: rssArticle.title || '',
          content: rssArticle.description || '',
          url: rssArticle.link || '',
          published_date: rssArticle.date || new Date().toISOString(),
          source: rssArticle.source?.name || 'Unknown',
          keywords: this.extractKeywords(rssArticle.title + ' ' + rssArticle.description, companyName),
          relevance_score: this.calculateRelevanceScore(rssArticle, companyName)
        };

        articles.push(article);
      }

      // Filter by date range if specified
      if (config.date_range) {
        const startDate = new Date(config.date_range.start);
        const endDate = new Date(config.date_range.end);

        return articles.filter(article => {
          const articleDate = new Date(article.published_date);
          return articleDate >= startDate && articleDate <= endDate;
        });
      }

      return articles;

    } catch (error) {
      console.error('Error fetching news articles:', error);
      return [];
    }
  }

  /**
   * Enhance article with additional analysis
   */
  private async enhanceArticle(article: NewsResult, companyName: string): Promise<NewsResult> {
    // Add sentiment analysis
    article.sentiment_score = this.analyzeSentiment(article.title + ' ' + article.content);

    // Generate summary if content is long
    if (article.content.length > 500) {
      article.summary = this.generateSummary(article.content);
    }

    // Enhance keywords
    article.keywords = this.extractKeywords(
      article.title + ' ' + article.content, 
      companyName
    );

    return article;
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text: string): number {
    const positiveWords = [
      'growth', 'success', 'profit', 'expansion', 'innovation', 'award', 'achievement',
      'breakthrough', 'partnership', 'funding', 'investment', 'launch', 'milestone',
      'excellent', 'outstanding', 'impressive', 'strong', 'positive', 'good'
    ];

    const negativeWords = [
      'loss', 'decline', 'failure', 'bankruptcy', 'layoff', 'scandal', 'investigation',
      'lawsuit', 'controversy', 'crisis', 'problem', 'issue', 'concern', 'warning',
      'poor', 'bad', 'terrible', 'weak', 'negative', 'disappointing'
    ];

    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    }

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 0;

    // Return score between -1 and 1
    return (positiveCount - negativeCount) / totalSentimentWords;
  }

  /**
   * Generate article summary
   */
  private generateSummary(content: string): string {
    // Simple extractive summarization - take first few sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string, companyName: string): string[] {
    const keywords = new Set<string>();
    
    // Add company name variations
    keywords.add(companyName.toLowerCase());
    
    // Common business keywords
    const businessKeywords = [
      'revenue', 'profit', 'growth', 'expansion', 'funding', 'investment',
      'partnership', 'acquisition', 'merger', 'ipo', 'layoffs', 'hiring',
      'product', 'service', 'technology', 'innovation', 'market', 'industry'
    ];

    const words = text.toLowerCase().split(/\W+/);
    
    for (const word of words) {
      if (word.length > 3 && businessKeywords.includes(word)) {
        keywords.add(word);
      }
    }

    return Array.from(keywords);
  }

  /**
   * Calculate relevance score for an article
   */
  private calculateRelevanceScore(article: any, companyName: string): number {
    let score = 0;
    const text = (article.title + ' ' + article.description).toLowerCase();
    const company = companyName.toLowerCase();

    // Company name mentions
    const companyMentions = (text.match(new RegExp(company, 'g')) || []).length;
    score += Math.min(companyMentions * 0.3, 1.0);

    // Title relevance
    if (article.title?.toLowerCase().includes(company)) {
      score += 0.5;
    }

    // Source credibility
    const source = article.source?.name?.toLowerCase() || '';
    if (this.NEWS_SOURCES.some(s => source.includes(s.replace('.com', '')))) {
      score += 0.2;
    }

    // Recency bonus
    const articleDate = new Date(article.date || Date.now());
    const daysSincePublished = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished <= 7) {
      score += 0.2;
    } else if (daysSincePublished <= 30) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Store news article in database
   */
  private async storeNewsArticle(job: any, article: NewsResult): Promise<void> {
    // Store in scraped_data table
    await supabase
      .from('scraped_data')
      .insert({
        scraping_job_id: job.job_id,
        company_id: job.target_company_id,
        data_type: 'news_article',
        source_url: article.url,
        raw_data: article,
        processed_data: {
          ...article,
          processed_at: new Date().toISOString()
        },
        confidence_score: article.relevance_score || 0.5,
        is_processed: true,
        data_hash: this.generateArticleHash(article)
      });

    // Also store in company_news table if it exists
    try {
      await supabase
        .from('company_news')
        .insert({
          company_name: job.target_company_name,
          title: article.title,
          description: article.summary || article.content.substring(0, 500),
          url: article.url,
          published_at: article.published_date,
          source_name: article.source
        });
    } catch (error) {
      // company_news table might not exist, that's okay
      console.log('Note: company_news table not available');
    }
  }

  /**
   * Generate hash for article deduplication
   */
  private generateArticleHash(article: NewsResult): string {
    const content = article.title + article.url + article.published_date;
    return Buffer.from(content).toString('base64').substring(0, 32);
  }

  /**
   * Calculate overall news quality score
   */
  private calculateNewsQuality(articles: NewsResult[]): number {
    if (articles.length === 0) return 0;

    let totalScore = 0;
    let scoredArticles = 0;

    for (const article of articles) {
      let articleScore = 0;
      let maxScore = 0;

      // Title quality
      maxScore += 1;
      if (article.title && article.title.length > 10) articleScore += 1;

      // Content quality
      maxScore += 1;
      if (article.content && article.content.length > 50) articleScore += 1;

      // Source quality
      maxScore += 1;
      if (article.source && article.source !== 'Unknown') articleScore += 1;

      // URL quality
      maxScore += 1;
      if (article.url && article.url.startsWith('http')) articleScore += 1;

      // Date quality
      maxScore += 1;
      if (article.published_date) articleScore += 1;

      // Relevance score
      maxScore += 1;
      if (article.relevance_score && article.relevance_score > 0.5) articleScore += 1;

      if (maxScore > 0) {
        totalScore += articleScore / maxScore;
        scoredArticles++;
      }
    }

    return scoredArticles > 0 ? totalScore / scoredArticles : 0;
  }
}
