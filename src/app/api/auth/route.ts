import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Auth callback handler (previously in /auth/callback/route.ts)
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL('/account', requestUrl.origin));
  }

  // If no code, assume it's a profile fetch request
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      role: session.user.user_metadata.role,
      created_at: session.user.user_metadata.created_at,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Error fetching profile' },
      { status: 500 }
    );
  }
}

// Profile update handler (previously in /api/profile/route.ts)
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...session.user.user_metadata,
        ...body,
        updated_at: new Date().toISOString(),
      },
    });

    if (error) throw error;

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata.role,
      created_at: data.user.user_metadata.created_at,
      updated_at: data.user.user_metadata.updated_at,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
} 