// src/types/index.ts
import { DatabaseEnums } from '@/types/supabase';
import type { 
  Database,
  CompanyRow,
  ReviewRow,
  UserProfileRow,
  ReviewLikeRow,
  EmploymentStatus,
  ReviewStatus,
  VerificationStatus,
  Role
} from '@/types/supabase';

// Re-export database types
export type {
  Database,
  EmploymentStatus,
  ReviewStatus,
  VerificationStatus,
  Role
};

// Company size type
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';

// Industry constants and type
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

export type Industry = typeof INDUSTRIES[number];

// Extended types with additional fields
export type Company = Omit<CompanyRow, 'industry'> & {
  industry: Industry | null;
  size?: CompanySize;
};

export type Review = ReviewRow & {
  company?: Company | null;
  likes?: number;
};

export type Profile = UserProfileRow;
export type ReviewLike = ReviewLikeRow;

// Analytics types
export interface Stats {
  total_users: number;
  total_companies: number;
  total_reviews: number;
  average_rating: number;
  pending_reviews: number;
  pending_verifications: number;
}

export interface MonthlyReview {
  month: string;
  totalReviews: number;
  totalRating: number;
  averageRating: number;
}

// Type guards
export const isValidIndustry = (industry: string | null): industry is Industry => {
  return industry !== null && INDUSTRIES.includes(industry as Industry);
};

export const isValidEmploymentStatus = (status: string): status is EmploymentStatus => {
  return DatabaseEnums.employment_status.includes(status as EmploymentStatus);
};

// Utility type for form data
export type FormDataType<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};
