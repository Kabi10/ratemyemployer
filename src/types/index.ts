import type { Database } from './supabase';

// src/types/index.ts

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

export type CompanyRow = Tables['companies']['Row'];
export type ReviewRow = Tables['reviews']['Row'];
export type UserProfileRow = Tables['user_profiles']['Row'];

export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type VerificationStatus = Enums['verification_status'];

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

// Types
export type Industry = (typeof INDUSTRIES)[number];
export type Role = 'user' | 'admin' | 'moderator';
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';

// Database-derived types
export type Company = Database['public']['Tables']['companies']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Analytics types
export type AdminStats = {
  total_users: number;
  total_companies: number;
  total_reviews: number;
  average_rating: number;
  pending_reviews: number;
  pending_verifications: number;
};

export interface MonthlyReview {
  month: string;
  totalReviews: number;
  totalRating: number;
  averageRating: number;
}

export interface ReviewLike {
  id: string;
  user_id: string;
  review_id: number;
  liked: boolean;
  created_at: string;
}

// Type guards
export const isValidIndustry = (
  industry: string | null
): industry is Industry => {
  return industry !== null && INDUSTRIES.includes(industry as Industry);
};

export const EMPLOYMENT_STATUSES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
] as const;

export const isValidEmploymentStatus = (
  status: string
): status is EmploymentStatus => {
  return EMPLOYMENT_STATUSES.includes(status as EmploymentStatus);
};

export type CompanyId = number;
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
export interface CompanyWithStats extends Company {
  average_rating?: number;
  total_reviews?: number;
  recommendation_rate?: number;
}
