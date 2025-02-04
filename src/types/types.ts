import { Database } from './supabase';

// Base types from database
type Tables = Database['public']['Tables'];
export type Company = Tables['companies']['Row'];
export type Review = Tables['reviews']['Row'];

// Extended types
export interface CompanyWithStats extends Company {
  average_rating?: number;
  total_reviews?: number;
  recommendation_rate?: number;
}

export interface CompanyWithReviews extends CompanyWithStats {
  reviews: Review[];
}

export interface ReviewWithCompany extends Review {
  company?: Company;
}

export interface CompanyWithShameData extends CompanyWithStats {
  shame_score: number;
  recent_reviews?: Review[];
}

// Form Data Types
export type CompanyFormData = {
  name: string;
  industry: string;
  location?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  size?: string;
  ceo?: string;
  company_values?: string;
  benefits?: string;
};

export type ReviewFormData = {
  title: string;
  rating: number;
  company_id: number;
  pros: string;
  cons: string;
  employment_status?: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  is_current_employee?: boolean;
  position?: string;
  reviewer_email?: string;
  reviewer_name?: string;
  reviewer_id?: string;
  status?: string;
};

// Utility types
export type CompanyId = number;
export type ReviewId = number;

// Constants
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Manufacturing',
  'Retail',
  'Other',
] as const;

export type Industry = typeof INDUSTRIES[number];

// Re-export types from supabase.ts
export type { Database } from './supabase'; 