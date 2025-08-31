#!/usr/bin/env tsx

/**
 * Test Rising Startups API to identify client-side exceptions
 */

import { getRisingStartupCompanies } from '../src/lib/companySectionsApi';

async function testRisingStartups() {
  console.log('🧪 Testing Rising Startups API...');
  
  try {
    // Test with minimal parameters
    console.log('\n1️⃣ Testing getRisingStartupCompanies with default parameters...');
    const result = await getRisingStartupCompanies({}, 5, 0);
    
    console.log('✅ API call successful');
    console.log('📊 Result:', {
      companiesCount: result.companies.length,
      totalCount: result.total_count,
      averageGrowthScore: result.average_growth_score,
      totalFunding: result.total_funding
    });
    
    if (result.companies.length > 0) {
      console.log('📋 Sample company:', result.companies[0]);
    }
    
  } catch (error) {
    console.error('❌ Error in getRisingStartupCompanies:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
  
  // Test the database connection directly
  try {
    console.log('\n2️⃣ Testing direct database connection...');
    const { supabase } = await import('../src/lib/supabaseClient');
    
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);
      
    if (error) {
      console.error('❌ Database connection error:', error);
    } else {
      console.log('✅ Database connection successful');
      console.log('📊 Sample data:', data);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
  
  // Test the stored procedure directly
  try {
    console.log('\n3️⃣ Testing stored procedure directly...');
    const { supabase } = await import('../src/lib/supabaseClient');
    
    const { data, error } = await supabase
      .rpc('get_rising_startup_companies', { limit_param: 5 });
      
    if (error) {
      console.error('❌ Stored procedure error:', error);
      console.error('Error details:', {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      });
    } else {
      console.log('✅ Stored procedure successful');
      console.log('📊 Procedure result:', data?.length, 'companies found');
    }
    
  } catch (error) {
    console.error('❌ Stored procedure failed:', error);
  }
}

// Run the test
testRisingStartups().catch(console.error);