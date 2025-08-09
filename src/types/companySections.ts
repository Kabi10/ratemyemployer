/**
 * TypeScript types for Financial Distress and Rising Startups sections
 * Comprehensive type definitions for company status tracking and indicators
 */

// Enum types matching database enums
export type CompanyStatusType = 
  | 'stable'
  | 'financial_distress'
  | 'rising_startup'
  | 'declining'
  | 'acquired'
  | 'ipo_ready';

export type DistressIndicatorType = 
  | 'layoffs'
  | 'funding_issues'
  | 'revenue_decline'
  | 'leadership_changes'
  | 'office_closures'
  | 'bankruptcy_filing'
  | 'acquisition_rumors'
  | 'stock_decline'
  | 'negative_news'
  | 'employee_exodus';

export type GrowthIndicatorType = 
  | 'funding_round'
  | 'revenue_growth'
  | 'hiring_spree'
  | 'expansion'
  | 'new_products'
  | 'partnerships'
  | 'awards'
  | 'positive_news'
  | 'ipo_preparation'
  | 'acquisition_interest';

// Database table interfaces
export interface CompanyStatusTracking {
  id: string;
  company_id: number;
  status: CompanyStatusType;
  confidence_score: number;
  last_updated: string;
  updated_by?: string;
  automated_detection: boolean;
  manual_override: boolean;
  notes?: string;
  created_at: string;
}

export interface FinancialDistressIndicator {
  id: string;
  company_id: number;
  indicator_type: DistressIndicatorType;
  severity: number; // 1-5 scale
  description: string;
  source_url?: string;
  detected_at: string;
  verified: boolean;
  verified_by?: string;
  impact_score: number; // 1-10 scale
  created_at: string;
}

export interface RisingStartupIndicator {
  id: string;
  company_id: number;
  indicator_type: GrowthIndicatorType;
  growth_score: number; // 1-10 scale
  description: string;
  source_url?: string;
  detected_at: string;
  verified: boolean;
  verified_by?: string;
  funding_amount?: number;
  valuation?: number;
  created_at: string;
}

export interface CompanyMetrics {
  id: string;
  company_id: number;
  metric_date: string;
  employee_count?: number;
  revenue_estimate?: number;
  funding_total?: number;
  valuation?: number;
  glassdoor_rating?: number;
  linkedin_followers?: number;
  news_sentiment_score?: number; // -1 to 1 scale
  review_velocity?: number; // reviews per month
  hiring_velocity?: number; // new hires per month
  created_at: string;
}

// Extended company interfaces for sections
export interface CompanyWithDistressData {
  id: number;
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  logo_url?: string;
  average_rating?: number;
  total_reviews?: number;
  distress_score: number;
  latest_indicator: string;
  indicator_count: number;
  distress_indicators: FinancialDistressIndicator[];
  status_tracking?: CompanyStatusTracking;
  metrics?: CompanyMetrics[];
}

export interface CompanyWithGrowthData {
  id: number;
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  logo_url?: string;
  average_rating?: number;
  total_reviews?: number;
  growth_score: number;
  latest_indicator: string;
  indicator_count: number;
  latest_funding?: number;
  growth_indicators: RisingStartupIndicator[];
  status_tracking?: CompanyStatusTracking;
  metrics?: CompanyMetrics[];
}

// API response types
export interface DistressCompaniesResponse {
  companies: CompanyWithDistressData[];
  total_count: number;
  average_distress_score: number;
  most_common_indicator: DistressIndicatorType;
}

export interface RisingStartupsResponse {
  companies: CompanyWithGrowthData[];
  total_count: number;
  average_growth_score: number;
  total_funding: number;
  most_common_indicator: GrowthIndicatorType;
}

// Filter and search interfaces
export interface DistressFilters {
  industry?: string;
  location?: string;
  min_distress_score?: number;
  max_distress_score?: number;
  indicator_types?: DistressIndicatorType[];
  severity_min?: number;
  severity_max?: number;
  time_range?: 'week' | 'month' | 'quarter' | 'year';
  verified_only?: boolean;
  sort_by?: 'distress_score' | 'indicator_count' | 'latest_indicator' | 'company_name';
  sort_order?: 'asc' | 'desc';
}

