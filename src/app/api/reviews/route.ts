import { Review } from '@/types';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { Database } from '@/types/supabase';

/**
 * src/app/api/reviews/route.ts
 * API routes for handling review creation and updates
 */

export async function GET() {
  const supabase = createServerSupabaseClient();

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, company:companies(*)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(reviews), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch reviews' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();

  try {
    // Get auth token from request header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header:', authHeader);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'Missing or invalid authorization token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError.message }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.error('No user found for token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'User not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: 'Failed to parse request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received review submission:', body);

    // Validate required fields
    const requiredFields = {
      rating: 'Rating',
      title: 'Title',
      content: 'Review content',
      position: 'Position',
      pros: 'Pros',
      cons: 'Cons',
      company_id: 'Company ID',
      user_id: 'User ID'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => body[key] === undefined || body[key] === null || body[key] === '')
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: `Please fill in all required fields: ${missingFields.join(', ')}`,
          receivedFields: Object.keys(body)
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate rating range
    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      console.error('Invalid rating:', body.rating);
      return new Response(
        JSON.stringify({
          error: 'Invalid rating',
          details: 'Rating must be a number between 1 and 5'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify user_id matches authenticated user
    if (body.user_id !== user.id) {
      console.error('User ID mismatch:', { bodyUserId: body.user_id, authUserId: user.id });
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          details: 'User ID does not match authenticated user'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert the review
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...body,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    if (!data) {
      console.error('No data returned from insert');
      throw new Error('Failed to create review - no data returned');
    }

    console.log('Review created successfully:', data);
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating review:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      details: (error as any)?.details
    });
    
    return new Response(
      JSON.stringify({
        error: 'Failed to create review',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : (error as any)?.details || 'No additional details available'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createServerSupabaseClient()
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