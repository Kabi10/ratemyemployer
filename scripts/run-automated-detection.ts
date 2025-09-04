#!/usr/bin/env tsx

/**
 * Automated Detection Script
 * Runs automated analysis to detect financial distress and growth indicators
 */

import { createClient } from '@supabase/supabase-js';
import { runAutomatedDetection, saveDetectedIndicators } from '../src/lib/automatedDetection';
import type { Database } from '../src/types/supabase';
import fs from 'fs';
import path from 'path';

interface DetectionReport {
  timestamp: string;
  processedCompanies: number;
  distressIndicators: number;
  growthIndicators: number;
  savedIndicators: number;
  errors: string[];
  duration: number;
}

async function runDetectionScript() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🤖 Starting automated company detection...');
  console.log('📅 Started at:', new Date().toISOString());

  const startTime = Date.now();

  try {
    // Run automated detection
    console.log('\n🔍 Phase 1: Analyzing companies for indicators...');
    const detectionResult = await runAutomatedDetection(30); // Analyze 30 companies

    console.log('\n📊 Detection Results:');
    console.log(`  Companies Processed: ${detectionResult.processedCompanies}`);
    console.log(`  Distress Indicators Found: ${detectionResult.distressIndicators.length}`);
    console.log(`  Growth Indicators Found: ${detectionResult.growthIndicators.length}`);
    console.log(`  Errors: ${detectionResult.errors.length}`);

    if (detectionResult.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      detectionResult.errors.forEach(error => console.log(`  • ${error}`));
    }

    // Save indicators to database
    console.log('\n💾 Phase 2: Saving indicators to database...');
    const saveResult = await saveDetectedIndicators(detectionResult);

    console.log('\n📈 Save Results:');
    console.log(`  Indicators Saved: ${saveResult.saved}`);
    console.log(`  Save Errors: ${saveResult.errors}`);

    // Generate summary report
    const duration = Date.now() - startTime;
    const report: DetectionReport = {
      timestamp: new Date().toISOString(),
      processedCompanies: detectionResult.processedCompanies,
      distressIndicators: detectionResult.distressIndicators.length,
      growthIndicators: detectionResult.growthIndicators.length,
      savedIndicators: saveResult.saved,
      errors: detectionResult.errors,
      duration
    };

    // Save report to file
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `detection-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📋 Summary Report:');
    console.log('=' .repeat(50));
    console.log(`📊 Companies Analyzed: ${report.processedCompanies}`);
    console.log(`🚨 Distress Indicators: ${report.distressIndicators}`);
    console.log(`🚀 Growth Indicators: ${report.growthIndicators}`);
    console.log(`💾 Indicators Saved: ${report.savedIndicators}`);
    console.log(`⏱️  Duration: ${(report.duration / 1000).toFixed(2)}s`);
    console.log(`📄 Report: ${reportPath}`);

    // Show breakdown by indicator type
    if (detectionResult.distressIndicators.length > 0) {
      console.log('\n🚨 Distress Indicators Breakdown:');
      const distressTypes = detectionResult.distressIndicators.reduce((acc, indicator) => {
        acc[indicator.indicator_type] = (acc[indicator.indicator_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(distressTypes).forEach(([type, count]) => {
        console.log(`  • ${type}: ${count}`);
      });
    }

    if (detectionResult.growthIndicators.length > 0) {
      console.log('\n🚀 Growth Indicators Breakdown:');
      const growthTypes = detectionResult.growthIndicators.reduce((acc, indicator) => {
        acc[indicator.indicator_type] = (acc[indicator.indicator_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(growthTypes).forEach(([type, count]) => {
        console.log(`  • ${type}: ${count}`);
      });
    }

    // Update company status tracking
    console.log('\n🔄 Phase 3: Updating company status tracking...');
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Update distress companies
    const distressCompanies = [...new Set(detectionResult.distressIndicators.map(i => i.company_id))];
    for (const companyId of distressCompanies) {
      const { data: distressScore } = await supabase.rpc('calculate_distress_score', { 
        company_id_param: companyId 
      });

      if (distressScore && distressScore > 25) {
        await supabase
          .from('company_status_tracking')
          .upsert({
            company_id: companyId,
            status: 'financial_distress',
            confidence_score: Math.min(distressScore, 100),
            automated_detection: true,
            last_updated: new Date().toISOString(),
            notes: `Automated detection: ${distressScore} distress score`
          }, {
            onConflict: 'company_id'
          });
      }
    }

    // Update growth companies
    const growthCompanies = [...new Set(detectionResult.growthIndicators.map(i => i.company_id))];
    for (const companyId of growthCompanies) {
      const { data: growthScore } = await supabase.rpc('calculate_growth_score', { 
        company_id_param: companyId 
      });

      if (growthScore && growthScore > 25) {
        await supabase
          .from('company_status_tracking')
          .upsert({
            company_id: companyId,
            status: 'rising_startup',
            confidence_score: Math.min(growthScore, 100),
            automated_detection: true,
            last_updated: new Date().toISOString(),
            notes: `Automated detection: ${growthScore} growth score`
          }, {
            onConflict: 'company_id'
          });
      }
    }

    console.log(`✅ Updated status for ${distressCompanies.length + growthCompanies.length} companies`);

    console.log('\n🎉 Automated detection completed successfully!');
    
    if (detectionResult.errors.length > 0 || saveResult.errors > 0) {
      console.log(`⚠️  Note: ${detectionResult.errors.length + saveResult.errors} errors occurred. Check logs for details.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during automated detection:', error);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Automated Detection Script

Usage: tsx scripts/run-automated-detection.ts [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be detected without saving to database
  --verbose      Enable verbose logging

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL      Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Your Supabase service role key

Examples:
  tsx scripts/run-automated-detection.ts
  tsx scripts/run-automated-detection.ts --verbose
  tsx scripts/run-automated-detection.ts --dry-run
`);
  process.exit(0);
}

if (args.includes('--dry-run')) {
  console.log('🔍 DRY RUN MODE: No changes will be made to the database');
  console.log('This would analyze companies and detect indicators without saving them.');
  
  // Run detection without saving
  runAutomatedDetection(10).then(result => {
    console.log('\n📊 Detection Results (Dry Run):');
    console.log(`  Companies Processed: ${result.processedCompanies}`);
    console.log(`  Distress Indicators Found: ${result.distressIndicators.length}`);
    console.log(`  Growth Indicators Found: ${result.growthIndicators.length}`);
    console.log(`  Errors: ${result.errors.length}`);
    
    if (result.distressIndicators.length > 0) {
      console.log('\n🚨 Sample Distress Indicators:');
      result.distressIndicators.slice(0, 3).forEach(indicator => {
        console.log(`  • ${indicator.indicator_type}: ${indicator.description}`);
      });
    }
    
    if (result.growthIndicators.length > 0) {
      console.log('\n🚀 Sample Growth Indicators:');
      result.growthIndicators.slice(0, 3).forEach(indicator => {
        console.log(`  • ${indicator.indicator_type}: ${indicator.description}`);
      });
    }
  }).catch(console.error);
} else {
  // Run the full detection
  runDetectionScript().catch(console.error);
}
