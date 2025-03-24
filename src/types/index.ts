import type { Database } from './supabase';
import { UserProfile } from './database';


// src/types/index.ts

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

export type CompanyRow = Tables['companies']['Row'];
export type ReviewRow = Tables['reviews']['Row'];
export type UserProfileRow = UserProfile;

export type EmploymentStatus = typeof EMPLOYMENT_STATUSES[number];
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Constants
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Manufacturing',
  'Retail',
  'Other'
] as const;

// Types
export type Industry = typeof INDUSTRIES[number];
export type Role = 'user' | 'moderator' | 'admin';
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise' | 'Startup';

// Database-derived types
export type Company = Database['public']['Tables']['companies']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Profile = UserProfile;

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

export const EMPLOYMENT_STATUSES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN'
] as const;

export const isValidEmploymentStatus = (status: string): status is EmploymentStatus => {
  return EMPLOYMENT_STATUSES.includes(status as EmploymentStatus);
};

export interface RoleChange {
  id: string;
  user_id: string;
  changed_by: string;
  user_email: string;
  changed_by_email: string;
  previous_role: Role;
  new_role: Role;
  reason: string | null;
  created_at: string;
}