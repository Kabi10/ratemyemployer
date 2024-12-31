import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getSchema() {
  try {
    // First, get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (tablesError) {
      console.error('Error getting tables:', tablesError);
      return;
    }

    console.log('\nCompanies Table Schema:');
    if (tables && tables[0]) {
      Object.keys(tables[0]).forEach(column => {
        console.log(`  ${column}: ${typeof tables[0][column]}`);
      });
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);

    if (reviewsError) {
      console.error('Error getting reviews:', reviewsError);
      return;
    }

    console.log('\nReviews Table Schema:');
    if (reviews && reviews[0]) {
      Object.keys(reviews[0]).forEach(column => {
        console.log(`  ${column}: ${typeof reviews[0][column]}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
getSchema().catch(console.error); 