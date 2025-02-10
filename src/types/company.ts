import { Database } from './supabase';
import type { Review } from '@/types/database';

export type Company = Database['public']['Tables']['companies']['Row'];

export interface CompanyWithStats extends Company {
  average_rating?: number;
  total_reviews?: number;
  recommendation_rate?: number;
}

export interface CompanyWithReviews extends CompanyWithStats {
  reviews: Review[];
}

export type CompanyId = Company['id'];

export interface JoinedCompany extends Company {
  reviews: Review[];
  average_rating?: number;
  total_reviews?: number;
  recommendation_rate?: number;
}
