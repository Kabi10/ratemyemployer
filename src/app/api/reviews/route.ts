import { ReviewRow } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { Database } from '@/types/supabase';
import { reviewSchema } from '@/lib/schemas';

/**
 * src/app/api/reviews/route.ts
 * API routes for handling review creation and updates
 */

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = request.nextUrl;

    const companyId = searchParams.get('companyId');
    const companyIdNumber = companyId ? parseInt(companyId) : null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (companyIdNumber) {
      query = query.eq('company_id', companyIdNumber);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      reviews: data,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...validatedData,
        reviewer_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = await request.json();

    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
