import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';

/**
 * Form Submission Monitoring Script
 * 
 * This script monitors form submissions in real-time by subscribing to
 * Supabase realtime changes for companies and reviews tables.
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
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Create log directory if it doesn't exist
const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Log file paths
const companyLogPath = path.resolve(logDir, 'company-submissions.log');
const reviewLogPath = path.resolve(logDir, 'review-submissions.log');

// Function to log to file
function logToFile(filePath: string, data: any) {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const logEntry = `[${timestamp}] ${JSON.stringify(data)}\n`;
  
  fs.appendFileSync(filePath, logEntry);
  console.log(`📝 Logged to ${path.basename(filePath)}`);
}

// Function to start monitoring companies
function monitorCompanies() {
  console.log('👀 Monitoring company submissions...');
  
  const companyChannel = supabase
    .channel('companies-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'companies',
      },
      (payload) => {
        console.log('🏢 New company created:', payload.new);
        logToFile(companyLogPath, {
          event: 'INSERT',
          data: payload.new,
          timestamp: new Date().toISOString(),
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'companies',
      },
      (payload) => {
        console.log('🔄 Company updated:', payload.new);
        logToFile(companyLogPath, {
          event: 'UPDATE',
          data: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe();
  
  return companyChannel;
}

// Function to start monitoring reviews
function monitorReviews() {
  console.log('👀 Monitoring review submissions...');
  
  const reviewChannel = supabase
    .channel('reviews-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'reviews',
      },
      (payload) => {
        console.log('📝 New review created:', payload.new);
        logToFile(reviewLogPath, {
          event: 'INSERT',
          data: payload.new,
          timestamp: new Date().toISOString(),
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'reviews',
      },
      (payload) => {
        console.log('🔄 Review updated:', payload.new);
        logToFile(reviewLogPath, {
          event: 'UPDATE',
          data: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe();
  
  return reviewChannel;
}

// Function to fetch recent submissions
async function fetchRecentSubmissions() {
  console.log('🔍 Fetching recent submissions...');
  
  // Fetch recent companies
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (companiesError) {
    console.error('❌ Error fetching recent companies:', companiesError);
  } else {
    console.log(`✅ Found ${companies?.length || 0} recent companies`);
    companies?.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (${format(new Date(company.created_at || ''), 'yyyy-MM-dd HH:mm:ss')})`);
    });
  }
  
  // Fetch recent reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*, companies(name)')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (reviewsError) {
    console.error('❌ Error fetching recent reviews:', reviewsError);
  } else {
    console.log(`✅ Found ${reviews?.length || 0} recent reviews`);
    reviews?.forEach((review, index) => {
      console.log(`   ${index + 1}. "${review.title}" for ${review.companies?.name} (${format(new Date(review.created_at || ''), 'yyyy-MM-dd HH:mm:ss')})`);
    });
  }
}

// Function to generate a summary report
async function generateSummaryReport() {
  console.log('📊 Generating summary report...');
  
  // Get counts for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { count: todayCompaniesCount, error: todayCompaniesError } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());
  
  const { count: todayReviewsCount, error: todayReviewsError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());
  
  // Get counts for all time
  const { count: totalCompaniesCount, error: totalCompaniesError } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalReviewsCount, error: totalReviewsError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    today: {
      companies: todayCompaniesCount || 0,
      reviews: todayReviewsCount || 0,
    },
    total: {
      companies: totalCompaniesCount || 0,
      reviews: totalReviewsCount || 0,
    },
    errors: {
      todayCompanies: todayCompaniesError ? todayCompaniesError.message : null,
      todayReviews: todayReviewsError ? todayReviewsError.message : null,
      totalCompanies: totalCompaniesError ? totalCompaniesError.message : null,
      totalReviews: totalReviewsError ? totalReviewsError.message : null,
    },
  };
  
  // Write report to file
  const reportPath = path.resolve(logDir, `submission-summary-${format(new Date(), 'yyyy-MM-dd')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Summary report generated at ${reportPath}`);
  
  // Print summary
  console.log('\n📊 Submission Summary:');
  console.log(`   Today: ${report.today.companies} companies, ${report.today.reviews} reviews`);
  console.log(`   Total: ${report.total.companies} companies, ${report.total.reviews} reviews`);
  
  return report;
}

// Main function
async function main() {
  console.log('🚀 Starting form submission monitoring...');
  
  // Fetch recent submissions
  await fetchRecentSubmissions();
  
  // Generate initial summary report
  await generateSummaryReport();
  
  // Start monitoring
  const companyChannel = monitorCompanies();
  const reviewChannel = monitorReviews();
  
  console.log('\n👀 Monitoring active. Press Ctrl+C to stop...');
  
  // Generate summary report every hour
  const reportInterval = setInterval(async () => {
    await generateSummaryReport();
  }, 60 * 60 * 1000); // 1 hour
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping monitoring...');
    
    // Unsubscribe from channels
    await supabase.removeChannel(companyChannel);
    await supabase.removeChannel(reviewChannel);
    
    // Clear interval
    clearInterval(reportInterval);
    
    // Generate final summary report
    await generateSummaryReport();
    
    console.log('👋 Monitoring stopped. Goodbye!');
    process.exit(0);
  });
}

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
}); 