import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Company } from '@/types';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get('search');
  const industry = searchParams.get('industry');
  const minRating = searchParams.get('minRating');

  let query = supabase.from('companies').select('*');

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (industry) {
    query = query.eq('industry', industry);
  }

  if (minRating) {
    query = query.gte('average_rating', minRating);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
