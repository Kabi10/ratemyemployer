/**
 * TypeScript types for Web Scraping Infrastructure
 * Comprehensive type definitions for automated data collection and enhancement
 */

// Enum types matching database enums
export type ScrapingStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled';

export type ScraperType = 
  | 'company_data'
  | 'job_listings'
  | 'reviews'
  | 'news'
  | 'social_media'
  | 'financial_data'
  | 'employee_data'
  | 'glassdoor'
  | 'linkedin'
  | 'indeed'
  | 'custom';

export type DataSource = 
  | 'glassdoor'
  | 'indeed'
  | 'linkedin'
  | 'crunchbase'
  | 'company_website'
  | 'news_sites'
  | 'social_media'
  | 'government_data'
  | 'financial_apis'
  | 'job_boards'
  | 'review_sites'
  | 'custom_api';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Database table interfaces
export interface ScrapingJob {
  id: string;
  job_name: string;
  scraper_type: ScraperType;
  data_source: DataSource;
  target_url?: string;
  target_company_id?: number;
  target_company_name?: string;
  status: ScrapingStatus;
  priority: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  configuration: Record<string, any>;
  results_summary: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapedData {
  id: string;
  scraping_job_id: string;
  company_id?: number;
  data_type: string;
  source_url?: string;
  raw_data: Record<string, any>;
  processed_data: Record<string, any>;
  data_hash?: string;
  confidence_score: number;
  is_processed: boolean;
  is_validated: boolean;
  validation_notes?: string;
  scraped_at: string;
  created_at: string;
}

export interface CompanyDataEnhancement {
  id: string;
  company_id: number;
  data_source: DataSource;
  enhancement_type: string;
  data_field: string;
  original_value?: string;
  enhanced_value: string;
  confidence_score: number;
  source_url?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapingRateLimit {
  id: string;
  data_source: DataSource;
  endpoint?: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  current_minute_count: number;
  current_hour_count: number;
  current_day_count: number;
  last_request_at?: string;
  reset_minute_at: string;
  reset_hour_at: string;
  reset_day_at: string;
  is_blocked: boolean;
  blocked_until?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapingLog {
  id: string;
  scraping_job_id: string;
  log_level: LogLevel;
  message: string;
  details: Record<string, any>;
  url?: string;
  response_code?: number;
  response_time_ms?: number;
  created_at: string;
}

export interface DataQualityCheck {
  id: string;
  check_name: string;
  data_type: string;
  validation_rule: Record<string, any>;
  error_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RobotsTxtCache {
  id: string;
  domain: string;
  robots_content?: string;
  crawl_delay: number;
  allowed_paths: string[];
  disallowed_paths: string[];
  last_fetched: string;
  expires_at: string;
  created_at: string;
}

// Configuration interfaces for different scraper types
export interface CompanyDataScraperConfig {
  fields_to_scrape: string[];
  max_pages?: number;
  include_subsidiaries?: boolean;
  verify_data?: boolean;
}

export interface ReviewScraperConfig {
  max_reviews?: number;
  min_rating?: number;
  max_rating?: number;
  date_range?: {
    start: string;
    end: string;
  };
  include_responses?: boolean;
}

export interface NewsScraperConfig {
  keywords: string[];
  max_articles?: number;
  date_range?: {
    start: string;
    end: string;
  };
  sentiment_analysis?: boolean;
}

export interface JobListingsScraperConfig {
  job_types?: string[];
  locations?: string[];
  max_listings?: number;
  include_salary?: boolean;
  include_benefits?: boolean;
}

// Scraper result interfaces
export interface ScrapingResult {
  success: boolean;
  data_count: number;
  errors: string[];
  warnings: string[];
  processing_time_ms: number;
  data_quality_score: number;
}

export interface CompanyDataResult {
  company_info: {
    name?: string;
    description?: string;
    industry?: string;
    size?: string;
    founded_year?: number;
    headquarters?: string;
    website?: string;
    logo_url?: string;
    social_media?: Record<string, string>;
  };
  financial_data?: {
    revenue?: number;
    employees?: number;
    funding?: number;
    valuation?: number;
  };
  ratings?: {
    overall_rating?: number;
    culture_rating?: number;
    compensation_rating?: number;
    work_life_balance?: number;
    career_opportunities?: number;
  };
}

export interface ReviewResult {
  review_id?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
  position?: string;
  location?: string;
  employment_status?: string;
  is_current_employee?: boolean;
  review_date: string;
  helpful_count?: number;
  verified?: boolean;
}

export interface NewsResult {
  title: string;
  content: string;
  summary?: string;
  url: string;
  published_date: string;
  author?: string;
  source: string;
  sentiment_score?: number;
  relevance_score?: number;
  keywords: string[];
}

export interface JobListingResult {
  title: string;
  description: string;
  location: string;
  employment_type: string;
  salary_range?: string;
  benefits?: string[];
  requirements: string[];
  posted_date: string;
  application_url?: string;
  remote_allowed?: boolean;
}

// API request/response interfaces
export interface CreateScrapingJobRequest {
  job_name: string;
  scraper_type: ScraperType;
  data_source: DataSource;
  target_url?: string;
  target_company_id?: number;
  target_company_name?: string;
  priority?: number;
  scheduled_at?: string;
  configuration?: Record<string, any>;
}

export interface ScrapingJobResponse {
  job: ScrapingJob;
  estimated_completion?: string;
  rate_limit_status?: {
    can_proceed: boolean;
    next_available?: string;
  };
}

export interface ScrapingStatsResponse {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  pending_jobs: number;
  average_completion_time: number;
  success_rate: number;
  data_quality_average: number;
  by_source: Array<{
    source: DataSource;
    job_count: number;
    success_rate: number;
  }>;
}

// Utility types
export type ScrapingJobFilter = {
  status?: ScrapingStatus;
  scraper_type?: ScraperType;
  data_source?: DataSource;
  company_id?: number;
  date_range?: {
    start: string;
    end: string;
  };
};

export type DataEnhancementFilter = {
  company_id?: number;
  data_source?: DataSource;
  enhancement_type?: string;
  is_verified?: boolean;
  confidence_threshold?: number;
};

// Constants for UI display
export const SCRAPER_TYPE_LABELS: Record<ScraperType, string> = {
  company_data: 'Company Data',
  job_listings: 'Job Listings',
  reviews: 'Employee Reviews',
  news: 'News Articles',
  social_media: 'Social Media',
  financial_data: 'Financial Data',
  employee_data: 'Employee Data',
  glassdoor: 'Glassdoor',
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  custom: 'Custom Scraper'
};

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  glassdoor: 'Glassdoor',
  indeed: 'Indeed',
  linkedin: 'LinkedIn',
  crunchbase: 'Crunchbase',
  company_website: 'Company Website',
  news_sites: 'News Sites',
  social_media: 'Social Media',
  government_data: 'Government Data',
  financial_apis: 'Financial APIs',
  job_boards: 'Job Boards',
  review_sites: 'Review Sites',
  custom_api: 'Custom API'
};

export const STATUS_LABELS: Record<ScrapingStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  paused: 'Paused',
  cancelled: 'Cancelled'
};

// Color schemes for UI
export const STATUS_COLORS: Record<ScrapingStatus, string> = {
  pending: '#6B7280', // gray
  running: '#3B82F6', // blue
  completed: '#10B981', // green
  failed: '#EF4444', // red
  paused: '#F59E0B', // yellow
  cancelled: '#6B7280' // gray
};

// Helper functions
export function getStatusColor(status: ScrapingStatus): string {
  return STATUS_COLORS[status];
}

export function getDataQualityLevel(score: number): 'low' | 'medium' | 'high' | 'excellent' {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.7) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

export function calculateSuccessRate(completed: number, failed: number): number {
  const total = completed + failed;
  return total > 0 ? (completed / total) * 100 : 0;
}