export interface GrowthFilters {
  industry?: string;
  location?: string;
  min_growth_score?: number;
  max_growth_score?: number;
  indicator_types?: GrowthIndicatorType[];
  min_funding?: number;
  max_funding?: number;
  time_range?: 'week' | 'month' | 'quarter' | 'year';
  verified_only?: boolean;
  sort_by?: 'growth_score' | 'indicator_count' | 'latest_funding' | 'company_name';
  sort_order?: 'asc' | 'desc';
}

// Statistics interfaces
export interface DistressStatistics {
  total_companies: number;
  average_score: number;
  by_industry: Array<{
    industry: string;
    count: number;
    average_score: number;
  }>;
  by_indicator_type: Array<{
    indicator_type: DistressIndicatorType;
    count: number;
    average_severity: number;
  }>;
  trend_data: Array<{
    date: string;
    count: number;
    average_score: number;
  }>;
}

export interface GrowthStatistics {
  total_companies: number;
  average_score: number;
  total_funding: number;
  by_industry: Array<{
    industry: string;
    count: number;
    average_score: number;
    total_funding: number;
  }>;
  by_indicator_type: Array<{
    indicator_type: GrowthIndicatorType;
    count: number;
    average_score: number;
  }>;
  trend_data: Array<{
    date: string;
    count: number;
    average_score: number;
    total_funding: number;
  }>;
}

// Form interfaces for adding indicators
export interface AddDistressIndicatorForm {
  company_id: number;
  indicator_type: DistressIndicatorType;
  severity: number;
  description: string;
  source_url?: string;
  impact_score: number;
}

export interface AddGrowthIndicatorForm {
  company_id: number;
  indicator_type: GrowthIndicatorType;
  growth_score: number;
  description: string;
  source_url?: string;
  funding_amount?: number;
  valuation?: number;
}

// Utility types
export type SectionType = 'financial_distress' | 'rising_startups';

export interface SectionConfig {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

// Constants for UI display
export const DISTRESS_INDICATOR_LABELS: Record<DistressIndicatorType, string> = {
  layoffs: 'Layoffs',
  funding_issues: 'Funding Issues',
  revenue_decline: 'Revenue Decline',
  leadership_changes: 'Leadership Changes',
  office_closures: 'Office Closures',
  bankruptcy_filing: 'Bankruptcy Filing',
  acquisition_rumors: 'Acquisition Rumors',
  stock_decline: 'Stock Decline',
  negative_news: 'Negative News',
  employee_exodus: 'Employee Exodus'
};

export const GROWTH_INDICATOR_LABELS: Record<GrowthIndicatorType, string> = {
  funding_round: 'Funding Round',
  revenue_growth: 'Revenue Growth',
  hiring_spree: 'Hiring Spree',
  expansion: 'Expansion',
  new_products: 'New Products',
  partnerships: 'Partnerships',
  awards: 'Awards',
  positive_news: 'Positive News',
  ipo_preparation: 'IPO Preparation',
  acquisition_interest: 'Acquisition Interest'
};

export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Critical'
};

export const GROWTH_SCORE_LABELS: Record<number, string> = {
  1: 'Minimal',
  2: 'Low',
  3: 'Moderate',
  4: 'Good',
  5: 'Strong',
  6: 'Very Strong',
  7: 'Excellent',
  8: 'Outstanding',
  9: 'Exceptional',
  10: 'Extraordinary'
};

// Color schemes for UI
export const DISTRESS_COLORS = {
  low: '#10B981', // green
  medium: '#F59E0B', // yellow
  high: '#EF4444', // red
  critical: '#DC2626' // dark red
};

export const GROWTH_COLORS = {
  low: '#6B7280', // gray
  medium: '#3B82F6', // blue
  high: '#10B981', // green
  exceptional: '#059669' // dark green
};

// Helper functions for score categorization
export function getDistressCategory(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export function getGrowthCategory(score: number): 'low' | 'medium' | 'high' | 'exceptional' {
  if (score >= 75) return 'exceptional';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}
