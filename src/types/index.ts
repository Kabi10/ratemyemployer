// src/types/index.ts
import type { Database } from './supabase';

export type { Database } from './supabase';
export type Company = Database['public']['Tables']['companies']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type User = Database['auth']['Tables']['users']['Row'];

// Re-export common types
export type Industry = 'Technology' | 'Finance' | 'Healthcare' | 'Retail' | 'Manufacturing';
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';
export type UserRole = Database['public']['Enums']['user_role'];

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
