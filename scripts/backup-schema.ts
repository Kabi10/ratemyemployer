#!/usr/bin/env tsx

/**
 * Schema Backup Script
 * Creates a backup of the current database schema before applying MVP simplification
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function backupSchema() {
  console.log('🔄 Starting schema backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(process.cwd(), 'backups');
  
  try {
    // Backup companies table
    console.log('📊 Backing up companies table...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('Error backing up companies:', companiesError);
    } else {
      writeFileSync(
        join(backupDir, `companies_${timestamp}.json`),
        JSON.stringify(companies, null, 2)
      );
      console.log(`✅ Companies backup saved: companies_${timestamp}.json`);
    }

    // Backup reviews table
    console.log('📊 Backing up reviews table...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*');
    
    if (reviewsError) {
      console.error('Error backing up reviews:', reviewsError);
    } else {
      writeFileSync(
        join(backupDir, `reviews_${timestamp}.json`),
        JSON.stringify(reviews, null, 2)
      );
      console.log(`✅ Reviews backup saved: reviews_${timestamp}.json`);
    }

    // Backup company_news table if it exists
    console.log('📊 Backing up company_news table...');
    const { data: companyNews, error: companyNewsError } = await supabase
      .from('company_news')
      .select('*');
    
    if (companyNewsError) {
      console.log('ℹ️ Company news table not found or empty (this is expected)');
    } else {
      writeFileSync(
        join(backupDir, `company_news_${timestamp}.json`),
        JSON.stringify(companyNews, null, 2)
      );
      console.log(`✅ Company news backup saved: company_news_${timestamp}.json`);
    }

    // Backup user_profiles table if it exists
    console.log('📊 Backing up user_profiles table...');
    const { data: userProfiles, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (userProfilesError) {
      console.log('ℹ️ User profiles table not found or empty (this is expected)');
    } else {
      writeFileSync(
        join(backupDir, `user_profiles_${timestamp}.json`),
        JSON.stringify(userProfiles, null, 2)
      );
      console.log(`✅ User profiles backup saved: user_profiles_${timestamp}.json`);
    }

    // Create a schema info backup
    console.log('📊 Creating schema information backup...');
    const schemaInfo = {
      timestamp,
      tables_backed_up: ['companies', 'reviews', 'company_news', 'user_profiles'],
      migration_applied: '20250910_simplify_mvp_schema',
      backup_reason: 'MVP schema simplification',
      notes: 'Backup created before removing non-MVP tables and columns'
    };

    writeFileSync(
      join(backupDir, `schema_backup_info_${timestamp}.json`),
      JSON.stringify(schemaInfo, null, 2)
    );

    console.log('✅ Schema backup completed successfully!');
    console.log(`📁 Backup files saved in: ${backupDir}`);
    console.log(`🕐 Timestamp: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Error during backup:', error);
    process.exit(1);
  }
}

// Run the backup
backupSchema().catch(console.error);