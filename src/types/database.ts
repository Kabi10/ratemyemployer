import type { Database } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Base table types
export type Company = Database['public']['Tables']['companies']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type ErrorLog = Database['public']['Tables']['error_logs']['Row'];
export type ReviewLike = Database['public']['Tables']['review_likes']['Row'];

// Insert types
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type UserProfileInsert =
  Database['public']['Tables']['user_profiles']['Insert'];
export type ErrorLogInsert =
  Database['public']['Tables']['error_logs']['Insert'];
export type ReviewLikeInsert =
  Database['public']['Tables']['review_likes']['Insert'];

// Update types
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];
export type UserProfileUpdate =
  Database['public']['Tables']['user_profiles']['Update'];
export type ReviewLikeUpdate =
  Database['public']['Tables']['review_likes']['Update'];

// Enum types
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type RateLimitType = 'ip' | 'user';
export type EmploymentStatus = 'current' | 'former';
export type CompanySize = 'small' | 'medium' | 'large';

// ID types
export type CompanyId = number;
export type ReviewId = number;
export type UserId = string;

// Extended types with relationships
export interface ReviewWithCompany extends Review {
  company?: Company;
}

export interface CompanyWithReviews extends Company {
  reviews?: Review[];
  average_rating?: number;
  total_reviews?: number;
}

export interface ReviewWithLikes extends Review {
  likes?: number;
  user_liked?: boolean;
}

export interface ReviewLike {
  id: string;
  user_id: string;
  review_id: number;
  liked: boolean;
  created_at: string;
}

// Error handling types
export interface DatabaseError {
  message: string;
  details?: unknown;
}

export interface DatabaseResult<T> {
  data?: T | null;
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
  companyId?: number;
  userId?: string;
  status?: ReviewStatus;
  orderBy?: keyof Review;
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  withCompany?: boolean;
  withLikes?: boolean;
}

// Helper types for Supabase
export interface SupabaseQueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export type DatabaseOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
export type TableName =
  | 'companies'
  | 'reviews'
  | 'user_profiles'
  | 'error_logs'
  | 'review_likes';

export interface ErrorLogDetails {
  operation: DatabaseOperation;
  table: TableName;
  error: string;
  details?: Record<string, unknown>;
  user_id?: string;
  created_at?: string;
}

// Utility types
export interface WithTimestamps {
  created_at: string;
  updated_at?: string;
}

export interface WithUser {
  user_id: string;
}

export interface WithCompany {
  company_id: number;
}

export interface ExtendedDatabase extends Database {
  public: {
    Tables: Database['public']['Tables'] & {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      error_logs: {
        Row: {
          id: number;
          message: string;
          stack: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          message: string;
          stack?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          message?: string;
          stack?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      review_likes: {
        Row: {
          id: string;
          user_id: string;
          review_id: number;
          liked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          review_id: number;
          liked: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          review_id?: number;
          liked?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'] & {
      review_likes: {
        id: string;
        user_id: string;
        review_id: number;
        liked: boolean;
        created_at: string;
      };
    };
  };
}
