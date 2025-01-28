import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('companies').select('count').single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Connection successful', count: data.count });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Supabase' },
      { status: 500 }
    );
  }
}