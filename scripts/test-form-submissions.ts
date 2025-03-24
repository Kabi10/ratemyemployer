import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Form Submission Testing Script
 * 
 * This script tests form submissions by directly inserting test data into Supabase
 * and then verifying that the data was stored correctly.
 */

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate a unique test identifier to group test data
const testId = uuidv4().substring(0, 8);
console.log(`🔑 Test ID: ${testId}`);

// Test company data
interface TestCompany {
  name: string;
  industry: string;
  location: string;
  website: string;
  logo_url: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const testCompany: TestCompany = {
  name: `Test Company ${testId}`,
  industry: 'Technology',
  location: 'Test Location',
  website: 'https://example.com',
  logo_url: 'https://example.com/logo.png',
  created_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Test review data (will be populated after company is created)
interface TestReview {
  company_id: number | null;
  rating: number;
  title: string;
  pros: string;
  cons: string;
  employment_status: string;
  position: string;
  created_at: string;
  user_id: string | null;
  status: string;
}

let testReview: TestReview = {
  company_id: null, // Will be set after company creation
  rating: 4,
  title: `Test Review ${testId}`,
  pros: 'This is a test pros section with sufficient length for testing',
  cons: 'This is a test cons section with sufficient length for testing',
  employment_status: 'Full-time',
  position: 'Test Position',
  created_at: new Date().toISOString(),
  user_id: null, // Will be set to test user ID
  status: 'pending',
};

// Test user data
const testUser = {
  email: `test-user-${testId}@example.com`,
  password: `TestPassword123!${testId}`,
  username: `test-user-${testId}`,
};

// Function to create a test user
async function createTestUser() {
  console.log('👤 Creating test user...');
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
    });
    
    if (error) {
      console.error('❌ Error creating test user:', error);
      throw error;
    }
    
    console.log(`✅ Test user created with ID: ${data.user.id}`);
    
    // Update test data with user ID
    testCompany.created_by = data.user.id;
    testReview.user_id = data.user.id;
    
    return data.user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

// Function to create a test company
async function createTestCompany() {
  console.log('🏢 Creating test company...');
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert(testCompany)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating test company:', error);
      throw error;
    }
    
    console.log(`✅ Test company created with ID: ${data.id}`);
    
    // Update test review with company ID
    testReview.company_id = data.id;
    
    return data;
  } catch (error) {
    console.error('❌ Error creating test company:', error);
    throw error;
  }
}

