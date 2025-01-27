import { Database } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Base table types
export interface Company {
  id: number
  name: string
  industry: string
  location?: string | null
  website?: string | null
  description?: string | null
  logo_url?: string | null
  average_rating?: number | null
  total_reviews?: number | null
  created_at: string
  updated_at: string
  metadata?: Record<string, any> | null
}

export interface Review {
  id: number;
  title: string;
  content: string | null;
  rating: number;
  pros: string;
  cons: string;
  position: string;
  employment_status: EmploymentStatus;
  is_current_employee: boolean;
  company_id: number;
  user_id: string | null;
  created_at: string;
  updated_at: string | null;
  status: ReviewStatus;
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type ErrorLog = Database['public']['Tables']['error_logs']['Row'];

// Insert types
export type CompanyInsert = Omit<Company, 'id' | 'created_at' | 'updated_at'>;
export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type ErrorLogInsert = Database['public']['Tables']['error_logs']['Insert'];

// Update types
export type CompanyUpdate = Partial<CompanyInsert>;
export type ReviewUpdate = Partial<ReviewInsert>;
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

// Enum types
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type RateLimitType = 'ip' | 'user';
export type EmploymentStatus = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';

// ID types
export type CompanyId = Company['id'];
export type ReviewId = Review['id'];
export type UserId = UserProfile['id'];

// Extended types with relationships
export type ReviewWithCompany = Review & {
  company: Company;
};

export type CompanyWithReviews = Company & {
  reviews: Review[];
  average_rating: number;
  total_reviews: number;
};

export type ReviewWithLikes = Review & {
  likes: number;
  user_liked?: boolean;
};

export type ReviewLike = {
  id: number;
  user_id: string;
  review_id: number;
  created_at: string;
  liked: boolean;
};

// Error handling types
export interface DatabaseError {
  message: string;
  details?: unknown;
}

export interface DatabaseResult<T> {
  data: T | null;
  error: DatabaseError | null;
}

// Function parameter types
export interface GetCompaniesOptions {
  industry?: string;
  location?: string;
  search?: string;
  orderBy?: keyof Company;
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GetReviewsOptions {
  status?: string;
  orderBy?: keyof Review;
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Helper types for Supabase
export type SupabaseQueryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

export type DatabaseOperation = 
  | 'SELECT' 
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'AUTH'
  | 'RPC'

export type TableName = 'companies' | 'reviews' | 'user_profiles' | 'error_logs' | 'review_likes';

export type ErrorLogDetails = {
  operation: DatabaseOperation;
  table: TableName;
  error: string;
  details?: Record<string, unknown>;
  user_id?: string;
  created_at?: string;
};

// Utility types
export type WithTimestamps = {
  created_at: string;
  updated_at?: string;
};

export type WithUser = {
  user_id: string;
};

export type WithCompany = {
  company_id: number;
};

// Join types
export type JoinedReview = Review & {
  company?: Company;
  likes?: number;
  user_liked?: boolean;
};

export type JoinedCompany = Company & {
  reviews?: Review[];
  average_rating?: number;
  total_reviews?: number;
  user_reviewed?: boolean;
};

export type DatabaseReview = Review; 