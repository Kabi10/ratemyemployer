import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSchema() {
  try {
    // Get companies table info
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select()
      .limit(1);

    if (companiesError) {
      console.log('Error fetching companies:', companiesError.message);
    } else {
      console.log('\nCompanies Table Schema:');
      if (companies && companies[0]) {
        Object.entries(companies[0]).forEach(([key, value]) => {
          console.log(`  ${key}: ${typeof value} = ${value}`);
        });
      }
    }

    // Get reviews table info
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select()
      .limit(1);

    if (reviewsError) {
      console.log('Error fetching reviews:', reviewsError.message);
    } else {
      console.log('\nReviews Table Schema:');
      if (reviews && reviews[0]) {
        Object.entries(reviews[0]).forEach(([key, value]) => {
          console.log(`  ${key}: ${typeof value} = ${value}`);
        });
      }
    }

    // Get users table info
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select()
      .limit(1);

    if (usersError) {
      console.log('Error fetching users:', usersError.message);
    } else {
      console.log('\nUsers Table Schema:');
      if (users && users[0]) {
        Object.entries(users[0]).forEach(([key, value]) => {
          console.log(`  ${key}: ${typeof value} = ${value}`);
        });
      }
    }

  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

getSchema();
