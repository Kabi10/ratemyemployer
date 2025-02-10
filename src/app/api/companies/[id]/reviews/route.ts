import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to create Supabase client
const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies();
          cookieStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookies();
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
};

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const supabase = createClient();
  const { id } = context.params;

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error in GET /api/companies/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const body = await request.json();
  const supabase = createClient();
  const { id } = context.params;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ ...body, company_id: id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/companies/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
