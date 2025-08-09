#!/usr/bin/env tsx

/**
 * Debug Wall of Fame/Shame Issue
 * Investigates the database schema and query issues
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function debugWallIssue() {
  console.log('🔍 Debugging Wall of Fame/Shame Issue...');
  
  try {
    // 1. Test basic connection
    console.log('\n1️⃣ Testing basic database connection...');
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);

    if (testError) {
      console.error('❌ Basic connection failed:', testError);
      return;
    }
    console.log('✅ Basic connection successful');

    // 2. Check companies table schema
    console.log('\n2️⃣ Checking companies table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError);
      return;
    }

    if (schemaData && schemaData.length > 0) {
      console.log('✅ Companies table columns:', Object.keys(schemaData[0]));
    } else {
      console.log('⚠️ No companies found in database');
    }

    // 3. Test the problematic query from WallOfCompanies
    console.log('\n3️⃣ Testing the original problematic query...');
    const { data: originalQuery, error: originalError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        industry,
        location,
        description,
        logo_url,
        website_url,
        size,
        founded_year,
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
      .limit(1);

    if (originalError) {
      console.error('❌ Original query failed:', originalError);
      console.log('This confirms the issue is with column names');
    } else {
      console.log('✅ Original query worked (unexpected)');
    }

    // 4. Test corrected query
    console.log('\n4️⃣ Testing corrected query...');
    const { data: correctedQuery, error: correctedError } = await supabase
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
      .limit(5);

    if (correctedError) {
      console.error('❌ Corrected query failed:', correctedError);
    } else {
      console.log('✅ Corrected query successful');
      console.log(`Found ${correctedQuery?.length || 0} companies`);
      
      if (correctedQuery && correctedQuery.length > 0) {
        correctedQuery.forEach((company, index) => {
          console.log(`  ${index + 1}. ${company.name} - ${company.reviews?.length || 0} reviews`);
        });
      }
    }

    // 5. Check for companies with reviews
    console.log('\n5️⃣ Checking companies with reviews...');
    const { data: companiesWithReviews, error: reviewsError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        industry,
        location,
        reviews!inner (
          id,
          rating,
          status
        )
      `)
      .eq('reviews.status', 'approved')
      .limit(10);

    if (reviewsError) {
      console.error('❌ Companies with reviews query failed:', reviewsError);
    } else {
      console.log(`✅ Found ${companiesWithReviews?.length || 0} companies with approved reviews`);
    }

    // 6. Check review status values
    console.log('\n6️⃣ Checking review status values...');
    const { data: reviewStatuses, error: statusError } = await supabase
      .from('reviews')
      .select('status')
      .limit(10);

    if (statusError) {
      console.error('❌ Review status check failed:', statusError);
    } else {
      const statuses = [...new Set(reviewStatuses?.map(r => r.status))];
      console.log('✅ Review status values found:', statuses);
    }

    // 7. Test Wall of Fame logic
    console.log('\n7️⃣ Testing Wall of Fame logic...');
    const { data: wallData, error: wallError } = await supabase
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

    if (wallError) {
      console.error('❌ Wall data query failed:', wallError);
    } else {
      console.log(`✅ Wall data query successful - ${wallData?.length || 0} companies`);
      
      // Process the data like the Wall component does
      const processedCompanies = wallData?.map(company => {
        const reviews = (company.reviews || []).filter(review => review.status === 'approved');
        const validRatings = reviews.filter(review => review.rating >= 1 && review.rating <= 5);
        
        const averageRating = validRatings.length > 0
          ? validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length
          : 0;
        
        return {
          ...company,
          average_rating: averageRating,
          total_reviews: reviews.length
        };
      }) || [];

      const companiesWithReviews = processedCompanies.filter(
        company => company.average_rating > 0 && company.total_reviews >= 3
      );

      console.log(`📊 Processing results:`);
      console.log(`  - Total companies: ${processedCompanies.length}`);
      console.log(`  - Companies with 3+ approved reviews: ${companiesWithReviews.length}`);
      
      if (companiesWithReviews.length > 0) {
        console.log(`  - Top rated companies:`);
        const topRated = companiesWithReviews
          .sort((a, b) => b.average_rating - a.average_rating)
          .slice(0, 5);
        
        topRated.forEach((company, index) => {
          console.log(`    ${index + 1}. ${company.name} - ${company.average_rating.toFixed(2)} (${company.total_reviews} reviews)`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Fatal error during debugging:', error);
  }
}

// Run the debug script
debugWallIssue().catch(console.error);