// Function to create a test review
async function createTestReview() {
  console.log('📝 Creating test review...');
  
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(testReview)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating test review:', error);
      throw error;
    }
    
    console.log(`✅ Test review created with ID: ${data.id}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error creating test review:', error);
    throw error;
  }
}

// Function to verify company data
async function verifyCompanyData(companyId: number) {
  console.log(`🔍 Verifying company data for ID: ${companyId}...`);
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching company data:', error);
      throw error;
    }
    
    if (!data) {
      console.error('❌ Company not found');
      throw new Error('Company not found');
    }
    
    // Verify key fields
    const verificationResults = {
      name: data.name === testCompany.name,
      industry: data.industry === testCompany.industry,
      location: data.location === testCompany.location,
      website: data.website === testCompany.website,
      created_by: data.created_by === testCompany.created_by,
    };
    
    const allFieldsValid = Object.values(verificationResults).every(result => result);
    
    if (allFieldsValid) {
      console.log('✅ Company data verified successfully');
    } else {
      console.error('❌ Company data verification failed');
      console.error('Expected:', testCompany);
      console.error('Actual:', data);
      throw new Error('Company data verification failed');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error verifying company data:', error);
    throw error;
  }
}

// Function to verify review data
async function verifyReviewData(reviewId: number) {
  console.log(`🔍 Verifying review data for ID: ${reviewId}...`);
  
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching review data:', error);
      throw error;
    }
    
    if (!data) {
      console.error('❌ Review not found');
      throw new Error('Review not found');
    }
    
    // Verify key fields
    const verificationResults = {
      company_id: data.company_id === testReview.company_id,
      rating: data.rating === testReview.rating,
      title: data.title === testReview.title,
      pros: data.pros === testReview.pros,
      cons: data.cons === testReview.cons,
      user_id: data.user_id === testReview.user_id,
      status: data.status === testReview.status,
    };
    
    const allFieldsValid = Object.values(verificationResults).every(result => result);
    
    if (allFieldsValid) {
      console.log('✅ Review data verified successfully');
    } else {
      console.error('❌ Review data verification failed');
      console.error('Expected:', testReview);
      console.error('Actual:', data);
      throw new Error('Review data verification failed');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error verifying review data:', error);
    throw error;
  }
}

// Function to verify foreign key relationships
async function verifyRelationships(companyId: number, reviewId: number) {
  console.log('🔍 Verifying relationships...');
  
  try {
    // Verify company-review relationship
    const { data, error } = await supabase
      .from('reviews')
      .select('*, companies(*)')
      .eq('id', reviewId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching relationship data:', error);
      throw error;
    }
    
    if (!data || !data.companies) {
      console.error('❌ Relationship data not found');
      throw new Error('Relationship data not found');
    }
    
    if (data.companies.id !== companyId) {
      console.error('❌ Company-review relationship verification failed');
      throw new Error('Company-review relationship verification failed');
    }
    
    console.log('✅ Company-review relationship verified successfully');
    
    return data;
  } catch (error) {
    console.error('❌ Error verifying relationships:', error);
    throw error;
  }
}

// Function to clean up test data
async function cleanupTestData(companyId: number, reviewId: number, userId: string) {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete test review
    const { error: reviewError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    
    if (reviewError) {
      console.error('❌ Error deleting test review:', reviewError);
    } else {
      console.log('✅ Test review deleted');
    }
    
    // Delete test company
    const { error: companyError } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);
    
    if (companyError) {
      console.error('❌ Error deleting test company:', companyError);
    } else {
      console.log('✅ Test company deleted');
    }
    
    // Delete test user
    const { error: userError } = await supabase.auth.admin.deleteUser(userId);
    
    if (userError) {
      console.error('❌ Error deleting test user:', userError);
    } else {
      console.log('✅ Test user deleted');
    }
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
}

// Main function to run the tests
interface TestResult {
  success: boolean;
  testUser: { id: string } | null;
  testCompanyData: { id: number } | null;
  testReviewData: { id: number } | null;
}

async function runTests(): Promise<TestResult> {
  console.log('🚀 Starting form submission tests...');
  
  let testUser = null;
  let testCompanyData = null;
  let testReviewData = null;
  
  try {
    // Create test user
    testUser = await createTestUser();
    
    // Create test company
    testCompanyData = await createTestCompany();
    
    // Create test review
    testReviewData = await createTestReview();
    
    // Verify data
    await verifyCompanyData(testCompanyData.id);
    await verifyReviewData(testReviewData.id);
    await verifyRelationships(testCompanyData.id, testReviewData.id);
    
    return {
      success: true,
      testUser,
      testCompanyData,
      testReviewData
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      testUser,
      testCompanyData,
      testReviewData
    };
  }
}

// Run the tests and clean up
runTests()
  .then(result => {
    if (result.success && 
        result.testUser?.id && 
        result.testCompanyData?.id && 
        result.testReviewData?.id) {
      // Ask if we should clean up test data
      console.log('\n🧹 Do you want to clean up the test data? (y/n)');
      process.stdin.once('data', async (data) => {
        const input = data.toString().trim().toLowerCase();
        if (input === 'y' || input === 'yes') {
          await cleanupTestData(
            result.testCompanyData!.id,
            result.testReviewData!.id,
            result.testUser!.id
          );
        } else {
          console.log('⚠️ Test data will remain in the database. Clean it up manually if needed.');
          console.log(`   Test ID: ${testId}`);
        }
        process.exit(0);
      });
    } else {
      console.log('❌ Tests failed or data is incomplete, no cleanup needed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  }); 