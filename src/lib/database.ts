import type { Database } from '@/types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import {
  Company,
  CompanyInsert,
  CompanyUpdate,
  Review,
  ReviewInsert,
  ReviewUpdate,
  CompanyWithReviews,
} from '@/types';

// Response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: DatabaseError | null;
}

export interface ReviewLike {
  id: number;
  review_id: number;
  user_id: string;
  created_at: string;
  liked: boolean;
}

export interface DatabaseError {
  message: string;
  details?: unknown;
}

export type DatabaseResult<T> = {
  data?: T | null;
  error: DatabaseError | null;
};

export type DatabaseOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT' | 'RPC' | 'AUTH';
export type TableName = keyof Database['public']['Tables'] | 'review_likes';
export type ErrorLogDetails = {
  operation: DatabaseOperation;
  table: TableName;
  error: Error;
  details?: Record<string, any>;
  user_id?: string;
};

// Helper function to ensure ID is a number
function ensureNumericId(id: string | number): number {
  return typeof id === 'string' ? parseInt(id, 10) : id;
}

export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*');
  return { data, error };
};

export async function getCompany(id: number) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return { error: handleDatabaseError(error, 'SELECT', 'companies', { company_id: id }) };
    }
    
    return { data: data as Company, error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'SELECT', 'companies', { company_id: id }) };
  }
}

export async function getReviews(companyId?: number) {
  try {
    const query = supabase
      .from('reviews')
      .select('*, company:companies(*)');

    if (companyId) {
      query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      return { error: handleDatabaseError(error, 'SELECT', 'reviews', { company_id: companyId }) };
    }

    return { data: data as (Review & { company: Company })[], error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'SELECT', 'reviews', { company_id: companyId }) };
  }
}

export async function getReview(id: number) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, company:companies(*)')
      .eq('id', id)
      .single();

    if (error) {
      return { error: handleDatabaseError(error, 'SELECT', 'reviews', { review_id: id }) };
    }

    return { data: data as Review & { company: Company }, error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'SELECT', 'reviews', { review_id: id }) };
  }
}

export async function getLikes(reviewId: number, userId: string) {
  try {
    const { data, error } = await supabase
      .from('review_likes')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return { error: handleDatabaseError(error, 'SELECT', 'review_likes', { review_id: reviewId, user_id: userId }) };
    }

    return { data: data as ReviewLike, error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'SELECT', 'review_likes', { review_id: reviewId, user_id: userId }) };
  }
}

export async function createLike(data: Omit<ReviewLike, 'id' | 'created_at'>) {
  try {
    const { error } = await supabase
      .from('review_likes')
      .insert([{
        review_id: data.review_id,
        user_id: data.user_id,
        liked: data.liked,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      return { error: handleDatabaseError(error, 'INSERT', 'review_likes', data) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'INSERT', 'review_likes', data) };
  }
}

export async function updateLike(id: number, data: Partial<Omit<ReviewLike, 'id' | 'created_at'>>) {
  try {
    const { error } = await supabase
      .from('review_likes')
      .update({
        ...data,
        created_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return { error: handleDatabaseError(error, 'UPDATE', 'review_likes', { id, ...data }) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'UPDATE', 'review_likes', { id, ...data }) };
  }
}

export async function deleteLike(id: number) {
  try {
    const { error } = await supabase
      .from('review_likes')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: handleDatabaseError(error, 'DELETE', 'review_likes', { id }) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'DELETE', 'review_likes', { id }) };
  }
}

export const createCompany = async (data: CompanyInsert) => {
  try {
    // Omit any ID field to let Supabase auto-generate it
    const { id, ...cleanData } = data; // Ensure id is never passed to the insert
    
    const { data: company, error } = await supabase
      .from('companies')
      .insert(cleanData)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { error };
    }

    return { data: company, error: null };
  } catch (error) {
    console.error('Create company error:', error);
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : 'Failed to create company' 
      } 
    };
  }
};

