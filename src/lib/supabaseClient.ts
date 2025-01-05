import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { CompanyFormData, ReviewFormData } from './schemas';

// Create a singleton instance
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create typed client with minimal configuration
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Error handling utility
export const handleSupabaseError = (error: unknown): string => {
  console.error('Supabase error:', error);
  
  if (error instanceof Error) {
    // Handle rate limit errors
    if (error.message.includes('rate limit')) {
      return 'You have reached the maximum number of submissions for today. Please try again tomorrow.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Type-safe database queries
export const dbQuery = {
  companies: {
    create: async (data: CompanyFormData, userId: string) => {
      const client = createClient();
      return client
        .from('companies')
        .insert([{ 
          ...data, 
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
    },
    update: async (id: string | number, data: Partial<CompanyFormData>) => {
      const client = createClient();
      return client
        .from('companies')
        .update({ 
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }
  },
  reviews: {
    create: async (data: ReviewFormData, userId: string) => {
      const client = createClient();
      return client
        .from('reviews')
        .insert([{
          ...data,
          user_id: userId,
          created_at: new Date().toISOString(),
          status: 'pending'
        }])
        .select()
        .single();
    },
    update: async (id: string | number, data: Partial<ReviewFormData>, userId: string) => {
      const client = createClient();
      return client
        .from('reviews')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId); // Ensure user can only update their own reviews
    }
  }
}; 