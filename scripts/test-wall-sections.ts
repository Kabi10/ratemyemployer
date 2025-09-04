#!/usr/bin/env tsx

/**
 * Test Wall of Fame/Shame Sections
 * Verifies that the fixed queries work correctly
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function testWallSections() {
  console.log('🧪 Testing Wall of Fame/Shame Sections...');
  
  try {
    // Test the corrected query that matches the WallOfCompanies component
    console.log('\n1️⃣ Testing corrected companies query...');
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        industry,
        location,
        description,
        logo_url,
        website,
        reviews (
          id,
          rating,
          title,
          pros,
          cons,
          recommend,
          created_at,
          status
        )
      `)
      .order('id', { ascending: true });

    if (companiesError) {
      console.error('❌ Companies query failed:', companiesError);
      return false;
    }

    console.log(`✅ Query successful - found ${companiesData?.length || 0} companies`);

    if (!companiesData || companiesData.length === 0) {
      console.log('⚠️ No companies found in database');
      return true; // Not an error, just empty database
    }

    // Process companies like the Wall component does
    console.log('\n2️⃣ Processing companies for Wall logic...');
    const processedCompanies = companiesData.map(company => {
      // Only include approved reviews
      const reviews = (company.reviews || []).filter(review => review.status === 'approved');
      const validRatings = reviews.filter(review => review.rating >= 1 && review.rating <= 5);
      
      const averageRating = validRatings.length > 0
        ? validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length
        : 0;
      
      const recommendCount = reviews.filter(review => review.recommend).length;
      const recommendPercentage = reviews.length > 0
        ? Math.round((recommendCount / reviews.length) * 100)
        : 0;
      
      return {
        ...company,
        average_rating: averageRating,
        recommend_percentage: recommendPercentage,
        total_reviews: reviews.length
      };
    });

    // Filter companies with at least 3 reviews and a valid average rating
    const companiesWithReviews = processedCompanies.filter(
      company => company.average_rating > 0 && company.total_reviews >= 3
    );

    console.log(`📊 Processing results:`);
    console.log(`  - Total companies: ${processedCompanies.length}`);
    console.log(`  - Companies with reviews: ${processedCompanies.filter(c => c.total_reviews > 0).length}`);
    console.log(`  - Companies with 3+ approved reviews: ${companiesWithReviews.length}`);

    if (companiesWithReviews.length === 0) {
      console.log('⚠️ No companies have 3+ approved reviews for Wall display');
      console.log('💡 Consider adding test data with: npm run sections:test-data');
      return true;
    }

    // Test Wall of Fame (highest rated)
    console.log('\n3️⃣ Testing Wall of Fame logic...');
    const wallOfFame = companiesWithReviews
      .sort((a, b) => b.average_rating - a.average_rating)
      .slice(0, 10);

    console.log('🏆 Wall of Fame (Top 10):');
    wallOfFame.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} - ${company.average_rating.toFixed(2)} ⭐ (${company.total_reviews} reviews)`);
    });

    // Test Wall of Shame (lowest rated)
    console.log('\n4️⃣ Testing Wall of Shame logic...');
    const wallOfShame = companiesWithReviews
      .sort((a, b) => a.average_rating - b.average_rating)
      .slice(0, 10);

    console.log('💀 Wall of Shame (Bottom 10):');
    wallOfShame.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} - ${company.average_rating.toFixed(2)} ⭐ (${company.total_reviews} reviews)`);
    });

    // Test statistics calculation
    console.log('\n5️⃣ Testing statistics calculation...');
    const totalReviews = companiesWithReviews.reduce(
      (sum, company) => sum + company.total_reviews, 
      0
    );
    
    const overallAverageRating = companiesWithReviews.length > 0
      ? companiesWithReviews.reduce((sum, company) => sum + company.average_rating, 0) / companiesWithReviews.length
      : 0;

    console.log('📈 Statistics:');
    console.log(`  - Total companies for walls: ${companiesWithReviews.length}`);
    console.log(`  - Total reviews: ${totalReviews}`);
    console.log(`  - Overall average rating: ${overallAverageRating.toFixed(2)}`);

    // Test industry breakdown
    console.log('\n6️⃣ Testing industry breakdown...');
    const industries = [...new Set(companiesWithReviews.map(c => c.industry).filter(Boolean))];
    console.log(`🏭 Industries represented: ${industries.join(', ')}`);

    console.log('\n✅ All Wall section tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Wall of Fame/Shame section tests...');
  
  const success = await testWallSections();
  
  if (success) {
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Visit http://localhost:3000/fame to test Wall of Fame');
    console.log('  2. Visit http://localhost:3000/shame to test Wall of Shame');
    console.log('  3. If no companies appear, run: npm run sections:test-data');
    process.exit(0);
  } else {
    console.log('\n💥 Tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);
