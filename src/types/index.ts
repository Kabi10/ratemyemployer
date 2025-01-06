// src/types/index.ts
import { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

export type CompanyRow = Tables['companies']['Row'];
export type ReviewRow = Tables['reviews']['Row'];
export type UserProfileRow = Tables['user_profiles']['Row'];

export type EmploymentStatus = Enums['employment_status'];
export type ReviewStatus = Enums['review_status'];
export type VerificationStatus = Enums['verification_status'];

// Constants
export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Education',
  'Construction',
  'Entertainment',
  'Transportation',
  'Energy',
  'Real Estate',
  'Agriculture',
  'Other'
] as const;

// Types
export type Industry = typeof INDUSTRIES[number];
export type Role = 'user' | 'admin' | 'moderator';
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';

// Database-derived types
export type Company = Omit<CompanyRow, 'id'> & {
  id?: number;
  size?: CompanySize;
};

export type Review = Omit<ReviewRow, 'id'> & {
  id?: number;
  company?: Company;
  likes?: number;
};

export type Profile = {
  id: string;
  email: string;
  username: string | null;
  role: string | null;
  is_verified: boolean | null;
  created_at: string;
};

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

export type ReviewLike = {
  id: string;
  user_id: string;
  review_id: number;
  created_at: string;
};

// Type guards
export const isValidIndustry = (industry: string | null): industry is Industry => {
  return industry !== null && INDUSTRIES.includes(industry as Industry);
};

export const EMPLOYMENT_STATUSES = ['Full-time', 'Part-time', 'Contract', 'Intern'] as const;

export const isValidEmploymentStatus = (status: string): status is EmploymentStatus => {
  return EMPLOYMENT_STATUSES.includes(status as EmploymentStatus);
};
