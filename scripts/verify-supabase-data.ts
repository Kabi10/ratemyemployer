import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

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

// Define verification schemas (should match your form schemas)
const companyVerificationSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  industry: z.string().nullable(),
  location: z.string().min(1),
  created_at: z.string().datetime().nullable(),
  created_by: z.string().uuid().nullable(),
  website: z.string().url().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  average_rating: z.number().min(0).max(5).nullable().optional(),
  total_reviews: z.number().min(0).nullable().optional(),
  updated_at: z.string().datetime().nullable().optional(),
});

const reviewVerificationSchema = z.object({
  id: z.number(),
  company_id: z.number().nullable(),
  rating: z.number().min(1).max(5).nullable(),
  title: z.string().nullable(),
  pros: z.string().nullable(),
  cons: z.string().nullable(),
  created_at: z.string().datetime().nullable(),
  user_id: z.string().uuid().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']).nullable(),
});

// Verification functions
async function verifyCompanies() {
  console.log('🔍 Verifying companies table...');
  
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Error fetching companies:', error);
    return;
  }
  
  if (!companies || companies.length === 0) {
    console.log('⚠️ No companies found in the database');
    return;
  }
  
  console.log(`✅ Found ${companies.length} companies`);
  
  // Validate each company against schema
  companies.forEach((company, index) => {
    try {
      companyVerificationSchema.parse(company);
      console.log(`✅ Company #${index + 1} (${company.name}) is valid`);
    } catch (validationError) {
      console.error(`❌ Company #${index + 1} (${company.name}) validation failed:`, validationError);
    }
  });
  
  // Check for relationships
  console.log('🔍 Checking company-review relationships...');
  
  for (const company of companies) {
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', company.id)
      .limit(5);
    
    if (reviewError) {
      console.error(`❌ Error fetching reviews for company ${company.name}:`, reviewError);
      continue;
    }
    
    console.log(`✅ Company ${company.name} has ${reviews?.length || 0} reviews`);
  }
}

async function verifyReviews() {
  console.log('🔍 Verifying reviews table...');
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, companies(name)')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Error fetching reviews:', error);
    return;
  }
  
  if (!reviews || reviews.length === 0) {
    console.log('⚠️ No reviews found in the database');
    return;
  }
  
  console.log(`✅ Found ${reviews.length} reviews`);
  
  // Validate each review against schema
  reviews.forEach((review, index) => {
    try {
      // Extract the review data without the joined company
      const { companies, ...reviewData } = review;
      reviewVerificationSchema.parse(reviewData);
      console.log(`✅ Review #${index + 1} for company ${companies?.name} is valid`);
    } catch (validationError) {
      console.error(`❌ Review #${index + 1} validation failed:`, validationError);
    }
  });
  
  // Check for data anomalies
  console.log('🔍 Checking for data anomalies...');
  
  const { data: anomalies, error: anomalyError } = await supabase
    .from('reviews')
    .select('id, rating, company_id, companies(name)')
    .or('rating.lt.1,rating.gt.5');
  
  if (anomalyError) {
    console.error('❌ Error checking for anomalies:', anomalyError);
    return;
  }
  
  if (anomalies && anomalies.length > 0) {
    console.error(`❌ Found ${anomalies.length} reviews with invalid ratings:`, anomalies);
  } else {
    console.log('✅ No rating anomalies found');
  }
}

// Check for foreign key integrity
async function verifyForeignKeyIntegrity() {
  console.log('🔍 Checking foreign key integrity...');
  
  // Check for reviews with invalid company_id
  const { data: orphanedReviews, error } = await supabase
    .from('reviews')
    .select('id, company_id, title')
    .not('company_id', 'is', null)
    .filter('company_id', 'not.in', '(select id from companies)');
  
  if (error) {
    console.error('❌ Error checking for orphaned reviews:', error);
    return;
  }
  
  if (orphanedReviews && orphanedReviews.length > 0) {
    console.error(`❌ Found ${orphanedReviews.length} reviews with invalid company_id:`, orphanedReviews);
  } else {
    console.log('✅ No orphaned reviews found');
  }
}

// Verify timestamps are set correctly
async function verifyTimestamps() {
  console.log('🔍 Checking timestamp integrity...');
  
  // Check for companies with missing timestamps
  const { data: companiesWithoutTimestamps, error } = await supabase
    .from('companies')
    .select('id, name')
    .or('created_at.is.null,updated_at.is.null');
  
  if (error) {
    console.error('❌ Error checking for companies without timestamps:', error);
    return;
  }
  
  if (companiesWithoutTimestamps && companiesWithoutTimestamps.length > 0) {
    console.error(`❌ Found ${companiesWithoutTimestamps.length} companies with missing timestamps:`, companiesWithoutTimestamps);
  } else {
    console.log('✅ All companies have proper timestamps');
  }
  
  // Check for reviews with missing timestamps
  const { data: reviewsWithoutTimestamps, error: reviewError } = await supabase
    .from('reviews')
    .select('id, title')
    .is('created_at', null);
  
  if (reviewError) {
    console.error('❌ Error checking for reviews without timestamps:', reviewError);
    return;
  }
  
  if (reviewsWithoutTimestamps && reviewsWithoutTimestamps.length > 0) {
    console.error(`❌ Found ${reviewsWithoutTimestamps.length} reviews with missing timestamps:`, reviewsWithoutTimestamps);
  } else {
    console.log('✅ All reviews have proper timestamps');
  }
}

// Generate a verification report
async function generateReport() {
  const reportPath = path.resolve(process.cwd(), 'supabase-verification-report.json');
  
  // Get counts for each table
  const { count: companiesCount, error: companiesError } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });
  
  const { count: reviewsCount, error: reviewsError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });
  
  const { count: usersCount, error: usersError } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });
  
  // Get latest entries
  const { data: latestCompany, error: latestCompanyError } = await supabase
    .from('companies')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  const { data: latestReview, error: latestReviewError } = await supabase
    .from('reviews')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  const report = {
    timestamp: new Date().toISOString(),
    counts: {
      companies: companiesCount ?? 0,
      reviews: reviewsCount ?? 0,
      users: usersCount ?? 0,
    },
    latest: {
      company: latestCompany ?? null,
      review: latestReview ?? null,
    },
    errors: {
      companies: companiesError ? companiesError.message : null,
      reviews: reviewsError ? reviewsError.message : null,
      users: usersError ? usersError.message : null,
      latestCompany: latestCompanyError ? latestCompanyError.message : null,
      latestReview: latestReviewError ? latestReviewError.message : null,
    }
  };
  
  // Write report to file
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Verification report generated at ${reportPath}`);
  
  return report;
}

// Run verification
async function runVerification() {
  console.log('🚀 Starting database verification...');
  
  await verifyCompanies();
  await verifyReviews();
  await verifyForeignKeyIntegrity();
  await verifyTimestamps();
  const report = await generateReport();
  
  console.log('✅ Verification complete');
  console.log('📊 Summary:');
  console.log(`   Companies: ${report.counts.companies}`);
  console.log(`   Reviews: ${report.counts.reviews}`);
  console.log(`   Users: ${report.counts.users}`);
  
  if (report.latest.company) {
    console.log(`   Latest company: ${report.latest.company.name} (${new Date(report.latest.company.created_at).toLocaleString()})`);
  }
  
  if (report.latest.review) {
    console.log(`   Latest review: ${report.latest.review.title} (${new Date(report.latest.review.created_at).toLocaleString()})`);
  }
}

// Execute the verification
runVerification().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
}); 