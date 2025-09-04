import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

import { CompanyFormData, ReviewFormData } from './schemas';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required');
  console.error('💡 Please set up your environment variables:');
  console.error('   - For local development: Start Supabase with "npx supabase start"');
  console.error('   - For production: Set NEXT_PUBLIC_SUPABASE_URL in your environment');
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  console.error('💡 Please set up your environment variables:');
  console.error('   - For local development: Start Supabase with "npx supabase start"');
  console.error('   - For production: Set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment');
}

// Initialize the Supabase client with validation
export const supabase = createSupabaseClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600 } })
    }
  }
)

export const handleSupabaseError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Get configuration status for debugging
export const getSupabaseConfig = () => {
  return {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?
      process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, '') : 'Not set',
    isConfigured: isSupabaseConfigured()
  };
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

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};

export default createClient;