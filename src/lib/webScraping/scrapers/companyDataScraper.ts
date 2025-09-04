/**
 * Company Data Scraper
 * Scrapes comprehensive company information from various sources
 */

import { supabase } from '@/lib/supabaseClient';
import type { 
  ScrapingResult, 
  CompanyDataResult, 
  CompanyDataScraperConfig 
} from '@/types/webScraping';

export class CompanyDataScraper {
  private readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  async scrape(job: any, signal: AbortSignal): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let dataCount = 0;
    let qualityScore = 0;

    try {
      const config: CompanyDataScraperConfig = job.configuration || {};
      
      // Determine scraping strategy based on data source
      let companyData: CompanyDataResult | null = null;

      switch (job.data_source) {
        case 'company_website':
          companyData = await this.scrapeCompanyWebsite(job, config, signal);
          break;
        case 'crunchbase':
          companyData = await this.scrapeCrunchbase(job, config, signal);
          break;
        case 'linkedin':
          companyData = await this.scrapeLinkedIn(job, config, signal);
          break;
        default:
          companyData = await this.scrapeGenericSource(job, config, signal);
      }

      if (companyData) {
        // Store the scraped data
        await this.storeCompanyData(job, companyData);
        dataCount = 1;
        qualityScore = this.calculateDataQuality(companyData);

        // Create enhancements for each field
        await this.createEnhancements(job, companyData);
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
   * Scrape company website for basic information
   */
  private async scrapeCompanyWebsite(
    job: any, 
    config: CompanyDataScraperConfig, 
    signal: AbortSignal
  ): Promise<CompanyDataResult | null> {
    if (!job.target_url) {
      throw new Error('No target URL provided for company website scraping');
    }

    const response = await this.fetchWithRetry(job.target_url, signal);
    const html = await response.text();

    // Parse HTML for company information
    const companyData: CompanyDataResult = {
      company_info: {
        name: this.extractCompanyName(html),
        description: this.extractDescription(html),
        industry: this.extractIndustry(html),
        website: job.target_url,
        logo_url: this.extractLogoUrl(html, job.target_url),
        social_media: this.extractSocialMedia(html)
      }
    };

    return companyData;
  }

  /**
   * Scrape Crunchbase for company data (using public information)
   */
  private async scrapeCrunchbase(
    job: any, 
    config: CompanyDataScraperConfig, 
    signal: AbortSignal
  ): Promise<CompanyDataResult | null> {
    // Note: This would use Crunchbase's public API or publicly available data
    // For demo purposes, we'll simulate the data structure
    
    const companyData: CompanyDataResult = {
      company_info: {
        name: job.target_company_name,
        industry: 'Technology', // Would be extracted from actual data
      },
      financial_data: {
        funding: 0, // Would be extracted from actual data
        employees: 0, // Would be extracted from actual data
      }
    };

    return companyData;
  }

  /**
   * Scrape LinkedIn company page (public information only)
   */
  private async scrapeLinkedIn(
    job: any, 
    config: CompanyDataScraperConfig, 
    signal: AbortSignal
  ): Promise<CompanyDataResult | null> {
    // Note: LinkedIn has strict anti-scraping measures
    // This would only work with their official API or public data
    
    const companyData: CompanyDataResult = {
      company_info: {
        name: job.target_company_name,
        description: 'Company description from LinkedIn',
      }
    };

    return companyData;
  }

  /**
   * Generic scraper for other sources
   */
  private async scrapeGenericSource(
    job: any, 
    config: CompanyDataScraperConfig, 
    signal: AbortSignal
  ): Promise<CompanyDataResult | null> {
    if (!job.target_url) {
      return null;
    }

    const response = await this.fetchWithRetry(job.target_url, signal);
    const html = await response.text();

    return {
      company_info: {
        name: job.target_company_name || this.extractCompanyName(html),
        description: this.extractDescription(html),
        website: job.target_url
      }
    };
  }

  /**
   * Fetch URL with retry logic and rate limiting
   */
  private async fetchWithRetry(
    url: string, 
    signal: AbortSignal, 
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Random delay to avoid being detected as a bot
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

        const response = await fetch(url, {
          signal,
          headers: {
            'User-Agent': this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)],
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (signal.aborted) {
          throw new Error('Request was aborted');
        }

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Extract company name from HTML
   */
  private extractCompanyName(html: string): string | undefined {
    // Try multiple selectors for company name
    const patterns = [
      /<title[^>]*>([^<]+)/i,
      /<h1[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)/i,
      /<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="application-name"[^>]*content="([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/\s+/g, ' ');
      }
    }

    return undefined;
  }

  /**
   * Extract company description from HTML
   */
  private extractDescription(html: string): string | undefined {
    const patterns = [
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
      /<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/\s+/g, ' ');
      }
    }

    return undefined;
  }

  /**
   * Extract industry from HTML
   */
  private extractIndustry(html: string): string | undefined {
    const patterns = [
      /<meta[^>]*name="industry"[^>]*content="([^"]+)"/i,
      /<span[^>]*class="[^"]*industry[^"]*"[^>]*>([^<]+)/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract logo URL from HTML
   */
  private extractLogoUrl(html: string, baseUrl: string): string | undefined {
    const patterns = [
      /<link[^>]*rel="icon"[^>]*href="([^"]+)"/i,
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
      /<img[^>]*class="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const url = match[1];
        return url.startsWith('http') ? url : new URL(url, baseUrl).href;
      }
    }

    return undefined;
  }

  /**
   * Extract social media links from HTML
   */
  private extractSocialMedia(html: string): Record<string, string> {
    const socialMedia: Record<string, string> = {};
    
    const patterns = {
      twitter: /href="(https?:\/\/(?:www\.)?twitter\.com\/[^"]+)"/gi,
      linkedin: /href="(https?:\/\/(?:www\.)?linkedin\.com\/company\/[^"]+)"/gi,
      facebook: /href="(https?:\/\/(?:www\.)?facebook\.com\/[^"]+)"/gi,
      instagram: /href="(https?:\/\/(?:www\.)?instagram\.com\/[^"]+)"/gi
    };

    for (const [platform, pattern] of Object.entries(patterns)) {
      const match = html.match(pattern);
      if (match && match[1]) {
        socialMedia[platform] = match[1];
      }
    }

    return socialMedia;
  }

  /**
   * Store scraped company data
   */
  private async storeCompanyData(job: any, data: CompanyDataResult): Promise<void> {
    await supabase
      .from('scraped_data')
      .insert({
        scraping_job_id: job.job_id,
        company_id: job.target_company_id,
        data_type: 'company_data',
        source_url: job.target_url,
        raw_data: data,
        processed_data: data,
        confidence_score: this.calculateDataQuality(data),
        is_processed: true
      });
  }

  /**
   * Create data enhancements
   */
  private async createEnhancements(job: any, data: CompanyDataResult): Promise<void> {
    if (!job.target_company_id) return;

    const enhancements = [];

    if (data.company_info.description) {
      enhancements.push({
        company_id: job.target_company_id,
        data_source: job.data_source,
        enhancement_type: 'company_info',
        data_field: 'description',
        enhanced_value: data.company_info.description,
        confidence_score: 0.8,
        source_url: job.target_url
      });
    }

    if (data.company_info.industry) {
      enhancements.push({
        company_id: job.target_company_id,
        data_source: job.data_source,
        enhancement_type: 'company_info',
        data_field: 'industry',
        enhanced_value: data.company_info.industry,
        confidence_score: 0.7,
        source_url: job.target_url
      });
    }

    if (enhancements.length > 0) {
      await supabase
        .from('company_data_enhancements')
        .upsert(enhancements);
    }
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQuality(data: CompanyDataResult): number {
    let score = 0;
    let maxScore = 0;

    // Company info scoring
    if (data.company_info) {
      maxScore += 5;
      if (data.company_info.name) score += 1;
      if (data.company_info.description) score += 1;
      if (data.company_info.industry) score += 1;
      if (data.company_info.website) score += 1;
      if (data.company_info.logo_url) score += 1;
    }

    // Financial data scoring
    if (data.financial_data) {
      maxScore += 3;
      if (data.financial_data.revenue) score += 1;
      if (data.financial_data.employees) score += 1;
      if (data.financial_data.funding) score += 1;
    }

    return maxScore > 0 ? score / maxScore : 0;
  }
}
