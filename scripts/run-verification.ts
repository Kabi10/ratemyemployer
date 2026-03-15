#!/usr/bin/env tsx

/**
 * Verification Test Runner
 * 
 * Simple CLI tool to run specific verification modules or all modules
 */

import { CoreFeatureVerificationFramework } from './core-feature-verification';
import chalk from 'chalk';

const AVAILABLE_MODULES = [
  'authentication',
  'company-management', 
  'review-system',
  'search-filter',
  'wall-sections',
  'financial-distress',
  'rising-startups',
  'database-integration',
  'ui-ux',
  'performance-security'
];

function printUsage() {
  console.log(chalk.blue('\n🔍 Core Feature Verification Runner\n'));
  console.log('Usage: npm run verify:core [modules...]');
  console.log('\nAvailable modules:');
  AVAILABLE_MODULES.forEach(module => {
    console.log(`  - ${module}`);
  });
  console.log('\nExamples:');
  console.log('  npm run verify:core                    # Run all enabled modules');
  console.log('  npm run verify:auth                    # Run authentication module only');
  console.log('  npm run verify:companies               # Run company management module only');
  console.log('  npm run verify:reviews                 # Run review system module only');
  console.log('  tsx scripts/run-verification.ts authentication company-management  # Run specific modules');
  console.log('\nQuick commands:');
  console.log('  npm run verify:auth      -> authentication');
  console.log('  npm run verify:companies -> company-management');
  console.log('  npm run verify:reviews   -> review-system');
}

async function main() {
  const args = process.argv.slice(2);
  
  // Handle help flags
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }
  
  // Handle list flag
  if (args.includes('--list') || args.includes('-l')) {
    console.log(chalk.blue('\nAvailable verification modules:\n'));
    AVAILABLE_MODULES.forEach(module => {
      console.log(`  ${module}`);
    });
    return;
  }
  
  // Validate modules if specified
  const modulesToRun = args.length > 0 ? args : undefined;
  
  if (modulesToRun) {
    const invalidModules = modulesToRun.filter(module => !AVAILABLE_MODULES.includes(module));
    if (invalidModules.length > 0) {
      console.error(chalk.red(`\n❌ Invalid modules: ${invalidModules.join(', ')}`));
      console.log(chalk.yellow('\nAvailable modules:'));
      AVAILABLE_MODULES.forEach(module => {
        console.log(`  ${module}`);
      });
      process.exit(1);
    }
  }
  
  // Run verification
  console.log(chalk.blue('\n🚀 Starting verification...\n'));
  
  if (modulesToRun) {
    console.log(chalk.gray(`Running modules: ${modulesToRun.join(', ')}`));
  } else {
    console.log(chalk.gray('Running all enabled modules'));
  }
  
  const framework = new CoreFeatureVerificationFramework();
  const session = await framework.runVerification(modulesToRun);
  
  // Exit with appropriate code
  if (session.failedTests > 0) {
    console.log(chalk.red('\n❌ Some verification tests failed.'));
    process.exit(1);
  } else if (session.warningTests > 0) {
    console.log(chalk.yellow('\n⚠️ Verification completed with warnings.'));
    process.exit(0);
  } else {
    console.log(chalk.green('\n🎉 All verification tests passed!'));
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red(`\n❌ Verification failed: ${error}`));
    process.exit(1);
  });
}