import type { Database } from '@/types/supabase';
import { supabase } from './supabaseClient';

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
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Auth error:', userError);
    return { error: new Error('Failed to check authentication status') };
  }

  if (!user) {
    console.error('No authenticated user found');
    return { error: new Error('User must be authenticated to create a company') };
  }

  // First check if a company with the same name already exists
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id')
    .ilike('name', data.name || '')
    .single();

  if (existingCompany) {
    return { error: new Error('A company with this name already exists') };
  }

  try {
    const { data: newCompany, error } = await supabase
      .from('companies')
      .insert([{
        ...data,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return { error: new Error(error.message) };
    }

    return { data: newCompany, error: null };
  } catch (error) {
    console.error('Error in createCompany:', error);
    return { error: new Error('Failed to create company') };
  }
}

export async function updateCompany(id: number, data: Partial<Company>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Auth error:', userError);
    return { error: new Error('Failed to check authentication status') };
  }

  if (!user) {
    console.error('No authenticated user found');
    return { error: new Error('User must be authenticated to update a company') };
  }

  // Check if user owns the company
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('created_by')
    .eq('id', id)
    .single();

  if (!existingCompany) {
    return { error: new Error('Company not found') };
  }

  if (existingCompany.created_by !== user.id) {
    return { error: new Error('You do not have permission to update this company') };
  }

  const { error } = await supabase
    .from('companies')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  return { error };
}

export async function deleteCompany(id: number) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Auth error:', userError);
    return { error: new Error('Failed to check authentication status') };
  }

  if (!user) {
    console.error('No authenticated user found');
    return { error: new Error('User must be authenticated to delete a company') };
  }

  // Check if user owns the company
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('created_by')
    .eq('id', id)
    .single();

  if (!existingCompany) {
    return { error: new Error('Company not found') };
  }

  if (existingCompany.created_by !== user.id) {
    return { error: new Error('You do not have permission to delete this company') };
  }

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