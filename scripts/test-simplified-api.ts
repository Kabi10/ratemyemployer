#!/usr/bin/env tsx

/**
 * Test Simplified API Script
 * Tests that all API endpoints work correctly with the simplified schema
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

async function testSimplifiedAPI() {
  console.log('🧪 Testing simplified API endpoints...');
  
  let testsPassed = 0;
  let testsTotal = 0;
  let testCompanyId: number | null = null;
  let testReviewId: number | null = null;

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    testsTotal++;
    try {
      console.log(`\n🔍 ${testName}...`);
      await testFn();
      console.log(`✅ ${testName} passed`);
      testsPassed++;
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
    }
  };

  // Test 1: Companies table operations
  await runTest('Companies table structure', async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, industry, location, website, logo_url, verified, average_rating, total_reviews')
      .limit(1);
    
    if (error) throw error;
    console.log('   Companies table structure is valid');
  });

  // Test 2: Create test company
  await runTest('Create test company', async () => {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: 'Test Company API',
        industry: 'Technology',
        location: 'Test City',
        website: 'https://test-api.example.com',
        verified: false,
        total_reviews: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No company data returned');
    
    testCompanyId = data.id;
    console.log(`   Created test company with ID: ${testCompanyId}`);
  });

  // Test 3: Fetch company by ID
  await runTest('Fetch company by ID', async () => {
    if (!testCompanyId) throw new Error('No test company ID available');
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', testCompanyId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Company not found');
    if (data.name !== 'Test Company API') throw new Error('Company data mismatch');
    
    console.log('   Company fetched successfully');
  });

  // Test 4: Update company
  await runTest('Update company', async () => {
    if (!testCompanyId) throw new Error('No test company ID available');
    
    const { data, error } = await supabase
      .from('companies')
      .update({ 
        industry: 'Software',
        location: 'Updated City'
      })
      .eq('id', testCompanyId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No updated company data returned');
    if (data.industry !== 'Software') throw new Error('Company update failed');
    
    console.log('   Company updated successfully');
  });

  // Test 5: Reviews table operations
  await runTest('Reviews table structure', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, company_id, user_id, rating, title, pros, cons, content, position, status')
      .limit(1);
    
    if (error) throw error;
    console.log('   Reviews table structure is valid');
  });

  // Test 6: Create test review
  await runTest('Create test review', async () => {
    if (!testCompanyId) throw new Error('No test company ID available');
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        company_id: testCompanyId,
        rating: 4,
        title: 'Test Review API',
        pros: 'Good API testing',
        cons: 'Just a test',
        content: 'This is a test review for API validation',
        position: 'Test Engineer',
        status: 'approved'
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No review data returned');
    
    testReviewId = data.id;
    console.log(`   Created test review with ID: ${testReviewId}`);
  });

  // Test 7: Fetch reviews for company
  await runTest('Fetch reviews for company', async () => {
    if (!testCompanyId) throw new Error('No test company ID available');
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', testCompanyId)
      .eq('status', 'approved');
    
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No reviews found');
    if (data[0].title !== 'Test Review API') throw new Error('Review data mismatch');
    
    console.log(`   Found ${data.length} review(s) for company`);
  });

  // Test 8: Test essential functions
  await runTest('Test essential functions', async () => {
    // Test safe_division function
    const { data: divisionResult, error: divisionError } = await supabase
      .rpc('safe_division', { numerator: 10, denominator: 2 });
    
    if (divisionError) throw divisionError;
    if (divisionResult !== 5) throw new Error('safe_division function failed');
    
    console.log('   safe_division function works correctly');
  });

  // Test 9: Test company rating calculation
  await runTest('Test company rating calculation', async () => {
    if (!testCompanyId) throw new Error('No test company ID available');
    
    const { data: rating, error: ratingError } = await supabase
      .rpc('get_company_rating', { company_id_param: testCompanyId });
    
    if (ratingError) throw ratingError;
    if (typeof rating !== 'number') throw new Error('Invalid rating returned');
    
    console.log(`   Company rating calculated: ${rating}`);
  });

  // Test 10: Search companies
  await runTest('Search companies', async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', '%Test%')
      .limit(10);
    
    if (error) throw error;
    if (!data) throw new Error('No search results returned');
    
    const testCompany = data.find(c => c.id === testCompanyId);
    if (!testCompany) throw new Error('Test company not found in search results');
    
    console.log(`   Found ${data.length} companies in search`);
  });

  // Cleanup: Delete test data
  await runTest('Cleanup test data', async () => {
    if (testReviewId) {
      const { error: reviewError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', testReviewId);
      
      if (reviewError) throw reviewError;
      console.log('   Deleted test review');
    }
    
    if (testCompanyId) {
      const { error: companyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', testCompanyId);
      
      if (companyError) throw companyError;
      console.log('   Deleted test company');
    }
  });

  // Final results
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All API tests passed!');
    console.log('✅ Simplified schema is working correctly');
  } else {
    console.log('❌ Some tests failed');
    console.log('🔧 Please review the errors above');
    process.exit(1);
  }
}

// Run the API tests
testSimplifiedAPI().catch(console.error);