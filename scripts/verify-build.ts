import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

interface VerificationResult {
  step: string;
  status: 'success' | 'failure';
  message?: string;
  error?: Error;
}

class BuildVerifier {
  private results: VerificationResult[] = [];

  private runCommand(command: string): string {
    try {
      return execSync(command, { encoding: 'utf8' });
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error}`);
    }
  }

  private logResult(result: VerificationResult) {
    const status = result.status === 'success' 
      ? chalk.green('✓') 
      : chalk.red('✗');
    
    console.log(`${status} ${result.step}`);
    if (result.message) {
      console.log(`  ${result.message}`);
    }
    if (result.error) {
      console.error(chalk.red(`  Error: ${result.error.message}`));
    }
  }

  async verifyDependencies() {
    try {
      this.runCommand('npm audit');
      this.results.push({
        step: 'Dependencies check',
        status: 'success',
        message: 'All dependencies are up to date and secure'
      });
    } catch (error) {
      this.results.push({
        step: 'Dependencies check',
        status: 'failure',
        error: error as Error
      });
    }
  }

  async verifyTypeScript() {
    try {
      this.runCommand('npx tsc --noEmit');
      this.results.push({
        step: 'TypeScript compilation',
        status: 'success',
        message: 'No type errors found'
      });
    } catch (error) {
      this.results.push({
        step: 'TypeScript compilation',
        status: 'failure',
        error: error as Error
      });
    }
  }

  async verifyLinting() {
    try {
      this.runCommand('npm run lint');
      this.results.push({
        step: 'Linting',
        status: 'success',
        message: 'No linting errors found'
      });
    } catch (error) {
      this.results.push({
        step: 'Linting',
        status: 'failure',
        error: error as Error
      });
    }
  }

  async verifyTests() {
    try {
      this.runCommand('npm test -- --ci');
      this.results.push({
        step: 'Tests',
        status: 'success',
        message: 'All tests passed'
      });
    } catch (error) {
      this.results.push({
        step: 'Tests',
        status: 'failure',
        error: error as Error
      });
    }
  }

  async verifyE2ETests() {
    try {
      this.runCommand('npm run test:e2e');
      this.results.push({
        step: 'E2E Tests',
        status: 'success',
        message: 'All E2E tests passed'
      });
    } catch (error) {
      this.results.push({
        step: 'E2E Tests',
        status: 'failure',
        error: error as Error
      });
    }
  }

  async verifyBuild() {
    try {
      this.runCommand('npm run build');
      this.results.push({
        step: 'Production build',
        status: 'success',
        message: 'Build completed successfully'
      });
    } catch (error) {
      this.results.push({
        step: 'Production build',
        status: 'failure',
        error: error as Error
      });
    }
  }

  async verifyEnvironment() {
    try {
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ];

      const missingVars = requiredEnvVars.filter(
        varName => !process.env[varName]
      );

      if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
      }

      this.results.push({
        step: 'Environment variables',
        status: 'success',
        message: 'All required environment variables are set'
      });
    } catch (error) {
      this.results.push({
        step: 'Environment variables',
        status: 'failure',
        error: error as Error
      });
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.length,
        success: this.results.filter(r => r.status === 'success').length,
        failure: this.results.filter(r => r.status === 'failure').length
      }
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'reports', 'build-verification.json'),
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  async runAll() {
    console.log(chalk.blue('Starting build verification...\n'));

    await this.verifyEnvironment();
    await this.verifyDependencies();
    await this.verifyTypeScript();
    await this.verifyLinting();
    await this.verifyTests();
    await this.verifyE2ETests();
    await this.verifyBuild();

    const report = this.generateReport();

    console.log('\nVerification Summary:');
    console.log(`Total checks: ${report.summary.total}`);
    console.log(`Passed: ${chalk.green(report.summary.success)}`);
    console.log(`Failed: ${chalk.red(report.summary.failure)}`);

    return report.summary.failure === 0;
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  const verifier = new BuildVerifier();
  verifier.runAll()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(chalk.red('Verification failed:', error));
      process.exit(1);
    });
} 