import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const createServerClient = () => 
  createServerComponentClient<Database>({ cookies });

// Server-side database queries
export const serverQuery = {
  companies: {
    getAll: async () => {
      const supabase = createServerClient();
      return supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
    },
    getById: async (id: string) => {
      const supabase = createServerClient();
      return supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
    }
  },
  reviews: {
    getAll: async () => {
      const supabase = createServerClient();
      return supabase
        .from('reviews')
        .select('*, companies(*)')
        .order('created_at', { ascending: false });
    },
    getPending: async () => {
      const supabase = createServerClient();
      return supabase
        .from('reviews')
        .select('*, companies(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
    }
  }
}; 