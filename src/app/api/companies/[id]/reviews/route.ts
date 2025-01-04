import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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
          cookieStore.set({
            name,
            value,
            ...options,
            path: '/'
          })
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.delete(name)
        }
      }
    }
  )
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Error fetching reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const reviewData = await request.json()

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ ...reviewData, company_id: params.id }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Error creating review' },
      { status: 500 }
    )
  }
}
