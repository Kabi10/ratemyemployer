/**
 * src/app/api/reviews/route.ts
 * API routes for handling review creation and updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { handleError, ApiErrors } from '@/lib/api-utils';
import { reviewSchema } from '@/lib/schemas';
import type { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw ApiErrors.Unauthorized();
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = reviewSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        message: err.message,
        path: err.path.map(p => p.toString()),
      }));
      throw ApiErrors.ValidationError(errors);
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          ...validationResult.data,
          user_id: session.data.session.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw ApiErrors.BadRequest('Failed to create review');

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const userId = searchParams.get('user_id');

    let query = supabase.from('reviews').select(`
      *,
      user_profiles:user_id (
        username,
        email
      )
    `);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) throw ApiErrors.NotFound('Reviews');

    return NextResponse.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw ApiErrors.Unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      throw ApiErrors.BadRequest('Review ID is required');
    }

    // Check if the review belongs to the user
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (fetchError) throw fetchError;
    if (!review) throw ApiErrors.NotFound('Review');

    if (review.user_id !== session.data.session.user.id) {
      throw ApiErrors.Forbidden();
    }

    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
