import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

import { CompanyFormData, ReviewFormData } from './schemas';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize the Supabase client directly
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  global: {
    fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600 } })
  }
})

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
        .insert(data)
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