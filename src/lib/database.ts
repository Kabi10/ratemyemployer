import { supabase } from './supabaseClient';
import type { Company, Review } from '@/types';

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
  const { data, error } = await supabase.from('companies').select('*').eq('id', Number(id)).single();

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
    .eq('company_id', Number(companyId));

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
  return data as unknown as (Review & { profiles: { full_name: string; avatar_url: string | null } })[];
}

export async function createReview(review: Omit<Review, 'id' | 'date'>) {
  const { data, error } = await supabase.from('reviews').insert([review]).select().single();

  if (error) throw error;
  return data as Review;
}
