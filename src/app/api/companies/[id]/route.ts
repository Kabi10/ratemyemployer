import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
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

export async function GET(request: Request, { params }: any) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', params?.id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const updates = await request.json()

  try {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', params?.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update company' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', params?.id)

    if (error) throw error
    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete company' },
      { status: 500 }
    )
  }
}