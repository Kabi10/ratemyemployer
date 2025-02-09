import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'

import { CompanyFormData, ReviewFormData } from './schemas';

// Add logging to verify connection
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Initialize the Supabase client directly
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600 } })
    }
  }
);

export const handleSupabaseError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

// Type-safe database queries
export const dbQuery = {
  companies: {
    create: async (data: Database['public']['Tables']['companies']['Insert'], userId: string) => {
      return supabase
        .from('companies')
        .insert({
          ...data,
          created_by: userId,
          verification_status: 'pending',
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
    },
    update: async (id: number, data: Database['public']['Tables']['companies']['Update']) => {
      return supabase
        .from('companies')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    }
  },
  reviews: {
    create: async (data: Database['public']['Tables']['reviews']['Insert']) => {
      return supabase
        .from('reviews')
        .insert({
          ...data,
          reviewer_id: data.user_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
    },
    update: async (id: number, data: Database['public']['Tables']['reviews']['Update'], userId: string) => {
      return supabase
        .from('reviews')
        .update(data)
        .eq('id', id)
        .eq('reviewer_id', userId) // Ensure user can only update their own reviews
    }
  }
};

// Add createClient export
export const createClient = () => supabase;