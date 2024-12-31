import { supabase } from './supabaseClient';

async function checkDatabaseSchema() {
  // Check if user_role type exists
  const { data: typeData, error: typeError } = await supabase.rpc('get_user_role', {
    user_id: 'test',
  });

  console.log('User role function test:', { typeData, typeError });

  // Check companies table
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .limit(1);

  console.log('Companies table:', { companiesData, companiesError });

  // Check reviews table
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .limit(1);

  console.log('Reviews table:', { reviewsData, reviewsError });

  // Check auth.users table
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log('Auth user:', { userData, userError });
}

checkDatabaseSchema();
