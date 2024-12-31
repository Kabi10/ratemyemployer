import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Company } from '@/types/database';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const industry = searchParams.get('industry');
  const search = searchParams.get('search');
  const limit = searchParams.get('limit');

  let query = supabase.from('companies').select('*');

  if (industry) query = query.eq('industry', industry);
  if (search) query = query.ilike('name', `%${search}%`);
  if (limit) query = query.limit(parseInt(limit));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as Company[]);
}
