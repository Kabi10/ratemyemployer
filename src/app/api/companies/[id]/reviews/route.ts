import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

type RouteParams = { params: { id: string } }

// Helper function to create Supabase client
const createClient = () => {
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
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

type Context = {
  params: {
    id: string
  }
}

export async function GET(
  _request: NextRequest,
  { params }: Context
): Promise<Response> {
  const supabase = createClient()

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: Context
): Promise<Response> {
  const body = await request.json()
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ ...body, company_id: params.id }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create review' },
      { status: 500 }
    )
  }
}