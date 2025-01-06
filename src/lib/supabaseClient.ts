import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { CompanyFormData, ReviewFormData } from './schemas';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined'
  );
}

// Create a singleton instance with proper configuration
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  }
);

// Use the singleton instance instead of creating new ones
export const createClient = () => supabase;

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
      const { description, industry, location, name, logo_url, verification_status, verified, website } = data;
      return supabase
        .from('companies')
        .insert({
          description,
          industry,
          location,
          name,
          logo_url,
          verification_status,
          verified,
          website,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    },
    update: async (id: string | number, data: Partial<CompanyFormData>) => {
      const { description, industry, location, name, logo_url, verification_status, verified, website } = data;
      return supabase
        .from('companies')
        .update({
          description,
          industry,
          location,
          name,
          logo_url,
          verification_status,
          verified,
          website,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }
  },
  reviews: {
    create: async (data: ReviewFormData, userId: string) => {
      const { content, employment_status, is_current_employee, position, rating, reviewer_email, reviewer_name, title, pros, cons } = data;
      return supabase
        .from('reviews')
        .insert({
          content,
          employment_status,
          is_current_employee,
          position,
          rating,
          reviewer_email,
          reviewer_name,
          title,
          pros,
          cons,
          user_id: userId,
          created_at: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single();
    },
    update: async (id: string | number, data: Partial<ReviewFormData>, userId: string) => {
      const { content, employment_status, is_current_employee, position, rating, reviewer_email, reviewer_name, title, pros, cons } = data;
      return supabase
        .from('reviews')
        .update({
          content,
          employment_status,
          is_current_employee,
          position,
          rating,
          reviewer_email,
          reviewer_name,
          title,
          pros,
          cons
        })
        .eq('id', id)
        .eq('user_id', userId); // Ensure user can only update their own reviews
    }
  }
}; 