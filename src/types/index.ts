// src/types/index.ts
import type { Database } from '@/types/supabase';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export type { Database } from '@/types/supabase';

// Base types from database
type BaseCompany = Database['public']['Tables']['companies']['Row'];
type BaseReview = Database['public']['Tables']['reviews']['Row'];
export type User = SupabaseAuthUser;

// Extended types with additional fields
export interface Company {
  id: number;
  name: string;
  industry: string;
  location: string;
  website?: string;
  size?: CompanySize;
  logo_url?: string;
  benefits?: string;
  company_values?: string;
  ceo?: string;
  verification_status: VerificationStatus;
  created_at: string;
  total_reviews: number;
  average_rating: number;
  updated_at?: string;
  description?: string;
  recommendation_rate?: number;
}

export interface Review {
  id: number;
  company_id: number;
  user_id: string | null;
  rating: number;
  title: string;
  content: string | null;
  pros: string;
  cons: string;
  position: string;
  employment_status: EmploymentStatus;
  created_at: string;
  status: ReviewStatus;
  reviewer_name: string | null;
  reviewer_email: string | null;
  company?: Company;
  likes?: number;
  is_current_employee: boolean;
}

// Enums
export type EmploymentStatus = Database['public']['Enums']['employment_status'];
export type ReviewStatus = Database['public']['Enums']['review_status'];
export type VerificationStatus = Database['public']['Enums']['verification_status'];
export type Role = 'user' | 'admin' | 'moderator';

// Re-export common types
export type Industry = typeof INDUSTRIES[number];
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';

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
