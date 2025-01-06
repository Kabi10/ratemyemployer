import { Command } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import glob from 'glob';

// Load environment variables
dotenv.config();

const program = new Command();

interface CommandResult {
  success: boolean;
  message: string;
  details?: any;
}

// Utility functions
const runCommand = (command: string): string => {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error}`);
  }
};

const logResult = (result: CommandResult) => {
  const icon = result.success ? '✓' : '✗';
  const color = result.success ? chalk.green : chalk.red;
  console.log(color(`${icon} ${result.message}`));
  if (result.details) {
    console.log(chalk.gray('Details:'), result.details);
  }
};

// Documentation generation
const generateDocs = (): string => {
  const docs = [];
  
  // Add README content
  docs.push(fs.readFileSync('README.md', 'utf8'));
  
  // Add API documentation
  const apiFiles = glob.sync('src/app/api/**/*.ts');
  docs.push('\n## API Documentation\n');
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const endpoint = file.replace('src/app/api', '').replace('.ts', '');
    docs.push(`### ${endpoint}\n`);
    // Extract comments and add to docs
    const comments = content.match(/\/\*\*([\s\S]*?)\*\//g) || [];
    docs.push(comments.join('\n'));
  });
  
  // Add component documentation
  const componentFiles = glob.sync('src/components/**/*.tsx');
  docs.push('\n## Component Documentation\n');
  componentFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const componentName = path.basename(file, '.tsx');
    docs.push(`### ${componentName}\n`);
    // Extract comments and add to docs
    const comments = content.match(/\/\*\*([\s\S]*?)\*\//g) || [];
    docs.push(comments.join('\n'));
  });
  
  return docs.join('\n');
};

// Error log collection
const collectErrors = (): string => {
  const errors = [];
  
  // Collect lint errors
  try {
    runCommand('npm run lint');
  } catch (error: any) {
    errors.push('## Lint Errors\n', error.toString());
  }
  
  // Collect type errors
  try {
    runCommand('tsc --noEmit');
  } catch (error: any) {
    errors.push('## Type Errors\n', error.toString());
  }
  
  // Collect test failures
  try {
    runCommand('npm test');
  } catch (error: any) {
    errors.push('## Test Failures\n', error.toString());
  }
  
  return errors.join('\n\n');
};

// Configuration generation
const generateConfig = () => {
  // Generate tsconfig.json if it doesn't exist
  if (!fs.existsSync('tsconfig.json')) {
    fs.writeFileSync('tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: "es2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./src/*"] }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"]
    }, null, 2));
  }
  
  // Generate next.config.js if it doesn't exist
  if (!fs.existsSync('next.config.js')) {
    fs.writeFileSync('next.config.js', `
      /** @type {import('next').NextConfig} */
      const nextConfig = {
        reactStrictMode: true,
        swcMinify: true,
      }
      module.exports = nextConfig
    `);
  }
  
  // Generate .eslintrc.json if it doesn't exist
  if (!fs.existsSync('.eslintrc.json')) {
    fs.writeFileSync('.eslintrc.json', JSON.stringify({
      extends: "next/core-web-vitals"
    }, null, 2));
  }
};

