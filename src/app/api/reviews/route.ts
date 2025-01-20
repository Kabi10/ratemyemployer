import { Review } from '@/types';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

import { Database } from '@/types/supabase';


/**
 * src/app/api/reviews/route.ts
 * API routes for handling review creation and updates
 */

const createClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: any) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export async function GET() {
  const supabase = createClient()

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, company:companies(*)')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify(reviews), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch reviews' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([body])
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create review' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { id } = await request.json()

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting review:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete review' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}