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

async function getCompanies() {
  try {
    // Get companies with their review stats
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        *,
        reviews: reviews(count)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      return;
    }

    console.log('\nCompanies List:');
    console.log('================\n');

    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   Industry: ${company.industry}`);
      console.log(`   Website: ${company.website || 'N/A'}`);
      console.log(`   Verified: ${company.verified ? 'Yes' : 'No'}`);
      console.log(`   Reviews: ${company.reviews[0].count}`);
      console.log(`   Created: ${new Date(company.created_at).toLocaleDateString()}`);
      if (company.verification_date) {
        console.log(`   Verified on: ${new Date(company.verification_date).toLocaleDateString()}`);
      }
      console.log(''); // Empty line between companies
    });

    console.log(`Total Companies: ${companies.length}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
getCompanies().catch(console.error); 