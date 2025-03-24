import { Review } from '@/types';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { Database } from '@/types/supabase';
import { reviewSchema } from '@/lib/schemas';

/**
 * src/app/api/reviews/route.ts
 * API routes for handling review creation and updates
 */

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const companyIdStr = searchParams.get('companyId');
    const companyId = companyIdStr ? parseInt(companyIdStr, 10) : null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (typeof companyId === 'number' && !isNaN(companyId)) {
      query = query.eq('company_id', companyId as any);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      reviews: data,
      total: count || 0,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Check for rate limits before trying to insert
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('get_remaining_limits', { user_id: user.id });

    if (rateLimitError) {
      console.error('Error checking rate limits:', rateLimitError);
      // Continue with submission, but log the error
    } else if (rateLimitData && (rateLimitData as any).remaining_reviews <= 0) {
      // User has reached their daily limit
      return NextResponse.json(
        {
          success: false,
          message: 'You have reached your daily review limit. Please try again tomorrow.'
        },
        { status: 429 }
      );
    }

    // Check for duplicate reviews for this company within 24 hours
    const { data: existingReview, error: existingReviewError } = await supabase
      .from('reviews')
      .select('id, created_at')
      .eq('company_id', Number(validatedData.company_id))
      .eq('reviewer_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (existingReviewError) {
      console.error('Error checking for duplicate reviews:', existingReviewError);
      // Continue with submission, but log the error
    } else if (existingReview) {
      // User has already reviewed this company within 24 hours
      return NextResponse.json(
        { 
          error: 'Duplicate review', 
          message: 'You can only post one review per company every 24 hours.' 
        },
        { status: 409 }
      );
    }

    // Proceed with review submission
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...validatedData,
          reviewer_id: user.id,
          status: 'pending'
        } as any)
        .select()
        .single();

      if (error) {
        // Check if this is a rate limit error
        if (error.message && (
            error.message.includes('rate limit') || 
            error.message.includes('Rate limit') ||
            error.message.includes('can only post')
          )) {
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded', 
              message: error.message 
            },
            { status: 429 }
          );
        }
        throw error;
      }

      return NextResponse.json(data);
    } catch (error: any) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to create review', message: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing review submission:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', message: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create review', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { id } = await request.json();

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete review' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}