// Verification commands
program
  .command('verify')
  .description('Run system verification checks')
  .option('-t, --types', 'Check TypeScript types')
  .option('-d, --deps', 'Check dependencies')
  .option('-b, --build', 'Verify build')
  .option('-c, --coverage', 'Run test coverage')
  .option('-a, --all', 'Run all checks')
  .action(async (options) => {
    const results: CommandResult[] = [];

    if (options.all || options.types) {
      try {
        runCommand('tsc --noEmit');
        results.push({
          success: true,
          message: 'TypeScript validation passed'
        });
      } catch (error) {
        results.push({
          success: false,
          message: 'TypeScript validation failed',
          details: error
        });
      }
    }

    if (options.all || options.deps) {
      try {
        const outdated = JSON.parse(runCommand('npm outdated --json') || '{}');
        results.push({
          success: Object.keys(outdated).length === 0,
          message: 'Dependency check complete',
          details: outdated
        });
      } catch (error) {
        results.push({
          success: false,
          message: 'Dependency check failed',
          details: error
        });
      }
    }

    if (options.all || options.build) {
      try {
        runCommand('npm run build');
        results.push({
          success: true,
          message: 'Build verification passed'
        });
      } catch (error) {
        results.push({
          success: false,
          message: 'Build verification failed',
          details: error
        });
      }
    }

    if (options.all || options.coverage) {
      try {
        runCommand('npm run coverage');
        results.push({
          success: true,
          message: 'Coverage check passed'
        });
      } catch (error) {
        results.push({
          success: false,
          message: 'Coverage check failed',
          details: error
        });
      }
    }

    results.forEach(logResult);
  });

// Database commands
program
  .command('db')
  .description('Database operations')
  .option('-b, --backup', 'Backup database')
  .option('-r, --restore <file>', 'Restore database from backup')
  .option('-e, --export <type>', 'Export data (companies/reviews)')
  .action(async (options) => {
    if (options.backup) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups');
        
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir);
        }

        // Export companies
        runCommand(`npx supabase db dump -t companies > backups/companies_${timestamp}.sql`);
        
        // Export reviews
        runCommand(`npx supabase db dump -t reviews > backups/reviews_${timestamp}.sql`);

        logResult({
          success: true,
          message: 'Database backup complete',
          details: { timestamp }
        });
      } catch (error) {
        logResult({
          success: false,
          message: 'Database backup failed',
          details: error
        });
      }
    }

    if (options.export) {
      try {
        const data = runCommand(`npx supabase db dump -t ${options.export}`);
        fs.writeFileSync(`${options.export}.json`, data);
        logResult({
          success: true,
          message: `Exported ${options.export} data`
        });
      } catch (error) {
        logResult({
          success: false,
          message: `Export failed for ${options.export}`,
          details: error
        });
      }
    }
  });

// Documentation commands
program
  .command('docs')
  .description('Documentation operations')
  .option('-u, --update', 'Update documentation')
  .option('-e, --errors', 'Update error logs')
  .action(async (options) => {
    if (options.update) {
      try {
        // Update main documentation
        const docs = generateDocs(); // Implementation needed
        fs.writeFileSync('docs/README.md', docs);
        logResult({
          success: true,
          message: 'Documentation updated'
        });
      } catch (error) {
        logResult({
          success: false,
          message: 'Documentation update failed',
          details: error
        });
      }
    }

    if (options.errors) {
      try {
        // Update error logs
        const errors = collectErrors(); // Implementation needed
        fs.writeFileSync('docs/ERRORS.md', errors);
        logResult({
          success: true,
          message: 'Error logs updated'
        });
      } catch (error) {
        logResult({
          success: false,
          message: 'Error log update failed',
          details: error
        });
      }
    }
  });

// Configuration commands
program
  .command('config')
  .description('Configuration operations')
  .option('-g, --generate', 'Generate configuration files')
  .option('-e, --export-env', 'Export environment variables')
  .action(async (options) => {
    if (options.generate) {
      try {
        // Generate configuration files
        generateConfig(); // Implementation needed
        logResult({
          success: true,
          message: 'Configuration generated'
        });
      } catch (error) {
        logResult({
          success: false,
          message: 'Configuration generation failed',
          details: error
        });
      }
    }

    if (options.exportEnv) {
      try {
        const envVars = Object.entries(process.env)
          .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        fs.writeFileSync('.env.example', Object.entries(envVars)
          .map(([key]) => `${key}=`)
          .join('\n'));

        logResult({
          success: true,
          message: 'Environment variables exported'
        });
      } catch (error) {
        logResult({
          success: false,
          message: 'Environment variable export failed',
          details: error
        });
      }
    }
  });

program.parse(process.argv); 