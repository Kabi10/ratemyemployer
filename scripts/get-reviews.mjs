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

async function getReviews() {
  try {
    // Get all reviews with company information
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        companies (
          name,
          industry
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    console.log('\nReviews List:');
    console.log('============\n');

    // Group reviews by company
    const reviewsByCompany = reviews.reduce((acc, review) => {
      const companyName = review.companies.name;
      if (!acc[companyName]) {
        acc[companyName] = [];
      }
      acc[companyName].push(review);
      return acc;
    }, {});

    // Display reviews grouped by company
    Object.entries(reviewsByCompany).forEach(([companyName, companyReviews]) => {
      console.log(`\n${companyName} (${companyReviews[0].companies.industry})`);
      console.log('-------------------');
      
      const averageRating = companyReviews.reduce((sum, review) => sum + review.rating, 0) / companyReviews.length;
      console.log(`Average Rating: ${averageRating.toFixed(1)} ⭐ (${companyReviews.length} reviews)\n`);

      companyReviews.forEach((review, index) => {
        console.log(`${index + 1}. "${review.title}" - ${review.rating}⭐`);
        console.log(`   Position: ${review.position || 'Not specified'}`);
        console.log(`   Status: ${review.employment_status}`);
        console.log(`   Pros: ${review.pros}`);
        console.log(`   Cons: ${review.cons}`);
        console.log(`   Date: ${new Date(review.created_at).toLocaleDateString()}`);
        console.log('');
      });
    });

    // Display summary statistics
    console.log('\nSummary Statistics:');
    console.log('==================');
    console.log(`Total Reviews: ${reviews.length}`);
    console.log(`Companies Reviewed: ${Object.keys(reviewsByCompany).length}`);
    
    const overallAverage = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    console.log(`Overall Average Rating: ${overallAverage.toFixed(1)}⭐`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
getReviews().catch(console.error); 