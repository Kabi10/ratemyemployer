import { supabase } from './supabaseClient';
import type { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type Company = Tables['companies']['Row'];
type Review = Tables['reviews']['Row'];
type ReviewLike = Tables['review_likes']['Row'];

export async function getCompanies(options: {
  search?: string;
  industry?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
}) {
  let query = supabase.from('companies').select('*').order('average_rating', { ascending: false });

  if (options.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  if (options.industry) {
    query = query.eq('industry', options.industry);
  }

  if (options.minRating) {
    query = query.gte('average_rating', options.minRating);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Company[];
}

export async function getCompanyById(id: string) {
  const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();

  if (error) throw error;
  return data as Company;
}

export async function getCompanyReviews(
  companyId: string,
  options: {
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'rating' | 'likes';
    order?: 'asc' | 'desc';
  }
) {
  let query = supabase
    .from('reviews')
    .select(
      `
      *,
      user_profiles:user_id (
        username,
        email
      )
    `
    )
    .eq('company_id', companyId);

  if (options.sortBy) {
    query = query.order(options.sortBy, { ascending: options.order === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Review[];
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        ...review,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

export async function toggleReviewLike(reviewId: string, userId: string) {
  // First, check if a like record exists
  const { data: existingLike, error: likeError } = await supabase
    .from('review_likes')
    .select('*')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .single();

  if (likeError && likeError.code !== 'PGRST116') throw likeError;

  if (existingLike) {
    // Toggle the existing like
    const { data, error } = await supabase
      .from('review_likes')
      .update({ liked: !existingLike.liked })
      .eq('id', existingLike.id)
      .select()
      .single();

    if (error) throw error;
    return data as ReviewLike;
  } else {
    // Create a new like
    const { data, error } = await supabase
      .from('review_likes')
      .insert([
        {
          review_id: reviewId,
          user_id: userId,
          liked: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as ReviewLike;
  }
}