export async function updateCompany(id: number, data: CompanyUpdate) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    return { error: handleDatabaseError(userError, 'AUTH', 'companies', { company_id: id }) };
  }

  if (!user) {
    return { error: handleDatabaseError(new Error('User must be authenticated to update a company'), 'AUTH', 'companies', { company_id: id }) };
  }

  try {
    // Check if user owns the company
    const { data: existingCompany, error: existingError } = await supabase
      .from('companies')
      .select('created_by')
      .eq('id', id)
      .single();

    if (existingError) {
      return { error: handleDatabaseError(existingError, 'SELECT', 'companies', { company_id: id }) };
    }

    if (!existingCompany) {
      return { error: handleDatabaseError(new Error('Company not found'), 'UPDATE', 'companies', { company_id: id }) };
    }

    if (existingCompany.created_by !== user.id) {
      return { error: handleDatabaseError(new Error('You do not have permission to update this company'), 'AUTH', 'companies', { 
        company_id: id,
        user_id: user.id,
        owner_id: existingCompany.created_by
      })};
    }

    const { error } = await supabase
      .from('companies')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return { error: handleDatabaseError(error, 'UPDATE', 'companies', { company_id: id, update_data: data }) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'UPDATE', 'companies', { company_id: id, update_data: data }) };
  }
}

export async function deleteCompany(id: number) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    return { error: handleDatabaseError(userError, 'AUTH', 'companies', { company_id: id }) };
  }

  if (!user) {
    return { error: handleDatabaseError(new Error('User must be authenticated to delete a company'), 'AUTH', 'companies', { company_id: id }) };
  }

  try {
    // Check if user owns the company
    const { data: existingCompany, error: existingError } = await supabase
      .from('companies')
      .select('created_by')
      .eq('id', id)
      .single();

    if (existingError) {
      return { error: handleDatabaseError(existingError, 'SELECT', 'companies', { company_id: id }) };
    }

    if (!existingCompany) {
      return { error: handleDatabaseError(new Error('Company not found'), 'DELETE', 'companies', { company_id: id }) };
    }

    if (existingCompany.created_by !== user.id) {
      return { error: handleDatabaseError(new Error('You do not have permission to delete this company'), 'AUTH', 'companies', { 
        company_id: id,
        user_id: user.id,
        owner_id: existingCompany.created_by
      })};
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: handleDatabaseError(error, 'DELETE', 'companies', { company_id: id }) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'DELETE', 'companies', { company_id: id }) };
  }
}

export async function createReview(data: ReviewInsert) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    return { error: handleDatabaseError(userError, 'AUTH' as DatabaseOperation, 'reviews', data) };
  }

  if (!user) {
    return { error: handleDatabaseError(new Error('User must be authenticated to create a review'), 'AUTH' as DatabaseOperation, 'reviews', data) };
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .insert([{ ...data, user_id: user.id }]);

    if (error) {
      return { error: handleDatabaseError(error, 'INSERT', 'reviews', data) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'INSERT', 'reviews', data) };
  }
}

export async function updateReview(id: number, data: ReviewUpdate) {
  try {
    const { error } = await supabase
      .from('reviews')
      .update(data)
      .eq('id', id);

    if (error) {
      return { error: handleDatabaseError(error, 'UPDATE', 'reviews', { review_id: id, update_data: data }) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'UPDATE', 'reviews', { review_id: id, update_data: data }) };
  }
}

export async function deleteReview(id: number) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: handleDatabaseError(error, 'DELETE', 'reviews', { review_id: id }) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error, 'DELETE', 'reviews', { review_id: id }) };
  }
}

// Helper function to handle database errors
const handleDatabaseError = async <T>(
  error: any,
  operation: DatabaseOperation,
  table: TableName,
  details?: Record<string, any>
): Promise<DatabaseResult<T>> => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  await dbLogError({
    operation,
    table,
    error: new Error(errorMessage),
    details,
  });
  
  return {
    data: null,
    error: new Error(errorMessage),
  };
};

// Update the error logging functions to use the correct operation type
export const dbLogError = async (details: ErrorLogDetails) => {
  const { operation, table, error, details: errorDetails, user_id } = details;
  
  try {
    await supabase.from('error_logs').insert({
      error_message: error.message,
      error_code: operation,
      metadata: errorDetails,
      user_id,
      error_stack: errorDetails?.stack as string
    });
  } catch (err) {
    console.error('Failed to log error:', err);
  }
};