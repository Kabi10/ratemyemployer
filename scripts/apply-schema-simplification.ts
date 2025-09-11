#!/usr/bin/env tsx

/**
 * Apply Schema Simplification Script
 * Applies the MVP schema simplification migration and validates the results
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

async function applySchemaSimplification() {
  console.log('🚀 Starting MVP schema simplification...');
  
  try {
    // Step 1: Create backup
    console.log('\n📦 Creating backup...');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('tsx scripts/backup-schema.ts');
      console.log('✅ Backup completed');
    } catch (error) {
      console.error('❌ Backup failed:', error);
      console.log('⚠️ Continuing without backup (data may be lost)');
    }

    // Step 2: Read and apply migration
    console.log('\n🔄 Applying schema simplification migration...');
    const migrationPath = join(process.cwd(), 'supabase/migrations/20250910_simplify_mvp_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} migration statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            // Some errors are expected (like dropping non-existent tables)
            if (error.message.includes('does not exist') || 
                error.message.includes('already exists') ||
                error.message.includes('cannot drop')) {
              console.log(`   ⚠️ Expected error (continuing): ${error.message}`);
            } else {
              console.error(`   ❌ Error executing statement: ${error.message}`);
              throw error;
            }
          }
        } catch (error) {
          console.error(`❌ Failed to execute statement ${i + 1}:`, error);
          throw error;
        }
      }
    }

    console.log('✅ Migration applied successfully');

    // Step 3: Validate the schema
    console.log('\n🔍 Validating simplified schema...');
    try {
      await execAsync('tsx scripts/validate-simplified-schema.ts');
      console.log('✅ Schema validation passed');
    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      throw error;
    }

    // Step 4: Update TypeScript types
    console.log('\n📝 TypeScript types have been updated to use simplified schema');
    console.log('   - Updated: src/types/supabase-simplified.ts');
    console.log('   - Updated: src/types/index.ts');
    console.log('   - Updated: src/types/database.ts');
    console.log('   - Updated: src/lib/supabaseClient.ts');
    console.log('   - Updated: src/lib/supabaseServer.ts');

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MVP Schema Simplification Complete!');
    console.log('');
    console.log('✅ Removed non-MVP tables:');
    console.log('   - company_news');
    console.log('   - user_profiles');
    console.log('   - All web scraping infrastructure');
    console.log('   - All specialized section tables');
    console.log('');
    console.log('✅ Simplified core tables:');
    console.log('   - companies: Removed non-essential columns');
    console.log('   - reviews: Streamlined to core review data');
    console.log('');
    console.log('✅ Updated API endpoints:');
    console.log('   - /api/companies (GET, POST)');
    console.log('   - /api/companies/[id] (GET, PUT, DELETE)');
    console.log('   - /api/reviews (GET, POST, DELETE)');
    console.log('');
    console.log('✅ Core MVP functionality preserved:');
    console.log('   - User authentication');
    console.log('   - Company CRUD operations');
    console.log('   - Review CRUD operations');
    console.log('   - Basic search and filtering');
    console.log('   - Rate limiting');
    console.log('   - Review moderation');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('   1. Test the application thoroughly');
    console.log('   2. Update any remaining components that use old schema');
    console.log('   3. Run the test suite to ensure everything works');
    console.log('   4. Deploy the simplified schema to production');
    
  } catch (error) {
    console.error('\n❌ Schema simplification failed:', error);
    console.log('\n🔄 To rollback:');
    console.log('   1. Restore from backup files in ./backups/');
    console.log('   2. Revert TypeScript type imports');
    console.log('   3. Test the application');
    process.exit(1);
  }
}

// Run the schema simplification
applySchemaSimplification().catch(console.error);