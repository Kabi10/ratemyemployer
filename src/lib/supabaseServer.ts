import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined'
  );
}

/**
 * Creates a Supabase client for server-side operations
 * @returns Supabase client with server-side cookie handling
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookies in edge functions
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}

// For backward compatibility with existing code
export const createServerSupabase = createServerSupabaseClient;

// Export the createServerClient for direct usage if needed
export { createServerClient };

/**
 * Server-side database queries with error handling
 */
export const serverQuery = {
  companies: {
    getAll: async () => {
      try {
        const supabase = await createServerSupabaseClient();
        return supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });
      } catch (error) {
        console.error('Error fetching companies:', error);
        return { data: null, error };
      }
    },
    getById: async (id: string) => {
      try {
        const supabase = await createServerSupabaseClient();
        const numericId = parseInt(id, 10);
        return supabase
          .from('companies')
          .select('*')
          .eq('id', numericId)
          .single();
      } catch (error) {
        console.error(`Error fetching company with ID ${id}:`, error);
        return { data: null, error };
      }
    },
    getByIndustry: async (industry: string) => {
      try {
        const supabase = await createServerSupabaseClient();
        return supabase
          .from('companies')
          .select('*')
          .eq('industry', industry)
          .order('created_at', { ascending: false });
      } catch (error) {
        console.error(`Error fetching companies in industry ${industry}:`, error);
        return { data: null, error };
      }
    }
  },
  reviews: {
    getAll: async () => {
      try {
        const supabase = await createServerSupabaseClient();
        return supabase
          .from('reviews')
          .select('*, companies(*)')
          .order('created_at', { ascending: false });
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return { data: null, error };
      }
    },
    getPending: async () => {
      try {
        const supabase = await createServerSupabaseClient();
        return supabase
          .from('reviews')
          .select('*, companies(*)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
      } catch (error) {
        console.error('Error fetching pending reviews:', error);
        return { data: null, error };
      }
    },
    getByCompanyId: async (companyId: string | number) => {
      try {
        const supabase = await createServerSupabaseClient();
        const numericId = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
        return supabase
          .from('reviews')
          .select('*')
          .eq('company_id', numericId)
          .order('created_at', { ascending: false });
      } catch (error) {
        console.error(`Error fetching reviews for company ${companyId}:`, error);
        return { data: null, error };
      }
    }
  },
  users: {
    getProfile: async (userId: string) => {
      try {
        const supabase = await createServerSupabaseClient();
        return supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
      } catch (error) {
        console.error(`Error fetching profile for user ${userId}:`, error);
        return { data: null, error };
      }
    }
  }
}; 