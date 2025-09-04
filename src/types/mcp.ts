/**
 * TypeScript interfaces for MCP (Model Context Protocol) data structures
 * These types ensure type safety when working with MCP-enhanced queries
 */

export interface CompanyData {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  size?: string | null;
  website?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewData {
  id: number;
  company_id: number;
  title: string;
  rating: number;
  pros: string | null;
  cons: string | null;
  employment_status: string | null;
  position: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  companies?: {
    name: string;
    industry?: string;
  };
}

export interface IndustryStatistic {
  industry: string;
  average_rating: number;
  company_count: number;
  review_count: number;
  avg_industry_rating?: number; // Legacy field for backward compatibility
}

export interface LocationStatistic {
  location: string;
  average_rating: number;
  company_count: number;
  review_count: number;
}

export interface SizeStatistic {
  size: string;
  average_rating: number;
  company_count: number;
  review_count: number;
}

export interface CompanyWithReviews extends CompanyData {
  reviews: ReviewData[];
}

export interface TopRatedCompany {
  id: number;
  name: string;
  industry: string;
  location: string;
  average_rating: number;
  total_reviews: number;
  rank?: number;
}

export interface LowRatedCompany {
  id: number;
  name: string;
  industry: string;
  location: string;
  average_rating: number;
  total_reviews: number;
  rank?: number;
}

export interface RecentReview {
  id: number;
  company_id: number;
  company_name: string;
  title: string;
  rating: number;
  created_at: string;
  employment_status: string | null;
  position: string | null;
}

export interface CompanySearchResult {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  relevance_score?: number;
}

export interface AnalyticsSummary {
  total_companies: number;
  total_reviews: number;
  average_rating: number;
  top_industry: string;
  most_active_location: string;
  recent_activity_count: number;
}

export interface TrendData {
  period: string;
  review_count: number;
  average_rating: number;
  company_count: number;
}

export interface MCPQueryParams {
  limit?: number;
  offset?: number;
  industry?: string;
  location?: string;
  min_rating?: number;
  max_rating?: number;
  date_from?: string;
  date_to?: string;
  search_term?: string;
}

/**
 * Response wrapper for MCP queries
 */
export interface MCPResponse<T> {
  data: T | null;
  error: string | null;
  metadata?: {
    total_count?: number;
    page?: number;
    per_page?: number;
    execution_time?: number;
  };
}

/**
 * MCP procedure names for type safety
 */
export const MCP_PROCEDURES = {
  GET_INDUSTRY_STATISTICS: 'get_industry_statistics',
  GET_LOCATION_STATISTICS: 'get_location_statistics',
  GET_SIZE_STATISTICS: 'get_size_statistics',
  GET_TOP_RATED_COMPANIES: 'get_top_rated_companies',
  GET_LOW_RATED_COMPANIES: 'get_low_rated_companies',
  GET_RECENT_REVIEWS: 'get_recent_reviews',
  SEARCH_COMPANIES: 'search_companies',
  GET_COMPANY_ANALYTICS: 'get_company_analytics',
  GET_REVIEW_TRENDS: 'get_review_trends',
  GET_COMPANIES_WITHOUT_REVIEWS: 'get_companies_without_reviews',
} as const;

export type MCPProcedure = typeof MCP_PROCEDURES[keyof typeof MCP_PROCEDURES];
