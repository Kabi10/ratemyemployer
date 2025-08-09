#!/usr/bin/env tsx

/**
 * Web Scraping System Runner
 * Comprehensive script for managing and running web scraping operations
 */

import { createClient } from '@supabase/supabase-js';
import { scrapingApi } from '../src/lib/webScraping/scrapingApi';
import { dataQualityValidator } from '../src/lib/webScraping/dataQuality';
import type { Database } from '../src/types/supabase';
import type { CreateScrapingJobRequest, ScraperType, DataSource } from '../src/types/webScraping';
import fs from 'fs';
import path from 'path';

interface ScrapingReport {
  timestamp: string;
  jobs_created: number;
  jobs_completed: number;
  jobs_failed: number;
  data_items_scraped: number;
  average_quality_score: number;
  errors: string[];
  duration: number;
}

async function runWebScraping() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🕷️  Starting web scraping system...');
  console.log('📅 Started at:', new Date().toISOString());

  const startTime = Date.now();

  try {
    // Start the scraping engine
    console.log('\n🚀 Phase 1: Starting scraping engine...');
    await scrapingApi.startEngine();

    // Create sample scraping jobs
    console.log('\n📋 Phase 2: Creating scraping jobs...');
    const jobs = await createSampleJobs();

    console.log(`✅ Created ${jobs.length} scraping jobs`);

    // Monitor job execution
    console.log('\n⏳ Phase 3: Monitoring job execution...');
    await monitorJobs(jobs.map(j => j.job.id));

    // Validate scraped data
    console.log('\n🔍 Phase 4: Validating scraped data...');
    const validationResults = await validateScrapedData();

    // Generate report
    const duration = Date.now() - startTime;
    const report: ScrapingReport = {
      timestamp: new Date().toISOString(),
      jobs_created: jobs.length,
      jobs_completed: validationResults.completedJobs,
      jobs_failed: validationResults.failedJobs,
      data_items_scraped: validationResults.dataItemsCount,
      average_quality_score: validationResults.averageQuality,
      errors: validationResults.errors,
      duration
    };

    // Save report
    await saveReport(report);

    console.log('\n📊 Scraping Summary:');
    console.log('=' .repeat(50));
    console.log(`📋 Jobs Created: ${report.jobs_created}`);
    console.log(`✅ Jobs Completed: ${report.jobs_completed}`);
    console.log(`❌ Jobs Failed: ${report.jobs_failed}`);
    console.log(`📦 Data Items Scraped: ${report.data_items_scraped}`);
    console.log(`🎯 Average Quality Score: ${(report.average_quality_score * 100).toFixed(1)}%`);
    console.log(`⏱️  Duration: ${(report.duration / 1000).toFixed(2)}s`);

    if (report.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      report.errors.forEach(error => console.log(`  • ${error}`));
    }

    console.log('\n🎉 Web scraping completed successfully!');

  } catch (error) {
    console.error('\n❌ Fatal error during web scraping:', error);
    process.exit(1);
  }
}

/**
 * Create sample scraping jobs for demonstration
 */
async function createSampleJobs(): Promise<Array<{ job: any }>> {
  const jobs = [];

  const sampleJobs: CreateScrapingJobRequest[] = [
    {
      job_name: 'Google Company Data Scraping',
      scraper_type: 'company_data',
      data_source: 'company_website',
      target_url: 'https://about.google',
      target_company_name: 'Google',
      priority: 8,
      configuration: {
        fields_to_scrape: ['name', 'description', 'industry', 'logo_url'],
        verify_data: true
      }
    },
    {
      job_name: 'Microsoft News Monitoring',
      scraper_type: 'news',
      data_source: 'news_sites',
      target_company_name: 'Microsoft',
      priority: 7,
      configuration: {
        keywords: ['Microsoft', 'Azure', 'Office 365'],
        max_articles: 15,
        sentiment_analysis: true
      }
    },
    {
      job_name: 'Apple Job Listings',
      scraper_type: 'job_listings',
      data_source: 'company_website',
      target_url: 'https://jobs.apple.com',
      target_company_name: 'Apple',
      priority: 6,
      configuration: {
        job_types: ['Full-time', 'Contract'],
        max_listings: 20,
        include_salary: true
      }
    },
    {
      job_name: 'Amazon Reviews Collection',
      scraper_type: 'reviews',
      data_source: 'review_sites',
      target_company_name: 'Amazon',
      priority: 5,
      configuration: {
        max_reviews: 25,
        min_rating: 1,
        max_rating: 5,
        include_responses: false
      }
    }
  ];

  for (const jobRequest of sampleJobs) {
    try {
      const job = await scrapingApi.createScrapingJob(jobRequest);
      jobs.push(job);
      console.log(`  ✅ Created job: ${jobRequest.job_name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create job ${jobRequest.job_name}:`, error);
    }
  }

  return jobs;
}

