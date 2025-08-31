/**
 * Data Quality and Validation System
 * Comprehensive system for validating and ensuring quality of scraped data
 */

import { supabase } from '@/lib/supabaseClient';
import type { 
  ScrapedData, 
  DataQualityCheck, 
  CompanyDataResult, 
  ReviewResult, 
  NewsResult, 
  JobListingResult 
} from '@/types/webScraping';

export class DataQualityValidator {
  private qualityChecks: Map<string, DataQualityCheck> = new Map();

  constructor() {
    this.initializeQualityChecks();
  }

  /**
   * Initialize default quality checks
   */
  private async initializeQualityChecks(): Promise<void> {
    try {
      const { data: checks } = await supabase
        .from('data_quality_checks')
        .select('*')
        .eq('is_active', true);

      if (checks) {
        for (const check of checks) {
          this.qualityChecks.set(check.check_name, check);
        }
      }

      // Add default checks if none exist
      if (this.qualityChecks.size === 0) {
        await this.createDefaultQualityChecks();
      }

    } catch (error) {
      console.error('Error initializing quality checks:', error);
    }
  }

  /**
   * Create default quality checks
   */
  private async createDefaultQualityChecks(): Promise<void> {
    const defaultChecks = [
      {
        check_name: 'company_data_completeness',
        data_type: 'company_data',
        validation_rule: {
          required_fields: ['name'],
          optional_fields: ['description', 'industry', 'website'],
          min_optional_fields: 2
        },
        error_threshold: 0.2
      },
      {
        check_name: 'review_content_quality',
        data_type: 'employee_review',
        validation_rule: {
          min_content_length: 20,
          max_content_length: 5000,
          required_fields: ['rating', 'title', 'content'],
          rating_range: [1, 5]
        },
        error_threshold: 0.1
      },
      {
        check_name: 'news_article_validity',
        data_type: 'news_article',
        validation_rule: {
          required_fields: ['title', 'content', 'url', 'published_date'],
          min_title_length: 10,
          min_content_length: 50,
          url_pattern: '^https?://'
        },
        error_threshold: 0.15
      },
      {
        check_name: 'job_listing_completeness',
        data_type: 'job_listing',
        validation_rule: {
          required_fields: ['title', 'description', 'location'],
          min_description_length: 50,
          employment_types: ['Full-time', 'Part-time', 'Contract', 'Internship']
        },
        error_threshold: 0.2
      }
    ];

    for (const check of defaultChecks) {
      await supabase
        .from('data_quality_checks')
        .upsert(check);
      
      this.qualityChecks.set(check.check_name, (check as unknown) as DataQualityCheck);
    }
  }

