import { supabase } from './supabaseClient';
import type { Company, Review, ReviewLike } from '@/types/database';

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
  const { data: _company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (companyError) throw companyError;
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
  return data as (Review & { profiles: { full_name: string; avatar_url: string | null } })[];
}

export async function createReview(review: Omit<Review, 'id' | 'date'>) {
  const { data, error } = await supabase.from('reviews').insert([review]).select().single();

  if (error) throw error;
  return data as Review;
}

export async function toggleReviewLike(reviewId: string, userId: string) {
  // First, check if a like record exists
  const { data: existingLike } = await supabase
    .from('review_likes')
    .select('*')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .single();

  if (existingLike) {
    // Toggle the existing like
    const { data, error } = await supabase
      .from('review_likes')
      .update({ liked: !existingLike.liked })
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as ReviewLike;
  } else {
    // Create a new like
    const { data, error } = await supabase
      .from('review_likes')
      .insert([{ review_id: reviewId, user_id: userId, liked: true }])
      .select()
      .single();

    if (error) throw error;
    return data as ReviewLike;
  }
}
