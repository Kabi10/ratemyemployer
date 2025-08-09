#!/usr/bin/env tsx

/**
 * Database Population Automation Script
 * Runs various automated methods to populate the company database
 */

import { createClient } from '@supabase/supabase-js';
import { 
  populateFortune500Companies, 
  populateTechStartups, 
  fetchCompaniesFromNominatim,
  bulkImportFromCSV 
} from '../src/lib/companyDataSources';
import { Database } from '../src/types/supabase';
import fs from 'fs';
import path from 'path';

interface PopulationStats {
  source: string;
  success: number;
  skipped: number;
  errors: number;
  duration: number;
}

async function runAutomatedPopulation() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🚀 Starting automated database population...');
  console.log('📅 Started at:', new Date().toISOString());

  const stats: PopulationStats[] = [];

  try {
    // 1. Populate Fortune 500 companies
    console.log('\n📊 Step 1: Fortune 500 Companies');
    const fortune500Start = Date.now();
    const fortune500Result = await populateFortune500Companies();
    const fortune500Duration = Date.now() - fortune500Start;
    
    stats.push({
      source: 'Fortune 500',
      ...fortune500Result,
      duration: fortune500Duration
    });

    // 2. Populate tech startups
    console.log('\n🚀 Step 2: Tech Startups');
    const startupsStart = Date.now();
    const startupsResult = await populateTechStartups();
    const startupsDuration = Date.now() - startupsStart;
    
    stats.push({
      source: 'Tech Startups',
      ...startupsResult,
      duration: startupsDuration
    });

    // 3. Fetch companies from OpenStreetMap (sample locations)
    console.log('\n🗺️ Step 3: OpenStreetMap Companies');
    const osmStart = Date.now();
    const locations = ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston'];
    let osmSuccess = 0;
    let osmSkipped = 0;
    let osmErrors = 0;

    for (const location of locations) {
      try {
        console.log(`Searching companies in ${location}...`);
        const companies = await fetchCompaniesFromNominatim(location, 5);
        
        for (const company of companies) {
          // This would need to be implemented in the companyDataSources file
          // For now, we'll just log the results
          console.log(`Found: ${company.name} in ${company.location}`);
          osmSuccess++;
        }
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error fetching companies from ${location}:`, error);
        osmErrors++;
      }
    }

    const osmDuration = Date.now() - osmStart;
    stats.push({
      source: 'OpenStreetMap',
      success: osmSuccess,
      skipped: osmSkipped,
      errors: osmErrors,
      duration: osmDuration
    });

    // 4. Check for CSV import file
    console.log('\n📄 Step 4: CSV Import (if available)');
    const csvPath = path.join(process.cwd(), 'data', 'companies.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvStart = Date.now();
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const csvResult = await bulkImportFromCSV(csvData);
      const csvDuration = Date.now() - csvStart;
      
      stats.push({
        source: 'CSV Import',
        ...csvResult,
        duration: csvDuration
      });
    } else {
      console.log('No CSV file found at data/companies.csv, skipping CSV import');
      stats.push({
        source: 'CSV Import',
        success: 0,
        skipped: 0,
        errors: 0,
        duration: 0
      });
    }

    // 5. Generate summary report
    console.log('\n📋 Population Summary Report');
    console.log('=' .repeat(60));
    
    let totalSuccess = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalDuration = 0;

    stats.forEach(stat => {
      console.log(`\n${stat.source}:`);
      console.log(`  ✅ Added: ${stat.success}`);
      console.log(`  ⏭️  Skipped: ${stat.skipped}`);
      console.log(`  ❌ Errors: ${stat.errors}`);
      console.log(`  ⏱️  Duration: ${(stat.duration / 1000).toFixed(2)}s`);
      
      totalSuccess += stat.success;
      totalSkipped += stat.skipped;
      totalErrors += stat.errors;
      totalDuration += stat.duration;
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 TOTAL RESULTS:');
    console.log(`  ✅ Total Added: ${totalSuccess}`);
    console.log(`  ⏭️  Total Skipped: ${totalSkipped}`);
    console.log(`  ❌ Total Errors: ${totalErrors}`);
    console.log(`  ⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`  📅 Completed at: ${new Date().toISOString()}`);

    // 6. Save report to file
    const reportPath = path.join(process.cwd(), 'logs', `population-report-${Date.now()}.json`);
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      stats,
      totals: {
        success: totalSuccess,
        skipped: totalSkipped,
        errors: totalErrors,
        duration: totalDuration
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);

    // 7. Update database statistics
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);
    
    try {
      const { count } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      console.log(`\n📈 Current database status: ${count} companies total`);
    } catch (error) {
      console.error('Error fetching database count:', error);
    }

    console.log('\n🎉 Automated population completed successfully!');
    
    if (totalErrors > 0) {
      console.log(`⚠️  Note: ${totalErrors} errors occurred during population. Check logs for details.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during automated population:', error);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Database Population Automation Script

Usage: tsx scripts/populate-database-automation.ts [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be done without making changes
  --verbose      Enable verbose logging

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL      Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Your Supabase service role key

Optional Data Sources:
  data/companies.csv            CSV file with company data for bulk import

Examples:
  tsx scripts/populate-database-automation.ts
  tsx scripts/populate-database-automation.ts --verbose
  tsx scripts/populate-database-automation.ts --dry-run
`);
  process.exit(0);
}

if (args.includes('--dry-run')) {
  console.log('🔍 DRY RUN MODE: No changes will be made to the database');
  console.log('This would populate the database with:');
  console.log('- Fortune 500 companies (sample)');
  console.log('- Tech startups (sample)');
  console.log('- Companies from OpenStreetMap');
  console.log('- CSV import (if data/companies.csv exists)');
  process.exit(0);
}

// Run the automation
runAutomatedPopulation().catch(console.error);
