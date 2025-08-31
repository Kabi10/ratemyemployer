import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export async function getTopRatedCompanies(limit: number = 10) {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      industry,
      location,
      average_rating,
      total_reviews,
      website
    `)
    .not('average_rating', 'is', null)
    .gte('total_reviews', 3)
    .order('average_rating', { ascending: false })
    .order('total_reviews', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getBottomRatedCompanies(limit: number = 10) {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      industry,
      location,
      average_rating,
      total_reviews,
      website
    `)
    .not('average_rating', 'is', null)
    .gte('total_reviews', 3)
    .order('average_rating', { ascending: true })
    .order('total_reviews', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
