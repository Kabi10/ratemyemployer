import { Database } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Base table types
export interface Company {
  id: number
  name: string
  industry: string | null
  location: string | null
  website: string | null
  description: string | null
  logo_url: string | null
  average_rating: number | null
  total_reviews: number | null
  created_at: string
  updated_at: string
  metadata?: Record<string, any> | null | string | any
  recommendation_rate?: number | null
  size?: string | null
  created_by?: string | null
  ceo_rating?: number | null
  work_life_balance?: number | null
  compensation_rating?: number | null
  career_growth?: number | null
  culture_rating?: number | null
  [key: string]: any
}

export interface Review {
  id: number;
  rating: number;
  title?: string;
  content?: string;
  pros: string;
  cons: string;
  position: string;
  employment_status: EmploymentStatus;
  is_current_employee: boolean;
  company_id: number;
  user_id: string | null;
  reviewer_name?: string;
  created_at: string;
  updated_at: string | null;
  status?: ReviewStatus | null;
  recommend?: boolean | null;
}

// Mock types for missing tables in the Database type
// These will be used as fallbacks when the actual tables don't exist in the Database type
interface MockUserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string | null;
}

interface MockErrorLog {
  id: number;
  message: string;
  details: any;
  created_at: string;
  user_id: string | null;
}

// Use the actual Database types if they exist, otherwise use our mock types
export type UserProfile = MockUserProfile;
export type ErrorLog = MockErrorLog;

// Insert types
export type CompanyInsert = Omit<Company, 'id' | 'created_at' | 'updated_at'>;
export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
export type UserProfileInsert = Omit<MockUserProfile, 'id' | 'created_at' | 'updated_at'>;
export type ErrorLogInsert = Omit<MockErrorLog, 'id' | 'created_at'>;

// Update types
export type CompanyUpdate = Partial<CompanyInsert>;
export type ReviewUpdate = Partial<ReviewInsert>;
export type UserProfileUpdate = Partial<Omit<MockUserProfile, 'id' | 'created_at' | 'updated_at'>>;

// Enum types
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type RateLimitType = 'ip' | 'user';
export type EmploymentStatus = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise' | 'Startup';

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
  review_count: number;
  recommend_percentage: number;
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
  withStats?: boolean;
  withReviews?: boolean;
}

export interface GetReviewsOptions {
  status?: string;
  orderBy?: keyof Review;
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  companyId?: number | string;
  userId?: number | string;
  withCompany?: boolean;
  withLikes?: boolean;
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
  likes_count?: number;
  user_liked?: boolean;
  is_liked?: boolean;
  user_profiles?: UserProfile;
};

export type JoinedCompany = Company & {
  reviews?: Review[];
  average_rating?: number;
  total_reviews?: number;
  user_reviewed?: boolean;
};

export type DatabaseReview = Review; 
