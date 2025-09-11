#!/usr/bin/env tsx

/**
 * PR Validation Script
 * Quick validation script for reviewers to test the MVP optimization PR
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class PRValidator {
  private results: ValidationResult[] = [];

  async validatePR(): Promise<void> {
    console.log('🔍 Validating MVP Optimization PR...\n');

    // Test build
    await this.testBuild();
    
    // Test core functionality
    await this.testCoreFunctionality();
    
    // Test file structure
    await this.testFileStructure();
    
    // Test documentation
    await this.testDocumentation();
    
    // Print results
    this.printResults();
  }

  private async testBuild(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('📦 Testing build process...');
      execSync('npm run build', { stdio: 'pipe' });
      
      this.results.push({
        test: 'Build Process',
        status: 'PASS',
        message: 'Build completed successfully',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        test: 'Build Process',
        status: 'FAIL',
        message: `Build failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testCoreFunctionality(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('🧪 Testing core functionality...');
      
      // Check if validation script exists and run it
      if (existsSync('scripts/validate-core-functionality.ts')) {
        execSync('npx tsx scripts/validate-core-functionality.ts', { stdio: 'pipe' });
        
        this.results.push({
          test: 'Core Functionality',
          status: 'PASS',
          message: 'All core functionality tests passed',
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          test: 'Core Functionality',
          status: 'SKIP',
          message: 'Core functionality validation script not found',
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Core Functionality',
        status: 'FAIL',
        message: `Core functionality validation failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testFileStructure(): Promise<void> {
    const startTime = Date.now();
    
    const requiredFiles = [
      'docs/SIMPLIFIED_ARCHITECTURE.md',
      'docs/MIGRATION_GUIDE.md',
      '.kiro/specs/mvp-redundancy-analysis/requirements.md',
      '.kiro/specs/mvp-redundancy-analysis/design.md',
      '.kiro/specs/mvp-redundancy-analysis/tasks.md',
      'scripts/measure-complexity-reduction.ts',
      'scripts/validate-core-functionality.ts'
    ];

    const missingFiles = requiredFiles.filter(file => !existsSync(file));
    
    if (missingFiles.length === 0) {
      this.results.push({
        test: 'File Structure',
        status: 'PASS',
        message: 'All required files are present',
        duration: Date.now() - startTime
      });
    } else {
      this.results.push({
        test: 'File Structure',
        status: 'FAIL',
        message: `Missing files: ${missingFiles.join(', ')}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testDocumentation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if README has been updated with MVP focus
      const fs = require('fs');
      const readme = fs.readFileSync('README.md', 'utf-8');
      
      const hasMVPTitle = readme.includes('MVP Employer Review Platform');
      const hasOptimizationResults = readme.includes('MVP Streamlining Completed');
      const hasCoreFeatures = readme.includes('MVP Core Features');
      
      if (hasMVPTitle && hasOptimizationResults && hasCoreFeatures) {
        this.results.push({
          test: 'Documentation',
          status: 'PASS',
          message: 'README properly updated with MVP focus',
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          test: 'Documentation',
          status: 'FAIL',
          message: 'README missing MVP updates',
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Documentation',
        status: 'FAIL',
        message: `Documentation validation failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private printResults(): void {
    console.log('\n📊 PR Validation Results:\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}${duration}`);
      console.log(`   ${result.message}\n`);
    });
    
    console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);
    
    if (failed === 0) {
      console.log('✅ PR validation passed! Ready for review.\n');
    } else {
      console.log('❌ PR validation failed. Please address the issues above.\n');
      process.exit(1);
    }
  }
}

async function main() {
  const validator = new PRValidator();
  await validator.validatePR();
}

if (require.main === module) {
  main().catch(console.error);
}

export { PRValidator };