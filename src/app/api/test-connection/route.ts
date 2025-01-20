import { NextResponse } from 'next/server';


import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Test queries
    const [companiesResponse, reviewsResponse] = await Promise.all([
      supabase.from('companies').select('*').limit(1),
      supabase.from('reviews').select('*').limit(1),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase',
      data: {
        companies: companiesResponse.data,
        reviews: reviewsResponse.data,
        errors: {
          companies: companiesResponse.error,
          reviews: reviewsResponse.error,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to Supabase',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}