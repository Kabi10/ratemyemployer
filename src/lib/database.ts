import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type Company = Database['public']['Tables']['companies']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ReviewLike {
  id: number;
  review_id: number;
  user_id: string;
  created_at: string;
  liked: boolean;
}

interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: Partial<Company>;
        Update: Partial<Company>;
      };
      reviews: {
        Row: Omit<Review, 'company'>;
        Insert: Partial<Omit<Review, 'company'>>;
        Update: Partial<Omit<Review, 'company'>>;
      };
      review_likes: {
        Row: ReviewLike;
        Insert: Partial<ReviewLike>;
        Update: Partial<ReviewLike>;
      };
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*');
  return { data, error };
}

export async function getCompany(id: number) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function getReviews(companyId?: number) {
  const query = supabase
    .from('reviews')
    .select('*, company:companies(*)');

  if (companyId) {
    query.eq('company_id', companyId);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getReview(id: number) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, company:companies(*)')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function getLikes(reviewId: number, userId: string) {
  const { data, error } = await supabase
    .from('review_likes')
    .select('*')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .single();

  return {
    data: data as ReviewLike | null,
    error
  };
}

export async function createLike(data: Partial<ReviewLike>) {
  const { error } = await supabase
    .from('review_likes')
    .insert([{
      id: data.id,
      review_id: data.review_id,
      user_id: data.user_id,
      created_at: new Date().toISOString(),
      liked: data.liked
    }]);

  return { error };
}

export async function updateLike(data: Partial<ReviewLike>) {
  const { error } = await supabase
    .from('review_likes')
    .update({
      id: data.id,
      review_id: data.review_id,
      user_id: data.user_id,
      created_at: new Date().toISOString(),
      liked: data.liked
    })
    .eq('id', data.id!);

  return { error };
}

export async function deleteLike(id: number) {
  const { error } = await supabase
    .from('review_likes')
    .delete()
    .eq('id', id);

  return { error };
}

export async function createCompany(data: Partial<Company>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: new Error('User must be authenticated to create a company') };
  }

  const { error } = await supabase
    .from('companies')
    .insert([{ ...data, created_by: user.id }]);
  return { error };
}

export async function updateCompany(id: number, data: Partial<Company>) {
  const { error } = await supabase
    .from('companies')
    .update(data)
    .eq('id', id);
  return { error };
}

export async function deleteCompany(id: number) {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);
  return { error };
}

export async function createReview(data: Partial<Review>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: new Error('User must be authenticated to create a review') };
  }

  const { error } = await supabase
    .from('reviews')
    .insert([{ ...data, user_id: user.id }]);
  return { error };
}

export async function updateReview(id: number, data: Partial<Review>) {
  const { error } = await supabase
    .from('reviews')
    .update(data)
    .eq('id', id);
  return { error };
}

export async function deleteReview(id: number) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  return { error };
}