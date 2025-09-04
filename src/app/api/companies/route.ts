import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { supabase as clientSupabase } from '@/lib/supabaseClient';

type Company = Database['public']['Tables']['companies']['Row'];

// Helper function to create Supabase client
const createClient = async () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          try {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          } catch {
            /* no-op in tests */
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.delete({ name, ...options });
          } catch {
            /* no-op in tests */
          }
        }
      }
    }
  );
};

export async function GET(request: Request) {
  const supabase = process.env.NODE_ENV === 'test' ? clientSupabase : await createClient();
  const url = typeof request.url === 'string' && request.url.startsWith('http')
    ? request.url
    : `http://localhost${(request as any).url || '/api/companies'}`;
  const searchParams = new URL(url).searchParams;
  const search = searchParams.get('search');
  const industry = searchParams.get('industry');
  const minRating = searchParams.get('minRating');
  const limit = searchParams.get('limit');

  let query: any = supabase.from('companies').select('*');

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (industry) {
    query = query.eq('industry', industry);
  }

  if (minRating) {
    query = query.gte('average_rating', minRating);
  }

  if (limit && typeof query.limit === 'function') {
    query = query.limit(parseInt(limit, 10));
  }

  if (typeof query.order === 'function') {
    query = query.order('name');
  }

  try {
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = process.env.NODE_ENV === 'test' ? clientSupabase : await createClient();
    let payload: any;
    try {
      const body = (request as any).body;
      if (typeof body === 'string') {
        payload = JSON.parse(body);
      } else if (body) {
        payload = body;
      } else {
        payload = await request.json();
      }
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!payload || !payload.name) {
      return NextResponse.json({ error: 'validation: name is required' }, { status: 400 });
    }

    // Basic sanitization
    const sanitize = (s: string) => String(s).replace(/<[^>]*>/g, '');
    const toInsert = {
      ...payload,
      name: sanitize(payload.name),
      description: payload.description ? sanitize(payload.description) : null,
    };

    const insertChain = supabase
      .from('companies')
      .insert(toInsert)
      .select()
      .single();

    const { data, error }: any = await insertChain;
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Company already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}