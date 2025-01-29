import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from('companies').select('count').single();

    if (error) throw error;

    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Supabase',
      data
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}