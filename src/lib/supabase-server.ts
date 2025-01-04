import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const createServerSupabase = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = cookies()
          cookieStore.delete({ name, ...options })
        }
      }
    }
  )
}

// Server-side database queries
export const serverQuery = {
  companies: {
    getAll: async () => {
      const supabase = createServerSupabase()
      return supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
    },
    getById: async (id: string) => {
      const supabase = createServerSupabase()
      return supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()
    }
  },
  reviews: {
    getAll: async () => {
      const supabase = createServerSupabase()
      return supabase
        .from('reviews')
        .select('*, companies(*)')
        .order('created_at', { ascending: false })
    },
    getPending: async () => {
      const supabase = createServerSupabase()
      return supabase
        .from('reviews')
        .select('*, companies(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    }
  }
} 