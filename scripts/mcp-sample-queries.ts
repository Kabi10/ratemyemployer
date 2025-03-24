import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import dotenv from 'dotenv';
import path from 'path';
import chalk from 'chalk';

/**
 * MCP Sample Queries Script
 * 
 * This script demonstrates how to use the same queries that MCP would generate
 * directly in your code. You can use these as examples when working with MCP.
 */

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error(chalk.red('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable'));
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(chalk.red('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable'));
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Example 1: Get top-rated companies
async function getTopRatedCompanies() {
  console.log(chalk.blue('\n🏢 Getting top-rated companies...'));
  
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, industry, location, average_rating, total_reviews')
    .not('average_rating', 'is', null)
    .order('average_rating', { ascending: false })
    .order('total_reviews', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error(chalk.red('❌ Error fetching top-rated companies:'), error);
    return;
  }
  
  console.log(chalk.green(`✅ Found ${data?.length || 0} top-rated companies:`));
  data?.forEach((company, index) => {
    console.log(chalk.blue(`   ${index + 1}. ${company.name} (${company.industry || 'Unknown industry'})`));
    console.log(chalk.gray(`      Rating: ${company.average_rating}⭐ | Reviews: ${company.total_reviews} | Location: ${company.location}`));
  });
  
  return data;
}

// Example 2: Find recent reviews for a specific company
async function getRecentReviewsForCompany(companyId: number) {
  console.log(chalk.blue(`\n📝 Getting recent reviews for company ID ${companyId}...`));
  
  const { data, error } = await supabase
    .from('reviews')
    .select('id, title, rating, pros, cons, created_at, employment_status, position')
    .eq('company_id', companyId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error(chalk.red(`❌ Error fetching reviews for company ID ${companyId}:`), error);
    return;
  }
  
  console.log(chalk.green(`✅ Found ${data?.length || 0} recent reviews:`));
  data?.forEach((review, index) => {
    console.log(chalk.blue(`   ${index + 1}. "${review.title}" (${review.rating}⭐)`));
    console.log(chalk.gray(`      Pros: ${review.pros?.substring(0, 50)}...`));
    console.log(chalk.gray(`      Cons: ${review.cons?.substring(0, 50)}...`));
    console.log(chalk.gray(`      Position: ${review.position} | Status: ${review.employment_status}`));
    console.log(chalk.gray(`      Date: ${review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown date'}`));
  });
  
  return data;
}

// Example 3: Calculate average ratings by industry
async function getAverageRatingsByIndustry() {
  console.log(chalk.blue('\n📊 Calculating average ratings by industry...'));
  
  try {
    const { data, error } = await supabase.rpc('get_industry_statistics');
    
    if (error) {
      console.error(chalk.red('❌ Error calculating average ratings by industry:'), error);
      
      // Fallback to direct query if RPC function doesn't exist
      console.log(chalk.yellow('⚠️ Falling back to direct query...'));
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('companies')
        .select('industry, average_rating')
        .not('industry', 'is', null)
        .not('average_rating', 'is', null);
      
      if (fallbackError) {
        console.error(chalk.red('❌ Error with fallback query:'), fallbackError);
        return;
      }
      
      // Calculate averages manually
      const industries: Record<string, { sum: number; count: number }> = {};
      
      fallbackData?.forEach(company => {
        const industry = company.industry as string;
        if (!industries[industry]) {
          industries[industry] = { sum: 0, count: 0 };
        }
        industries[industry].sum += company.average_rating || 0;
        industries[industry].count += 1;
      });
      
      const results = Object.entries(industries).map(([industry, { sum, count }]) => ({
        industry,
        avg_industry_rating: sum / count,
        company_count: count
      }));
      
      results.sort((a, b) => b.avg_industry_rating - a.avg_industry_rating);
      
      console.log(chalk.green(`✅ Calculated average ratings for ${results.length} industries:`));
      results.forEach((result, index) => {
        console.log(chalk.blue(`   ${index + 1}. ${result.industry}`));
        console.log(chalk.gray(`      Average Rating: ${result.avg_industry_rating.toFixed(2)}⭐ | Companies: ${result.company_count}`));
      });
      
      return results;
    }
    
    console.log(chalk.green(`✅ Calculated average ratings for ${data?.length || 0} industries:`));
    data?.forEach((result: any, index: number) => {
      console.log(chalk.blue(`   ${index + 1}. ${result.industry}`));
      console.log(chalk.gray(`      Average Rating: ${result.avg_industry_rating.toFixed(2)}⭐ | Companies: ${result.company_count}`));
    });
    
    return data;
  } catch (error) {
    console.error(chalk.red('❌ Unhandled error calculating average ratings:'), error);
  }
}

// Example 4: Find companies with no reviews
async function getCompaniesWithNoReviews() {
  console.log(chalk.blue('\n🔍 Finding companies with no reviews...'));
  
  try {
    // Direct query instead of RPC since there's no specific RPC function for this
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, industry, location, created_at')
      .eq('total_reviews', 0);
    
    if (error) {
      console.error(chalk.red('❌ Error finding companies with no reviews:'), error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log(chalk.green(`✅ Found ${data.length} companies with no reviews:`));
      
      // Format and display the results
      data.forEach((company, index) => {
        console.log(chalk.cyan(`  ${index + 1}. ${company.name}`));
        console.log(`     Industry: ${company.industry || 'Unknown'}`);
        console.log(`     Location: ${company.location || 'Unknown'}`);
        console.log(`     Created: ${company.created_at ? new Date(company.created_at).toLocaleDateString() : 'Unknown date'}`);
      });
    } else {
      console.log(chalk.yellow('⚠️ No companies found without reviews.'));
    }
    
    return data;
  } catch (error) {
    console.error(chalk.red('❌ Unhandled error finding companies with no reviews:'), error);
    return null;
  }
}

// Main function
async function main() {
  console.log(chalk.blue('🚀 Running MCP sample queries...'));
  
  try {
    // Run example queries
    await getTopRatedCompanies();
    
    // Get the first company ID for the reviews example
    const { data: firstCompany } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single();
    
    if (firstCompany) {
      await getRecentReviewsForCompany(firstCompany.id);
    }
    
    await getAverageRatingsByIndustry();
    await getCompaniesWithNoReviews();
    
    console.log(chalk.green('\n✅ All sample queries completed successfully!'));
    console.log(chalk.blue('\nThese are examples of the types of queries you can run using MCP.'));
    console.log(chalk.blue('To use MCP, start the MCP server with:'));
    console.log(chalk.gray('   npm run mcp:start'));
    console.log(chalk.blue('Then use natural language to interact with your database in Cursor.'));
  } catch (error) {
    console.error(chalk.red('\n❌ Error running sample queries:'), error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
}); 