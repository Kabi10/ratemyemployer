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

async function auditDatabase() {
  try {
    console.log('\nDatabase Audit Report');
    console.log('===================\n');

    // 1. Check table structures and relationships
    console.log('Table Structures:');
    console.log('----------------');
    
    // Get companies table info
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (companiesError) {
      console.error('Error accessing companies table:', companiesError);
    } else {
      console.log('\nCompanies Table Columns:');
      Object.keys(companies[0] || {}).forEach(column => {
        console.log(`- ${column}: ${typeof companies[0][column]}`);
      });
    }

    // Get reviews table info
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);

    if (reviewsError) {
      console.error('Error accessing reviews table:', reviewsError);
    } else {
      console.log('\nReviews Table Columns:');
      Object.keys(reviews[0] || {}).forEach(column => {
        console.log(`- ${column}: ${typeof reviews[0][column]}`);
      });
    }

    // 2. Check for orphaned records
    console.log('\nData Integrity Check:');
    console.log('-------------------');
    
    const { data: orphanedReviews, error: orphanedError } = await supabase
      .from('reviews')
      .select('id, company_id')
      .not('company_id', 'in', '(select id from companies)');

    if (orphanedError) {
      console.error('Error checking orphaned reviews:', orphanedError);
    } else {
      console.log(`Orphaned Reviews (no company): ${orphanedReviews.length}`);
    }

    // 3. Check RLS policies
    console.log('\nRow Level Security Policies:');
    console.log('-------------------------');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies')
      .select('*');

    if (policiesError) {
      console.log('Note: Could not fetch RLS policies directly. Please check Supabase dashboard.');
    } else {
      console.log('Active Policies:', policies);
    }

    // 4. Check user roles and permissions
    console.log('\nUser Roles and Permissions:');
    console.log('-------------------------');
    
    const { data: roles, error: rolesError } = await supabase
      .rpc('get_roles')
      .select('*');

    if (rolesError) {
      console.log('Note: Could not fetch roles directly. Please check Supabase dashboard.');
    } else {
      console.log('Defined Roles:', roles);
    }

    // 5. Check for null values in required fields
    console.log('\nNull Value Check:');
    console.log('---------------');
    
    const { data: nullCompanyFields, error: nullCompanyError } = await supabase
      .from('companies')
      .select('id, name')
      .or('name.is.null,industry.is.null');

    if (nullCompanyError) {
      console.error('Error checking null company fields:', nullCompanyError);
    } else {
      console.log(`Companies with null required fields: ${nullCompanyFields.length}`);
    }

    const { data: nullReviewFields, error: nullReviewError } = await supabase
      .from('reviews')
      .select('id, title')
      .or('title.is.null,rating.is.null,company_id.is.null');

    if (nullReviewError) {
      console.error('Error checking null review fields:', nullReviewError);
    } else {
      console.log(`Reviews with null required fields: ${nullReviewFields.length}`);
    }

    // 6. Check for duplicate companies
    console.log('\nDuplicate Check:');
    console.log('---------------');
    
    const { data: duplicateCompanies, error: duplicateError } = await supabase
      .from('companies')
      .select('name, count')
      .group('name')
      .having('count(*) > 1');

    if (duplicateError) {
      console.error('Error checking duplicate companies:', duplicateError);
    } else {
      console.log(`Potential duplicate companies: ${duplicateCompanies.length}`);
      if (duplicateCompanies.length > 0) {
        duplicateCompanies.forEach(dup => {
          console.log(`- ${dup.name}: ${dup.count} entries`);
        });
      }
    }

  } catch (error) {
    console.error('Error during audit:', error);
  }
}

// Run the audit
auditDatabase().catch(console.error); 