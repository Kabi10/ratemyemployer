#!/usr/bin/env tsx

/**
 * Supabase Cost Optimization Script
 * Automated monitoring, optimization, and cost management for Supabase usage
 */

import { createClient } from '@supabase/supabase-js';
import { 
  getSupabaseUsageMetrics, 
  calculateCostEstimate, 
  checkUsageAlerts,
  logUsageMetrics,
  maintenanceTasks,
  type SupabaseUsageMetrics 
} from '../src/lib/supabaseMonitoring';
import type { Database } from '../src/types/supabase';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

interface OptimizationReport {
  timestamp: string;
  metrics: SupabaseUsageMetrics;
  costEstimate: any;
  alerts: string[];
  optimizations: string[];
  recommendations: string[];
}

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('❌ Missing required environment variables:'));
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Run database optimization tasks
 */
async function runOptimizationTasks(): Promise<string[]> {
  const optimizations: string[] = [];
  
  try {
    console.log(chalk.blue('🔧 Running database optimization tasks...'));
    
    // 1. Clean up old error logs
    console.log('  • Cleaning up old error logs...');
    const { count: cleanupCount, error: cleanupError } = await maintenanceTasks.cleanupErrorLogs(30);
    if (cleanupError) {
      console.error(chalk.yellow(`    Warning: ${cleanupError.message}`));
    } else {
      optimizations.push(`Cleaned up old error logs: ${cleanupCount || 0} records removed`);
    }
    
    // 2. Optimize database performance
    console.log('  • Optimizing database performance...');
    const { data: optimizeResult, error: optimizeError } = await maintenanceTasks.optimizeDatabase();
    if (optimizeError) {
      console.error(chalk.yellow(`    Warning: ${optimizeError.message}`));
    } else {
      optimizations.push('Database optimization completed: VACUUM ANALYZE executed');
    }
    
    // 3. Update table statistics
    console.log('  • Updating table statistics...');
    const { data: statsResult, error: statsError } = await maintenanceTasks.updateTableStatistics();
    if (statsError) {
      console.error(chalk.yellow(`    Warning: ${statsError.message}`));
    } else {
      optimizations.push('Table statistics updated for query optimization');
    }
    
    // 4. Clean up old usage logs
    console.log('  • Cleaning up old usage logs...');
    const { data: usageCleanup, error: usageError } = await supabase.rpc('cleanup_old_usage_logs');
    if (usageError) {
      console.error(chalk.yellow(`    Warning: ${usageError.message}`));
    } else {
      optimizations.push(`Cleaned up old usage logs: ${usageCleanup || 0} records removed`);
    }
    
    console.log(chalk.green('✅ Optimization tasks completed'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error during optimization:'), error);
    optimizations.push(`Error during optimization: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return optimizations;
}

/**
 * Generate cost optimization recommendations
 */
function generateRecommendations(metrics: SupabaseUsageMetrics, costEstimate: any): string[] {
  const recommendations: string[] = [];
  
  // Database size recommendations
  if (costEstimate.freeTierStatus.databaseUsage > 70) {
    recommendations.push('Consider implementing data archiving for reviews older than 2 years');
    recommendations.push('Optimize database schema by removing unused columns or tables');
    recommendations.push('Implement data compression for large text fields');
  }
  
  // Bandwidth recommendations
  if (costEstimate.freeTierStatus.bandwidthUsage > 70) {
    recommendations.push('Implement API response caching to reduce bandwidth usage');
    recommendations.push('Optimize API payload sizes by selecting only necessary fields');
    recommendations.push('Consider implementing a CDN for static assets');
    recommendations.push('Add response compression (gzip) for API endpoints');
  }
  
  // Storage recommendations
  if (costEstimate.freeTierStatus.storageUsage > 70) {
    recommendations.push('Implement image compression for uploaded files');
    recommendations.push('Consider using external CDN for file storage');
    recommendations.push('Clean up unused or duplicate files');
  }
  
  // General performance recommendations
  recommendations.push('Monitor query performance and add indexes where needed');
  recommendations.push('Implement connection pooling for better resource utilization');
  recommendations.push('Consider using Supabase Edge Functions for compute-heavy operations');
  
  // Cost management recommendations
  if (costEstimate.projected > 0) {
    recommendations.push('Set up billing alerts to monitor cost increases');
    recommendations.push('Consider migrating to Neon Database for potential cost savings');
    recommendations.push('Evaluate usage patterns to optimize resource allocation');
  }
  
  return recommendations;
}

/**
 * Generate and save optimization report
 */
async function generateReport(
  metrics: SupabaseUsageMetrics, 
  costEstimate: any, 
  alerts: string[], 
  optimizations: string[], 
  recommendations: string[]
): Promise<void> {
  const report: OptimizationReport = {
    timestamp: new Date().toISOString(),
    metrics,
    costEstimate,
    alerts,
    optimizations,
    recommendations
  };
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Save report
  const reportPath = path.join(reportsDir, `supabase-optimization-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(chalk.green(`📄 Report saved to: ${reportPath}`));
}

/**
 * Display usage summary
 */
function displayUsageSummary(metrics: SupabaseUsageMetrics, costEstimate: any): void {
  console.log(chalk.blue('\n📊 Usage Summary:'));
  console.log(`  Database Size: ${metrics.databaseSize} MB (${costEstimate.freeTierStatus.databaseUsage}% of limit)`);
  console.log(`  Bandwidth: ${metrics.bandwidth} GB (${costEstimate.freeTierStatus.bandwidthUsage}% of limit)`);
  console.log(`  Storage: ${metrics.storage} GB (${costEstimate.freeTierStatus.storageUsage}% of limit)`);
  console.log(`  Active Users: ${metrics.activeUsers} (${costEstimate.freeTierStatus.usersUsage}% of limit)`);
  
  console.log(chalk.blue('\n💰 Cost Analysis:'));
  console.log(`  Current Monthly Cost: $${costEstimate.current}`);
  console.log(`  Projected Cost (6mo): $${costEstimate.projected}`);
  console.log(`  Status: ${costEstimate.current === 0 ? chalk.green('Free Tier') : chalk.yellow('Paid Plan')}`);
}

/**
 * Main optimization function
 */
async function runOptimization(): Promise<void> {
  console.log(chalk.blue('🚀 Starting Supabase cost optimization...'));
  console.log(`📅 Started at: ${new Date().toISOString()}\n`);
  
  try {
    // 1. Fetch current metrics
    console.log(chalk.blue('📊 Fetching usage metrics...'));
    const metrics = await getSupabaseUsageMetrics();
    
    // 2. Calculate cost estimates
    const costEstimate = calculateCostEstimate(metrics);
    
    // 3. Check for alerts
    const alerts = checkUsageAlerts(metrics);
    
    // 4. Display current status
    displayUsageSummary(metrics, costEstimate);
    
    // 5. Show alerts if any
    if (alerts.length > 0) {
      console.log(chalk.yellow('\n⚠️  Usage Alerts:'));
      alerts.forEach(alert => console.log(chalk.yellow(`  • ${alert}`)));
    }
    
    // 6. Run optimization tasks
    const optimizations = await runOptimizationTasks();
    
    // 7. Generate recommendations
    const recommendations = generateRecommendations(metrics, costEstimate);
    
    // 8. Display recommendations
    if (recommendations.length > 0) {
      console.log(chalk.blue('\n💡 Optimization Recommendations:'));
      recommendations.forEach(rec => console.log(chalk.cyan(`  • ${rec}`)));
    }
    
    // 9. Log metrics for historical tracking
    await logUsageMetrics(metrics);
    
    // 10. Generate report
    await generateReport(metrics, costEstimate, alerts, optimizations, recommendations);
    
    console.log(chalk.green('\n🎉 Optimization completed successfully!'));
    
    // 11. Exit with appropriate code
    if (alerts.length > 0) {
      console.log(chalk.yellow('\n⚠️  Note: Usage alerts detected. Consider taking action to avoid cost increases.'));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error during optimization:'), error);
    process.exit(1);
  }
}

/**
 * CLI interface
 */
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Supabase Cost Optimization Script

Usage: tsx scripts/supabase-cost-optimization.ts [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be done without making changes
  --verbose      Enable verbose logging

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL      Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Your Supabase service role key

Examples:
  tsx scripts/supabase-cost-optimization.ts
  tsx scripts/supabase-cost-optimization.ts --verbose
  tsx scripts/supabase-cost-optimization.ts --dry-run
`);
  process.exit(0);
}

if (args.includes('--dry-run')) {
  console.log(chalk.blue('🔍 DRY RUN MODE: No changes will be made'));
  console.log('This would perform the following optimizations:');
  console.log('- Fetch current usage metrics');
  console.log('- Calculate cost estimates');
  console.log('- Check for usage alerts');
  console.log('- Generate optimization recommendations');
  console.log('- Clean up old logs and optimize database');
  console.log('- Generate optimization report');
  process.exit(0);
}

// Run the optimization
runOptimization().catch(console.error);
