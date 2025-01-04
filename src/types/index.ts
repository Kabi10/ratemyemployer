// src/types/index.ts
import type { Database } from './supabase';

export type { Database } from './supabase';

// Base types from database
type BaseCompany = Database['public']['Tables']['companies']['Row'];
type BaseReview = Database['public']['Tables']['reviews']['Row'];
export type User = Database['auth']['Tables']['users']['Row'];

// Extended types with additional fields
export interface Company extends Omit<BaseCompany, 'website'> {
  industry: string;
  location: string;
  website?: string;
  size?: CompanySize;
  logo_url?: string;
  total_reviews?: number;
  average_rating?: number;
}

export interface Review extends BaseReview {
  position: string;
  employment_status: string;
  company: Company;
}

// Re-export common types
export type Industry = typeof INDUSTRIES[number];
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';
export type UserRole = Database['public']['Enums']['user_role'];
export type Role = 'user' | 'admin' | 'moderator';

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
