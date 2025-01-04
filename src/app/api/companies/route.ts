import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Company } from '@/types'

// Helper function to create Supabase client
const createClient = async () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.delete({ name, ...options })
        }
      }
    }
  )
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const searchParams = new URL(request.url).searchParams
  const search = searchParams.get('search')
  const industry = searchParams.get('industry')
  const minRating = searchParams.get('minRating')

  let query = supabase.from('companies').select('*')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (industry) {
    query = query.eq('industry', industry)
  }

  if (minRating) {
    query = query.gte('average_rating', minRating)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