  /**
   * Validate scraped data
   */
  async validateData(data: ScrapedData): Promise<{
    isValid: boolean;
    qualityScore: number;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 1.0;

    try {
      // Get appropriate quality check
      const check = this.getQualityCheckForDataType(data.data_type);
      if (!check) {
        warnings.push(`No quality check defined for data type: ${data.data_type}`);
        return { isValid: true, qualityScore: 0.5, errors, warnings };
      }

      // Validate based on data type
      switch (data.data_type) {
        case 'company_data':
          return this.validateCompanyData(data, check);
        case 'employee_review':
          return this.validateReviewData(data, check);
        case 'news_article':
          return this.validateNewsData(data, check);
        case 'job_listing':
          return this.validateJobListingData(data, check);
        default:
          return this.validateGenericData(data, check);
      }

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, qualityScore: 0, errors, warnings };
    }
  }

  /**
   * Validate company data
   */
  private validateCompanyData(data: ScrapedData, check: DataQualityCheck): {
    isValid: boolean;
    qualityScore: number;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const companyData = (data.processed_data as unknown) as CompanyDataResult;
    const rules = check.validation_rule;

    let score = 1.0;
    let requiredFieldsPresent = 0;
    let optionalFieldsPresent = 0;

    // Check required fields
    if (Array.isArray((rules as any).required_fields)) {
      for (const field of ((rules as any).required_fields as string[])) {
        if (!this.hasField(companyData, field)) {
          errors.push(`Missing required field: ${field}`);
          score -= 0.2;
        } else {
          requiredFieldsPresent++;
        }
      }
    }

    // Check optional fields
    if (Array.isArray((rules as any).optional_fields)) {
      for (const field of ((rules as any).optional_fields as string[])) {
        if (this.hasField(companyData, field)) {
          optionalFieldsPresent++;
        }
      }

      const minOptional = (rules as any).min_optional_fields ?? 0;
      if (minOptional && optionalFieldsPresent < minOptional) {
        warnings.push(`Only ${optionalFieldsPresent} of ${minOptional} recommended optional fields present`);
        score -= 0.1;
      }
    }

    // Validate company name
    if (companyData.company_info?.name) {
      if (companyData.company_info.name.length < 2) {
        errors.push('Company name too short');
        score -= 0.3;
      }
    }

    // Validate description quality
    if (companyData.company_info?.description) {
      if (companyData.company_info.description.length < 20) {
        warnings.push('Company description is very short');
        score -= 0.1;
      }
    }

    // Validate website URL
    if (companyData.company_info?.website) {
      if (!this.isValidUrl(companyData.company_info.website)) {
        errors.push('Invalid website URL format');
        score -= 0.2;
      }
    }

    const isValid = errors.length === 0;
    const qualityScore = Math.max(0, Math.min(1, score));

    return { isValid, qualityScore, errors, warnings };
  }

  /**
   * Validate review data
   */
  private validateReviewData(data: ScrapedData, check: DataQualityCheck): {
    isValid: boolean;
    qualityScore: number;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const reviewData = (data.processed_data as unknown) as ReviewResult;
    const rules = check.validation_rule;

    let score = 1.0;

    // Check required fields
    if (!reviewData.rating) {
      errors.push('Missing rating');
      score -= 0.3;
    } else {
      const range = (rules as any).rating_range as [number, number] | undefined;
      if (Array.isArray(range) && range.length === 2) {
        const [min, max] = range;
        if (reviewData.rating < min || reviewData.rating > max) {
          errors.push(`Rating ${reviewData.rating} outside valid range [${min}, ${max}]`);
          score -= 0.2;
        }
      }
    }

    if (!reviewData.title || reviewData.title.length < 5) {
      errors.push('Missing or too short review title');
      score -= 0.2;
    }

    if (!reviewData.content) {
      errors.push('Missing review content');
      score -= 0.3;
    } else {
      if (reviewData.content.length < (((rules as any).min_content_length as number | undefined) ?? 20)) {
        errors.push(`Review content too short (${reviewData.content.length} chars)`);
        score -= 0.2;
      }
      
      if (reviewData.content.length > (((rules as any).max_content_length as number | undefined) ?? 5000)) {
        warnings.push(`Review content very long (${reviewData.content.length} chars)`);
        score -= 0.1;
      }
    }

    // Check for spam indicators
    if (this.detectSpam(reviewData.content + ' ' + reviewData.title)) {
      errors.push('Content appears to be spam');
      score -= 0.5;
    }

    // Validate date
    if (reviewData.review_date) {
      const reviewDate = new Date(reviewData.review_date);
      const now = new Date();
      if (reviewDate > now) {
        errors.push('Review date is in the future');
        score -= 0.2;
      }
    }

    const isValid = errors.length === 0;
    const qualityScore = Math.max(0, Math.min(1, score));

    return { isValid, qualityScore, errors, warnings };
  }

  /**
   * Validate news data
   */
  private validateNewsData(data: ScrapedData, check: DataQualityCheck): {
    isValid: boolean;
    qualityScore: number;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const newsData = (data.processed_data as unknown) as NewsResult;
    const rules = check.validation_rule;

    let score = 1.0;

    // Check required fields
    {
      const minTitle = (((rules as any).min_title_length as number | undefined) ?? 10);
      if (!newsData.title || newsData.title.length < minTitle) {
      errors.push('Missing or too short article title');
      score -= 0.2;
      }
    }

    {
      const minContent = (((rules as any).min_content_length as number | undefined) ?? 50);
      if (!newsData.content || newsData.content.length < minContent) {
      errors.push('Missing or too short article content');
      score -= 0.3;
      }
    }

    if (!newsData.url) {
      errors.push('Missing article URL');
      score -= 0.2;
    } else {
      const urlPattern = (rules as any).url_pattern as string | undefined;
      if (urlPattern && !new RegExp(urlPattern).test(newsData.url)) {
        errors.push('Invalid URL format');
        score -= 0.2;
      }
    }

    if (!newsData.published_date) {
      errors.push('Missing publication date');
      score -= 0.1;
    } else {
      const pubDate = new Date(newsData.published_date);
      const now = new Date();
      if (pubDate > now) {
        errors.push('Publication date is in the future');
        score -= 0.2;
      }
    }

    // Check content quality
    if (newsData.content && newsData.content.length > 0) {
      const wordCount = newsData.content.split(/\s+/).length;
      if (wordCount < 50) {
        warnings.push('Article content is very short');
        score -= 0.1;
      }
    }

    const isValid = errors.length === 0;
    const qualityScore = Math.max(0, Math.min(1, score));

    return { isValid, qualityScore, errors, warnings };
  }

  /**
   * Validate job listing data
   */
  private validateJobListingData(data: ScrapedData, check: DataQualityCheck): {
    isValid: boolean;
    qualityScore: number;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const jobData = (data.processed_data as unknown) as JobListingResult;
    const rules = check.validation_rule;

    let score = 1.0;

    // Check required fields
    if (!jobData.title || jobData.title.length < 5) {
      errors.push('Missing or too short job title');
      score -= 0.2;
    }

    {
      const minDesc = (((rules as any).min_description_length as number | undefined) ?? 50);
      if (!jobData.description || jobData.description.length < minDesc) {
      errors.push('Missing or too short job description');
      score -= 0.3;
      }
    }

    if (!jobData.location) {
      errors.push('Missing job location');
      score -= 0.2;
    }

    // Validate employment type
    {
      const types = (rules as any).employment_types as string[] | undefined;
      if (types && jobData.employment_type) {
        if (!types.includes(jobData.employment_type)) {
        warnings.push(`Unusual employment type: ${jobData.employment_type}`);
        score -= 0.1;
        }
      }
    }

    // Validate posted date
    if (jobData.posted_date) {
      const postedDate = new Date(jobData.posted_date);
      const now = new Date();
      const daysSincePosted = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSincePosted > 90) {
        warnings.push('Job posting is quite old');
        score -= 0.1;
      }
    }

    const isValid = errors.length === 0;
    const qualityScore = Math.max(0, Math.min(1, score));

    return { isValid, qualityScore, errors, warnings };
  }

  /**
   * Generic data validation
   */
  private validateGenericData(data: ScrapedData, check: DataQualityCheck): {
    isValid: boolean;
    qualityScore: number;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 1.0;

    // Basic validation
    if (!data.raw_data || Object.keys(data.raw_data).length === 0) {
      errors.push('No raw data present');
      score -= 0.5;
    }

    if (!data.processed_data || Object.keys(data.processed_data).length === 0) {
      errors.push('No processed data present');
      score -= 0.3;
    }

    const isValid = errors.length === 0;
    const qualityScore = Math.max(0, Math.min(1, score));

    return { isValid, qualityScore, errors, warnings };
  }

  /**
   * Helper methods
   */
  private getQualityCheckForDataType(dataType: string): DataQualityCheck | undefined {
    for (const check of this.qualityChecks.values()) {
      if (check.data_type === dataType) {
        return check;
      }
    }
    return undefined;
  }

  private hasField(obj: any, fieldPath: string): boolean {
    const parts = fieldPath.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    return current !== null && current !== undefined && current !== '';
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private detectSpam(content: string): boolean {
    const spamIndicators = [
      /(.)\1{10,}/, // Repeated characters
      /\b(spam|fake|bot|automated)\b/i,
      /[A-Z]{20,}/, // Excessive caps
      /(.{1,10})\1{5,}/ // Repeated patterns
    ];

    return spamIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Batch validate multiple data items
   */
  async validateBatch(dataItems: ScrapedData[]): Promise<{
    validCount: number;
    invalidCount: number;
    averageQuality: number;
    results: Array<{
      id: string;
      isValid: boolean;
      qualityScore: number;
      errors: string[];
      warnings: string[];
    }>;
  }> {
    const results = [];
    let validCount = 0;
    let totalQuality = 0;

    for (const item of dataItems) {
      const validation = await this.validateData(item);
      
      results.push({
        id: item.id,
        ...validation
      });

      if (validation.isValid) {
        validCount++;
      }
      
      totalQuality += validation.qualityScore;
    }

    return {
      validCount,
      invalidCount: dataItems.length - validCount,
      averageQuality: dataItems.length > 0 ? totalQuality / dataItems.length : 0,
      results
    };
  }
}

// Export singleton instance
export const dataQualityValidator = new DataQualityValidator();
