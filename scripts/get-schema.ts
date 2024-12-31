import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

async function getSchema() {
  try {
    const { data, error } = await supabase.from('companies').select('*').limit(0);
    if (error) throw error;

    // Get the types from the returned data
    const columnTypes = Object.keys(data?.length ? data[0] : {}).map(key => ({
      column: key,
      type: typeof (data[0] as CompanyRow)?.[key as keyof CompanyRow],
    }));

    console.log('Companies Table Schema:', columnTypes);

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(0);
    if (reviewsError) throw reviewsError;

    const reviewColumnTypes = Object.keys(reviewsData?.length ? reviewsData[0] : {}).map(key => ({
      column: key,
      type: typeof (reviewsData[0] as ReviewRow)?.[key as keyof ReviewRow],
    }));

    console.log('Reviews Table Schema:', reviewColumnTypes);
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

// Run the script
getSchema().catch(console.error);