/**
 * Monitor job execution
 */
async function monitorJobs(jobIds: string[]): Promise<void> {
  const maxWaitTime = 5 * 60 * 1000; // 5 minutes
  const checkInterval = 10 * 1000; // 10 seconds
  const startTime = Date.now();

  console.log(`Monitoring ${jobIds.length} jobs...`);

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const { jobs } = await scrapingApi.getScrapingJobs({}, 100, 0);
      const relevantJobs = jobs.filter(job => jobIds.includes(job.id));
      
      const pending = relevantJobs.filter(job => job.status === 'pending').length;
      const running = relevantJobs.filter(job => job.status === 'running').length;
      const completed = relevantJobs.filter(job => job.status === 'completed').length;
      const failed = relevantJobs.filter(job => job.status === 'failed').length;

      console.log(`  📊 Status: ${pending} pending, ${running} running, ${completed} completed, ${failed} failed`);

      // Check if all jobs are done
      if (pending === 0 && running === 0) {
        console.log('✅ All jobs completed');
        break;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));

    } catch (error) {
      console.error('Error monitoring jobs:', error);
      break;
    }
  }
}

/**
 * Validate scraped data
 */
async function validateScrapedData(): Promise<{
  completedJobs: number;
  failedJobs: number;
  dataItemsCount: number;
  averageQuality: number;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    // Get job statistics
    const stats = await scrapingApi.getScrapingStats();
    
    // Get recent scraped data
    const { data: scrapedData } = await scrapingApi.getScrapedData({}, 100, 0);

    // Validate data quality
    if (scrapedData.length > 0) {
      console.log(`🔍 Validating ${scrapedData.length} data items...`);
      
      const validationResults = await dataQualityValidator.validateBatch(scrapedData);
      
      console.log(`  ✅ Valid items: ${validationResults.validCount}`);
      console.log(`  ❌ Invalid items: ${validationResults.invalidCount}`);
      console.log(`  🎯 Average quality: ${(validationResults.averageQuality * 100).toFixed(1)}%`);

      // Log validation errors
      for (const result of validationResults.results) {
        if (!result.isValid) {
          errors.push(`Data item ${result.id}: ${result.errors.join(', ')}`);
        }
      }

      return {
        completedJobs: stats.completed_jobs,
        failedJobs: stats.failed_jobs,
        dataItemsCount: scrapedData.length,
        averageQuality: validationResults.averageQuality,
        errors
      };
    }

    return {
      completedJobs: stats.completed_jobs,
      failedJobs: stats.failed_jobs,
      dataItemsCount: 0,
      averageQuality: 0,
      errors
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Validation error: ${errorMsg}`);
    
    return {
      completedJobs: 0,
      failedJobs: 0,
      dataItemsCount: 0,
      averageQuality: 0,
      errors
    };
  }
}

/**
 * Save scraping report
 */
async function saveReport(report: ScrapingReport): Promise<void> {
  try {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `scraping-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 Report saved: ${reportPath}`);
  } catch (error) {
    console.error('Error saving report:', error);
  }
}

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Web Scraping System Runner

Usage: tsx scripts/run-web-scraping.ts [options]

Options:
  --help, -h     Show this help message
  --demo         Run with demo data only
  --monitor      Monitor existing jobs only
  --validate     Validate existing data only

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL      Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Your Supabase service role key

Examples:
  tsx scripts/run-web-scraping.ts
  tsx scripts/run-web-scraping.ts --demo
  tsx scripts/run-web-scraping.ts --monitor
`);
  process.exit(0);
}

if (args.includes('--demo')) {
  console.log('🎭 DEMO MODE: Running with sample data only');
  console.log('This will create sample scraping jobs for demonstration purposes.');
}

if (args.includes('--monitor')) {
  console.log('👀 MONITOR MODE: Monitoring existing jobs only');
  // Implement monitor-only mode
  process.exit(0);
}

if (args.includes('--validate')) {
  console.log('🔍 VALIDATE MODE: Validating existing data only');
  validateScrapedData().then(results => {
    console.log('Validation Results:', results);
  }).catch(console.error);
  process.exit(0);
}

// Run the main scraping system
runWebScraping().catch(console.error);
