#!/usr/bin/env tsx

/**
 * Simplified Schema Validation Script
 * Tests that the simplified database schema supports all core MVP functionality
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/supabase-simplified';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function validateSchema() {
  console.log('🔍 Validating simplified MVP schema...');
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Companies table structure
    console.log('\n📊 Testing companies table...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, industry, location, website, logo_url, verified, average_rating, total_reviews')
      .limit(1);
    
    if (companiesError) {
      console.error('❌ Companies table test failed:', companiesError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ Companies table structure is valid');
    }

    // Test 2: Reviews table structure
    console.log('\n📊 Testing reviews table...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, company_id, user_id, rating, title, pros, cons, content, position, status')
      .limit(1);
    
    if (reviewsError) {
      console.error('❌ Reviews table test failed:', reviewsError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ Reviews table structure is valid');
    }

    // Test 3: Essential functions exist
    console.log('\n🔧 Testing essential functions...');
    
    // Test get_company_rating function
    try {
      const { data: ratingData, error: ratingError } = await supabase
        .rpc('get_company_rating', { company_id_param: 1 });
      
      if (ratingError) {
        console.error('❌ get_company_rating function test failed:', ratingError.message);
        allTestsPassed = false;
      } else {
        console.log('✅ get_company_rating function is working');
      }
    } catch (error) {
      console.error('❌ get_company_rating function test failed:', error);
      allTestsPassed = false;
    }

    // Test safe_division function
    try {
      const { data: divisionData, error: divisionError } = await supabase
        .rpc('safe_division', { numerator: 10, denominator: 2 });
      
      if (divisionError) {
        console.error('❌ safe_division function test failed:', divisionError.message);
        allTestsPassed = false;
      } else if (divisionData === 5) {
        console.log('✅ safe_division function is working');
      } else {
        console.error('❌ safe_division function returned unexpected result:', divisionData);
        allTestsPassed = false;
      }
    } catch (error) {
      console.error('❌ safe_division function test failed:', error);
      allTestsPassed = false;
    }

    // Test 4: Verify non-MVP tables are removed
    console.log('\n🗑️ Verifying non-MVP tables are removed...');
    
    const nonMvpTables = [
      'company_news',
      'user_profiles',
      'scraping_jobs',
      'scraped_data',
      'company_data_enhancements',
      'financial_distress_indicators',
      'rising_startup_indicators'
    ];

    for (const tableName of nonMvpTables) {
      try {
        const { error } = await supabase.from(tableName as any).select('*').limit(1);
        if (error && error.message.includes('does not exist')) {
          console.log(`✅ ${tableName} table successfully removed`);
        } else {
          console.error(`❌ ${tableName} table still exists (should be removed)`);
          allTestsPassed = false;
        }
      } catch (error) {
        console.log(`✅ ${tableName} table successfully removed`);
      }
    }

    // Test 5: Core MVP functionality
    console.log('\n🎯 Testing core MVP functionality...');
    
    // Test company creation
    const testCompany = {
      name: 'Test Company MVP',
      industry: 'Technology',
      location: 'Test City',
      website: 'https://test.example.com'
    };

    const { data: createdCompany, error: createError } = await supabase
      .from('companies')
      .insert(testCompany)
      .select()
      .single();

    if (createError) {
      console.error('❌ Company creation test failed:', createError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ Company creation is working');
      
      // Test review creation for the company
      const testReview = {
        company_id: createdCompany.id,
        rating: 4,
        title: 'Test Review',
        pros: 'Good test environment',
        cons: 'Just a test',
        content: 'This is a test review for MVP validation',
        position: 'Test Engineer',
        status: 'approved' as const
      };

      const { data: createdReview, error: reviewCreateError } = await supabase
        .from('reviews')
        .insert(testReview)
        .select()
        .single();

      if (reviewCreateError) {
        console.error('❌ Review creation test failed:', reviewCreateError.message);
        allTestsPassed = false;
      } else {
        console.log('✅ Review creation is working');
        
        // Clean up test data
        await supabase.from('reviews').delete().eq('id', createdReview.id);
        await supabase.from('companies').delete().eq('id', createdCompany.id);
        console.log('✅ Test data cleaned up');
      }
    }

    // Test 6: Verify essential indexes exist
    console.log('\n📇 Checking essential indexes...');
    const { data: indexes, error: indexError } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .in('tablename', ['companies', 'reviews']);

    if (indexError) {
      console.error('❌ Index check failed:', indexError.message);
      allTestsPassed = false;
    } else {
      const essentialIndexes = [
        'companies_pkey',
        'reviews_pkey',
        'reviews_company_id_fkey'
      ];
      
      const existingIndexes = indexes?.map(idx => idx.indexname) || [];
      const missingIndexes = essentialIndexes.filter(idx => !existingIndexes.includes(idx));
      
      if (missingIndexes.length > 0) {
        console.error('❌ Missing essential indexes:', missingIndexes);
        allTestsPassed = false;
      } else {
        console.log('✅ Essential indexes are present');
      }
    }

    // Final result
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 All schema validation tests passed!');
      console.log('✅ Simplified MVP schema is ready for use');
    } else {
      console.log('❌ Some validation tests failed');
      console.log('🔧 Please review the errors above and fix the schema');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  }
}

// Run the validation
validateSchema().catch(console.error);