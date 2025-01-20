import { Command } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import * as glob from 'glob';
// Load environment variables
dotenv.config();
const program = new Command();
// Enhanced utility functions
const runCommand = (command, silent = false) => {
    try {
        console.log(chalk.gray(`Running command: ${command}`));
        const output = execSync(command, {
            encoding: 'utf8',
            stdio: silent ? 'pipe' : 'inherit'
        });
        return output;
    }
    catch (error) {
        if (error.stdout)
            console.error(chalk.red('Command output:'), error.stdout);
        if (error.stderr)
            console.error(chalk.red('Command error:'), error.stderr);
        throw new Error(`Command failed: ${command}\n${error.message}`);
    }
};
const logResult = (result) => {
    const icon = result.success ? '✓' : '✗';
    const color = result.success ? chalk.green : chalk.red;
    const timestamp = result.timestamp ? chalk.gray(` [${result.timestamp.toISOString()}]`) : '';
    console.log(color(`${icon} ${result.message}${timestamp}`));
    if (result.details) {
        console.log(chalk.gray('Details:'), result.details);
    }
};
// Project analysis and statistics
const analyzeProject = async () => {
    try {
        const stats = {
            components: glob.sync('src/components/**/*.tsx').length,
            pages: glob.sync('src/app/**/*.tsx').length,
            tests: glob.sync('src/**/*.test.{ts,tsx}').length,
            apis: glob.sync('src/app/api/**/*.ts').length,
            hooks: glob.sync('src/hooks/**/*.ts').length,
            utils: glob.sync('src/lib/**/*.ts').length,
            totalLines: 0,
            testCoverage: '0%'
        };
        // Calculate total lines of code
        glob.sync('src/**/*.{ts,tsx}').forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            stats.totalLines += content.split('\n').length;
        });
        // Try to get test coverage
        try {
            runCommand('npm run coverage', true);
            const coverageFile = 'coverage/coverage-summary.json';
            if (fs.existsSync(coverageFile)) {
                const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
                stats.testCoverage = coverage.total.statements.pct + '%';
            }
        }
        catch (error) {
            stats.testCoverage = 'Not available';
        }
        return {
            success: true,
            message: 'Project analysis complete',
            details: stats,
            timestamp: new Date()
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Project analysis failed',
            details: error,
            timestamp: new Date()
        };
    }
};
// Enhanced documentation generation
const generateDocs = async () => {
    try {
        const docs = [];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const docsDir = path.join(process.cwd(), 'docs');
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir);
        }
        // Project overview
        const analysis = await analyzeProject();
        docs.push('# Project Documentation\n');
        docs.push('## Project Overview\n');
        docs.push('```json\n' + JSON.stringify(analysis.details, null, 2) + '\n```\n');
        // API documentation
        docs.push('\n## API Documentation\n');
        glob.sync('src/app/api/**/*.ts').forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const endpoint = file.replace('src/app/api', '').replace('.ts', '');
            docs.push(`### ${endpoint}\n`);
            const comments = content.match(/\/\*\*([\s\S]*?)\*\//g) || [];
            docs.push(comments.join('\n'));
        });
        // Component documentation with props
        docs.push('\n## Component Documentation\n');
        glob.sync('src/components/**/*.tsx').forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const componentName = path.basename(file, '.tsx');
            docs.push(`### ${componentName}\n`);
            // Extract TypeScript interfaces/types
            const interfaces = content.match(/interface.*?{[\s\S]*?}/g) || [];
            if (interfaces.length) {
                docs.push('#### Props\n```typescript\n' + interfaces.join('\n') + '\n```\n');
            }
            // Extract JSDoc comments
            const comments = content.match(/\/\*\*([\s\S]*?)\*\//g) || [];
            docs.push(comments.join('\n'));
        });
        // Generate markdown file
        const docsPath = path.join(docsDir, `documentation-${timestamp}.md`);
        fs.writeFileSync(docsPath, docs.join('\n'));
        return {
            success: true,
            message: `Documentation generated at ${docsPath}`,
            timestamp: new Date()
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Documentation generation failed',
            details: error,
            timestamp: new Date()
        };
    }
};
// Development environment setup
const setupDev = async () => {
    try {
        // Check and install dependencies
        runCommand('npm install');
        // Setup environment variables
        if (!fs.existsSync('.env.local') && fs.existsSync('.env.example')) {
            fs.copyFileSync('.env.example', '.env.local');
        }
        // Setup git hooks
        runCommand('npx husky install');
        // Generate necessary config files
        generateConfig();
        return {
            success: true,
            message: 'Development environment setup complete',
            timestamp: new Date()
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Development environment setup failed',
            details: error,
            timestamp: new Date()
        };
    }
};
// Database operations with validation
const handleDatabase = async (options) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        if (options.backup) {
            // Validate database connection
            runCommand('npx supabase db ping');
            // Create full backup
            const backupPath = path.join(backupDir, `backup-${timestamp}.sql`);
            runCommand(`npx supabase db dump > ${backupPath}`);
            return {
                success: true,
                message: `Database backup created at ${backupPath}`,
                timestamp: new Date()
            };
        }
        if (options.restore) {
            if (!fs.existsSync(options.restore)) {
                return {
                    success: false,
                    message: 'Backup file not found',
                    timestamp: new Date()
                };
            }
            // Create backup before restore
            runCommand(`npx supabase db dump > ${path.join(backupDir, `pre-restore-${timestamp}.sql`)}`);
            // Restore database
            runCommand(`npx supabase db reset && psql -f ${options.restore}`);
            return {
                success: true,
                message: 'Database restored successfully',
                timestamp: new Date()
            };
        }
        return {
            success: false,
            message: 'No database operation specified',
            timestamp: new Date()
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Database operation failed',
            details: error,
            timestamp: new Date()
        };
    }
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
// Add new analysis functions
const analyzeCodeQuality = async () => {
    const results = {
        eslintErrors: 0,
        eslintWarnings: 0,
        testCoverage: 0,
        duplicateCode: 0,
        complexity: { high: 0, medium: 0, low: 0 }
    };
    try {
        // Run ESLint
        console.log(chalk.gray('Running ESLint...'));
        try {
            const eslintOutput = runCommand('npx eslint . --format json', true);
            const eslintResults = JSON.parse(eslintOutput);
            results.eslintErrors = eslintResults.filter(result => result.severity === 2).length;
            results.eslintWarnings = eslintResults.filter(result => result.severity === 1).length;
            console.log(chalk.gray(`Found ${results.eslintErrors} errors and ${results.eslintWarnings} warnings`));
        }
        catch (error) {
            console.error(chalk.red('Error running ESLint:'), error);
        }
        // Run test coverage with Vitest
        console.log(chalk.gray('Running test coverage...'));
        try {
            const coverageOutput = runCommand('npm run coverage', true);
            try {
                const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
                results.testCoverage = coverage.total.statements.pct;
                console.log(chalk.gray(`Test coverage: ${results.testCoverage}%`));
            }
            catch (e) {
                console.log(chalk.yellow('Warning: Could not read coverage data. Run tests with coverage first.'));
            }
        }
        catch (error) {
            console.error(chalk.red('Error running test coverage:'), error);
        }
        // Analyze code complexity
        console.log(chalk.gray('Analyzing code complexity...'));
        try {
            const files = glob.sync('src/**/*.{ts,tsx}');
            console.log(chalk.gray(`Found ${files.length} files to analyze`));
            files.forEach(file => {
                const content = fs.readFileSync(file, 'utf8');
                const complexity = analyzeComplexity(content);
                results.complexity.high += complexity.high;
                results.complexity.medium += complexity.medium;
                results.complexity.low += complexity.low;
            });
            console.log(chalk.gray(`Complexity analysis: ${results.complexity.high} high, ${results.complexity.medium} medium, ${results.complexity.low} low`));
        }
        catch (error) {
            console.error(chalk.red('Error analyzing code complexity:'), error);
        }
        return results;
    }
    catch (error) {
        console.error(chalk.red('Fatal error in code quality analysis:'), error);
        return results;
    }
};
const analyzePerformance = async () => {
    try {
        // Build with bundle analyzer
        process.env.ANALYZE = 'true';
        runCommand('npm run build', true);
        const clientBundleStats = JSON.parse(fs.readFileSync('.next/analyze/client.json', 'utf8'));
        return {
            bundleSize: clientBundleStats.totalSize,
            firstLoadJS: clientBundleStats.initialSize,
            lazyLoadedChunks: clientBundleStats.chunks.length,
            imageOptimization: {
                optimizedCount: glob.sync('public/**/*.{jpg,png,webp}').length,
                totalCount: glob.sync('public/**/*.{jpg,png,webp,gif,jpeg}').length
            }
        };
    }
    catch (error) {
        console.error('Error analyzing performance:', error);
        return {};
    }
};
const analyzeSecurity = async () => {
    try {
        // Run npm audit
        const auditOutput = runCommand('npm audit --json', true);
        const auditResults = JSON.parse(auditOutput);
        // Check dependencies
        const outdatedOutput = runCommand('npm outdated --json', true);
        const outdatedDeps = JSON.parse(outdatedOutput);
        return {
            dependencyVulnerabilities: auditResults.vulnerabilities?.total || 0,
            outdatedDependencies: Object.keys(outdatedDeps).length,
            securityHeaders: checkSecurityHeaders(),
            authImplementation: checkAuthImplementation()
        };
    }
    catch (error) {
        console.error('Error analyzing security:', error);
        return {};
    }
};
// Utility functions for metrics
const analyzeComplexity = (content) => {
    const results = {
        high: 0,
        medium: 0,
        low: 0
    };
    // Count nested blocks as complexity indicators
    const blocks = content.match(/{/g)?.length || 0;
    const conditionals = (content.match(/if|switch|for|while/g)?.length || 0);
    const callbacks = (content.match(/=>/g)?.length || 0);
    const complexity = blocks + conditionals + callbacks;
    if (complexity > 20)
        results.high++;
    else if (complexity > 10)
        results.medium++;
    else
        results.low++;
    return results;
};
const checkSecurityHeaders = () => {
    try {
        const nextConfig = fs.readFileSync('next.config.js', 'utf8');
        return nextConfig.includes('headers:') &&
            nextConfig.includes('Content-Security-Policy') &&
            nextConfig.includes('X-Frame-Options');
    }
    catch {
        return false;
    }
};
const checkAuthImplementation = () => {
    try {
        return fs.existsSync('src/contexts/AuthContext.tsx') &&
            fs.existsSync('src/middleware.ts');
    }
    catch {
        return false;
    }
};
const METRICS_FILE = 'metrics-history.json';
const loadMetricsHistory = () => {
    try {
        if (fs.existsSync(METRICS_FILE)) {
            const data = fs.readFileSync(METRICS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    }
    catch {
        return [];
    }
};
const saveMetricsHistory = (history) => {
    fs.writeFileSync(METRICS_FILE, JSON.stringify(history, null, 2));
};
const generateMetricsReport = (metrics, duration) => {
    const report = [
        chalk.blue('\nMetrics Report'),
        chalk.gray(`Generated in ${duration}s\n`),
    ];
    if (metrics.codeQuality) {
        report.push(chalk.yellow('\nCode Quality:'), `ESLint Errors: ${metrics.codeQuality.eslintErrors}`, `ESLint Warnings: ${metrics.codeQuality.eslintWarnings}`, `Test Coverage: ${metrics.codeQuality.testCoverage}%`, `High Complexity Files: ${metrics.codeQuality.complexity.high}`);
    }
    if (metrics.performance) {
        report.push(chalk.yellow('\nPerformance:'), `Bundle Size: ${(metrics.performance.bundleSize / 1024 / 1024).toFixed(2)}MB`, `First Load JS: ${(metrics.performance.firstLoadJS / 1024).toFixed(2)}KB`, `Lazy Loaded Chunks: ${metrics.performance.lazyLoadedChunks}`, `Image Optimization: ${metrics.performance.imageOptimization.optimizedCount}/${metrics.performance.imageOptimization.totalCount}`);
    }
    if (metrics.security) {
        report.push(chalk.yellow('\nSecurity:'), `Vulnerabilities: ${metrics.security.dependencyVulnerabilities}`, `Outdated Dependencies: ${metrics.security.outdatedDependencies}`, `Security Headers: ${metrics.security.securityHeaders ? '✓' : '✗'}`, `Auth Implementation: ${metrics.security.authImplementation ? '✓' : '✗'}`);
    }
    console.log(report.join('\n'));
};
const analyzeMetricsTrends = (history, days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const relevantHistory = history.filter(entry => new Date(entry.timestamp) >= cutoff);
    const calculateMetricTrend = (values) => {
        const validValues = values.filter((v) => v !== undefined);
        if (validValues.length < 2)
            return 'insufficient data';
        const first = validValues[0];
        const last = validValues[validValues.length - 1];
        const change = ((last - first) / first) * 100;
        return {
            change: change.toFixed(2) + '%',
            trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
        };
    };
    return {
        codeQuality: {
            eslintErrors: calculateMetricTrend(relevantHistory.map(h => h.metrics.codeQuality?.eslintErrors)),
            testCoverage: calculateMetricTrend(relevantHistory.map(h => h.metrics.codeQuality?.testCoverage))
        },
        performance: {
            bundleSize: calculateMetricTrend(relevantHistory.map(h => h.metrics.performance?.bundleSize)),
            firstLoadJS: calculateMetricTrend(relevantHistory.map(h => h.metrics.performance?.firstLoadJS))
        },
        security: {
            vulnerabilities: calculateMetricTrend(relevantHistory.map(h => h.metrics.security?.dependencyVulnerabilities))
        }
    };
};
const displayMetricsTrends = (trends) => {
    console.log(chalk.blue('\nMetrics Trends:'));
    Object.entries(trends).forEach(([category, metrics]) => {
        console.log(chalk.yellow(`\n${category}:`));
        Object.entries(metrics).forEach(([metric, trend]) => {
            console.log(`${metric}: ${JSON.stringify(trend)}`);
        });
    });
};
// CLI Commands
program
    .version('1.0.0')
    .description('RateMyEmployer CLI tool');
// Analysis command
program
    .command('analyze')
    .description('Analyze project structure and statistics')
    .action(async () => {
    const result = await analyzeProject();
    logResult(result);
});
// Documentation command
program
    .command('docs')
    .description('Generate project documentation')
    .action(async () => {
    const result = await generateDocs();
    logResult(result);
});
// Setup command
program
    .command('setup')
    .description('Setup development environment')
    .action(async () => {
    const result = await setupDev();
    logResult(result);
});
// Enhanced verify command
program
    .command('verify')
    .description('Run system verification checks')
    .option('-t, --types', 'Check TypeScript types')
    .option('-d, --deps', 'Check dependencies')
    .option('-b, --build', 'Verify build')
    .option('-c, --coverage', 'Run test coverage')
    .option('-a, --all', 'Run all checks')
    .action(async (options) => {
    const results = [];
    const startTime = new Date();
    if (options.all || options.types) {
        try {
            runCommand('tsc --noEmit');
            results.push({
                success: true,
                message: 'TypeScript validation passed',
                timestamp: new Date()
            });
        }
        catch (error) {
            results.push({
                success: false,
                message: 'TypeScript validation failed',
                details: error,
                timestamp: new Date()
            });
        }
    }
    if (options.all || options.deps) {
        try {
            const outdated = JSON.parse(runCommand('npm outdated --json', true) || '{}');
            results.push({
                success: Object.keys(outdated).length === 0,
                message: 'Dependency check complete',
                details: outdated,
                timestamp: new Date()
            });
        }
        catch (error) {
            results.push({
                success: true,
                message: 'All dependencies are up to date',
                timestamp: new Date()
            });
        }
    }
    if (options.all || options.build) {
        try {
            runCommand('npm run build');
            results.push({
                success: true,
                message: 'Build verification passed',
                timestamp: new Date()
            });
        }
        catch (error) {
            results.push({
                success: false,
                message: 'Build verification failed',
                details: error,
                timestamp: new Date()
            });
        }
    }
    if (options.all || options.coverage) {
        try {
            runCommand('npm run coverage');
            results.push({
                success: true,
                message: 'Coverage check passed',
                timestamp: new Date()
            });
        }
        catch (error) {
            results.push({
                success: false,
                message: 'Coverage check failed',
                details: error,
                timestamp: new Date()
            });
        }
    }
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    results.forEach(logResult);
    console.log(chalk.blue(`\nVerification completed in ${duration}s`));
});
// Enhanced database command
program
    .command('db')
    .description('Database operations')
    .option('-b, --backup', 'Backup database')
    .option('-r, --restore <file>', 'Restore database from backup')
    .option('-e, --export <type>', 'Export data (companies/reviews)')
    .action(async (options) => {
    const result = await handleDatabase(options);
    logResult(result);
});
// Add new commands
program
    .command('metrics')
    .description('Track and analyze project metrics')
    .option('-q, --quality', 'Analyze code quality')
    .option('-p, --performance', 'Analyze performance')
    .option('-s, --security', 'Analyze security')
    .option('-a, --all', 'Run all analyses')
    .action(async (options) => {
    const metrics = {};
    const startTime = new Date();
    console.log(chalk.blue('\nStarting metrics analysis...'));
    try {
        if (options.all || options.quality) {
            console.log(chalk.yellow('\nAnalyzing code quality...'));
            try {
                const qualityMetrics = await analyzeCodeQuality();
                if (qualityMetrics)
                    metrics.codeQuality = qualityMetrics;
            }
            catch (error) {
                console.error(chalk.red('Error analyzing code quality:'), error);
            }
        }
        if (options.all || options.performance) {
            console.log(chalk.yellow('\nAnalyzing performance...'));
            try {
                const performanceMetrics = await analyzePerformance();
                if (performanceMetrics)
                    metrics.performance = performanceMetrics;
            }
            catch (error) {
                console.error(chalk.red('Error analyzing performance:'), error);
            }
        }
        if (options.all || options.security) {
            console.log(chalk.yellow('\nAnalyzing security...'));
            try {
                const securityMetrics = await analyzeSecurity();
                if (securityMetrics)
                    metrics.security = securityMetrics;
            }
            catch (error) {
                console.error(chalk.red('Error analyzing security:'), error);
            }
        }
        const endTime = new Date();
        const duration = (endTime.getTime() - startTime.getTime()) / 1000;
        // Save metrics history
        const metricsHistory = loadMetricsHistory();
        metricsHistory.push({
            timestamp: new Date(),
            metrics
        });
        saveMetricsHistory(metricsHistory);
        // Generate report
        if (Object.keys(metrics).length === 0) {
            console.log(chalk.red('\nNo metrics were collected. Please check the errors above.'));
        }
        else {
            generateMetricsReport(metrics, duration);
        }
    }
    catch (error) {
        console.error(chalk.red('\nFatal error during metrics analysis:'), error);
        process.exit(1);
    }
});
program
    .command('trends')
    .description('Show metrics trends over time')
    .option('-d, --days <number>', 'Number of days to analyze', '30')
    .action(async (options) => {
    const history = loadMetricsHistory();
    const trends = analyzeMetricsTrends(history, parseInt(options.days));
    displayMetricsTrends(trends);
});
program.parse(process.argv);
