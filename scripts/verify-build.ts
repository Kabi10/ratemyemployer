import { execSync } from 'child_process';
import chalk from 'chalk';

const log = {
  info: (msg: string) => console.log(chalk.blue(msg)),
  success: (msg: string) => console.log(chalk.green(msg)),
  error: (msg: string) => console.log(chalk.red(msg)),
};

async function verifyBuild() {
  try {
    log.info('🔍 Starting build verification...');

    // Run type checking
    log.info('Checking TypeScript types...');
    execSync('npm run type-check', { stdio: 'inherit' });
    log.success('✅ TypeScript types verified');

    // Run linting
    log.info('Running linter...');
    execSync('npm run lint', { stdio: 'inherit' });
    log.success('✅ Linting passed');

    // Run format check
    log.info('Checking code formatting...');
    execSync('npm run format:check', { stdio: 'inherit' });
    log.success('✅ Code formatting verified');

    // Run tests
    log.info('Running tests...');
    execSync('npm run test', { stdio: 'inherit' });
    log.success('✅ Tests passed');

    // Try building the project
    log.info('Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    log.success('✅ Build successful');

    log.success('\n🎉 All verifications passed successfully!');
    process.exit(0);
  } catch (error) {
    log.error('\n❌ Verification failed');
    console.error(error);
    process.exit(1);
  }
}

verifyBuild();
