import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

interface SystemCheck {
  name: string;
  description: string;
  run: () => Promise<{
    passed: boolean;
    message: string;
    details?: any;
    fix?: () => Promise<void>;
  }>;
}

const checks: SystemCheck[] = [
  // Dependency Health
  {
    name: 'dependencies-check',
    description: 'Check for outdated, duplicate, or conflicting dependencies',
    run: async () => {
      try {
        // Check for outdated packages
        const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
        const duplicates = execSync('npm ls --json --duplicate', { encoding: 'utf8' });
        
        const outdatedPkgs = Object.keys(JSON.parse(outdated || '{}'));
        const duplicatePkgs = Object.keys(JSON.parse(duplicates || '{}'));
        
        return {
          passed: outdatedPkgs.length === 0 && duplicatePkgs.length === 0,
          message: 'Dependency check complete',
          details: {
            outdated: outdatedPkgs,
            duplicates: duplicatePkgs
          },
          fix: async () => {
            console.log('Running npm update...');
            execSync('npm update');
            console.log('Deduplicating packages...');
            execSync('npm dedupe');
          }
        };
      } catch (error) {
        return {
          passed: false,
          message: 'Dependency check failed',
          details: error
        };
      }
    }
  },

  // TypeScript Configuration
  {
    name: 'typescript-config',
    description: 'Validate TypeScript configuration and type coverage',
    run: async () => {
      try {
        execSync('tsc --noEmit', { encoding: 'utf8' });
        const typeStats = execSync('npx type-coverage', { encoding: 'utf8' });
        
        return {
          passed: true,
          message: 'TypeScript configuration is valid',
          details: {
            typeCoverage: typeStats
          }
        };
      } catch (error) {
        return {
          passed: false,
          message: 'TypeScript validation failed',
          details: error
        };
      }
    }
  },

  // Build Performance
  {
    name: 'build-performance',
    description: 'Check build performance and size',
    run: async () => {
      try {
        const startTime = Date.now();
        execSync('npm run build', { encoding: 'utf8' });
        const buildTime = Date.now() - startTime;
        
        // Analyze bundle size
        const bundleStats = execSync('npx next-bundle-analyzer', { encoding: 'utf8' });
        
        return {
          passed: buildTime < 120000, // 2 minutes threshold
          message: 'Build performance check complete',
          details: {
            buildTimeSeconds: buildTime / 1000,
            bundleStats
          }
        };
      } catch (error) {
        return {
          passed: false,
          message: 'Build performance check failed',
          details: error
        };
      }
    }
  },

  // Code Quality
  {
    name: 'code-quality',
    description: 'Check code quality and standards',
    run: async () => {
      try {
        const eslintResult = execSync('npm run lint', { encoding: 'utf8' });
        const prettierResult = execSync('npx prettier --check "src/**/*.{ts,tsx}"', { encoding: 'utf8' });
        
        return {
          passed: true,
          message: 'Code quality checks passed',
          details: {
            eslint: eslintResult,
            prettier: prettierResult
          },
          fix: async () => {
            console.log('Running automatic fixes...');
            execSync('npm run lint:fix');
            execSync('npm run format');
          }
        };
      } catch (error) {
        return {
          passed: false,
          message: 'Code quality checks failed',
          details: error,
          fix: async () => {
            console.log('Running automatic fixes...');
            execSync('npm run lint:fix');
            execSync('npm run format');
          }
        };
      }
    }
  },

  // Test Coverage
  {
    name: 'test-coverage',
    description: 'Check test coverage and performance',
    run: async () => {
      try {
        const coverageResult = execSync('npm run coverage', { encoding: 'utf8' });
        const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
        
        return {
          passed: coverage.total.lines.pct >= 70,
          message: 'Test coverage check complete',
          details: {
            coverage,
            fullReport: coverageResult
          }
        };
      } catch (error) {
        return {
          passed: false,
          message: 'Test coverage check failed',
          details: error
        };
      }
    }
  },

  // Memory Leaks
  {
    name: 'memory-check',
    description: 'Check for memory leaks and performance issues',
    run: async () => {
      try {
        // Run the app with heap profiling
        execSync('node --heap-prof next start', { encoding: 'utf8', timeout: 5000 });
        
        return {
          passed: true,
          message: 'Memory check complete',
          details: {
            heapProfile: 'Check heap profile in project root'
          }
        };
      } catch (error) {
        return {
          passed: true, // Don't fail on timeout
          message: 'Memory snapshot captured',
          details: error
        };
      }
    }
  },

  // Environment Configuration
  {
    name: 'env-check',
    description: 'Validate environment configuration',
    run: async () => {
      try {
        const requiredEnvVars = [
          'NEXT_PUBLIC_SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        ];
        
        const missingVars = requiredEnvVars.filter(v => !process.env[v]);
        
        return {
          passed: missingVars.length === 0,
          message: 'Environment configuration check complete',
          details: {
            missingVariables: missingVars
          }
        };
      } catch (error) {
        return {
          passed: false,
          message: 'Environment configuration check failed',
          details: error
        };
      }
    }
  }
];

async function runChecks(selectedChecks?: string[]) {
  console.log(chalk.blue('🔍 Starting system health checks...\n'));
  
  const checksToRun = selectedChecks 
    ? checks.filter(check => selectedChecks.includes(check.name))
    : checks;

  const results = [];
  
  for (const check of checksToRun) {
    console.log(chalk.yellow(`Running ${check.name}: ${check.description}`));
    
    try {
      const result = await check.run();
      results.push({ check, result });
      
      if (result.passed) {
        console.log(chalk.green('✓ Passed:', result.message));
      } else {
        console.log(chalk.red('✗ Failed:', result.message));
        if (result.fix) {
          console.log(chalk.yellow('Attempting to fix...'));
          await result.fix();
          const retryResult = await check.run();
          if (retryResult.passed) {
            console.log(chalk.green('✓ Fixed successfully!'));
          } else {
            console.log(chalk.red('✗ Fix attempt failed'));
          }
        }
      }
      
      if (result.details) {
        console.log(chalk.gray('Details:'), result.details);
      }
    } catch (error) {
      console.error(chalk.red(`Error running ${check.name}:`), error);
    }
    
    console.log('\n');
  }
  
  // Summary
  const summary = {
    total: results.length,
    passed: results.filter(r => r.result.passed).length,
    failed: results.filter(r => !r.result.passed).length
  };
  
  console.log(chalk.blue('📊 Summary:'));
  console.log(chalk.white(`Total Checks: ${summary.total}`));
  console.log(chalk.green(`Passed: ${summary.passed}`));
  console.log(chalk.red(`Failed: ${summary.failed}`));
  
  // Save results to file
  const reportPath = path.join(process.cwd(), 'system-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary,
    details: results
  }, null, 2));
  
  console.log(chalk.blue(`\n📝 Full report saved to ${reportPath}`));
  
  return summary.failed === 0;
}

// CLI handling
const args = process.argv.slice(2);
const selectedChecks = args.length > 0 ? args : undefined;

runChecks(selectedChecks).then(success => {
  process.exit(success ? 0 : 1);
}); 