import { supabase } from './supabaseClient';

async function checkDatabaseSchema() {
  // Check user metadata and roles
  const {
    data: { users },
    error: usersError,
  } = await supabase.auth.admin.listUsers();
  console.log('User metadata test:', {
    users: users?.map((u) => ({ id: u.id, metadata: u.user_metadata })),
    error: usersError,
  });

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
