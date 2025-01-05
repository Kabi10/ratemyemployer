const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Types
interface Problem {
  filePath: string;
  lineNumber: number;
  message: string;
  severity: 'error' | 'warning';
  code: string;
  errorCount: number;
}

interface ProblemGroup {
  filePath: string;
  totalErrors: number;
  problems: Problem[];
  category: 'Hook' | 'Test' | 'Route' | 'Config' | 'Component';
}

interface ExecSyncError extends Error {
  status: number;
  output: any[];
}

function isExecSyncError(error: unknown): error is ExecSyncError {
  return error instanceof Error &&
         typeof (error as ExecSyncError).status === 'number' &&
         Array.isArray((error as ExecSyncError).output);
}

// Constants
const OUTPUT_FILE = 'resources/CURRENT_PROBLEMS.md';
const PROBLEMS_JSON = 'resources/problems-tracker.json';

// Helper to determine category based on file path
function determineCategory(filePath: string): ProblemGroup['category'] {
  if (filePath.includes('hooks/')) return 'Hook';
  if (filePath.includes('.test.')) return 'Test';
  if (filePath.includes('route.')) return 'Route';
  if (filePath.includes('.yml') || filePath.includes('.config.')) return 'Config';
  return 'Component';
}

// Main scanning function
async function scanProblems(): Promise<ProblemGroup[] | []> {
    console.log('Running TypeScript compiler check...');
  
    let tscOutput = '';
    try {
        tscOutput = execSync('tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' }).toString();
    } catch (error) {
        if (isExecSyncError(error) && error.status === 2 && error.output[1]) {
            console.log('TypeScript found errors:');
            tscOutput = error.output[1].toString();
        } else {
            console.error('Error running TypeScript compiler:', error);
            return [];
        }
    }

    const problemGroups = new Map<string, ProblemGroup>();
    
    // Split the output into individual error messages
    const errors = tscOutput.split('\n').filter((line: string) => line.includes('error TS'));
    
    console.log(`Found ${errors.length} TypeScript errors`);

    errors.forEach((error: string) => {
        console.log('Processing error line:', error); // Log the raw error line

        // Parse file path, line number, and column (updated regex)
        const fileMatch = error.match(/^(.+?)\((\d+),(\d+)\):/);
        if (!fileMatch) {
            console.log('Could not parse file info from error line');
            return;
        }

        const [_, filePath, line, column] = fileMatch;
        const normalizedPath = path.normalize(filePath);

        // Parse error code and message (updated regex)
        const errorMatch = error.match(/: error TS(\d+): (.+)$/);
        if (!errorMatch) {
            console.log('Could not parse error code/message from error line');
            return;
        }

      const [__, code, message] = errorMatch;
      
      const problem: Problem = {
        filePath: normalizedPath,
        lineNumber: parseInt(line),
        message: message.trim(),
        severity: 'error',
        code: `TS${code}`,
        errorCount: 1
      };

      if (!problemGroups.has(normalizedPath)) {
        problemGroups.set(normalizedPath, {
          filePath: normalizedPath,
          totalErrors: 0,
          problems: [],
          category: determineCategory(normalizedPath)
        });
      }

      const group = problemGroups.get(normalizedPath)!;
      group.problems.push(problem);
      group.totalErrors++;
    });

    // Create resources directory if it doesn't exist
    const resourcesDir = path.join(process.cwd(), 'resources');
    if (!fs.existsSync(resourcesDir)) {
      console.log('Creating resources directory...');
      fs.mkdirSync(resourcesDir, { recursive: true });
    }

    return Array.from(problemGroups.values());
}

// Generate markdown output
function generateMarkdown(groups: ProblemGroup[]): string {
  const timestamp = new Date().toISOString().split('T')[0];
  
  let markdown = `# TypeScript Problems Report\n\n`;
  markdown += `Generated on: ${timestamp}\n\n`;
  markdown += `## Summary\n`;
  markdown += `- Total files with problems: ${groups.length}\n`;
  markdown += `- Total errors: ${groups.reduce((sum, g) => sum + g.totalErrors, 0)}\n\n`;

  // Group by category
  const categoryGroups = groups.reduce<Record<string, ProblemGroup[]>>((acc, group) => {
    if (!acc[group.category]) acc[group.category] = [];
    acc[group.category].push(group);
    return acc;
  }, {});

  // Generate markdown for each category
  for (const [category, items] of Object.entries(categoryGroups)) {
    markdown += `## ${category} Issues\n\n`;
    
    items.forEach(group => {
      markdown += `### ${path.basename(group.filePath)}\n`;
      markdown += `**Path:** \`${group.filePath}\`\n`;
      markdown += `**Total Errors:** ${group.totalErrors}\n\n`;
      
      if (group.problems.length > 0) {
        markdown += `#### Problems:\n`;
        group.problems.forEach(problem => {
          markdown += `- Line ${problem.lineNumber}: ${problem.message} (${problem.code})\n`;
        });
        markdown += '\n';
      }
    });
  }

  return markdown;
}

// Save problems to JSON for tracking
function saveProblemTracker(groups: ProblemGroup[]): void {
  const data = {
    lastUpdated: new Date().toISOString(),
    totalProblems: groups.reduce((sum, group) => sum + group.totalErrors, 0),
    groups
  };

  fs.writeFileSync(PROBLEMS_JSON, JSON.stringify(data, null, 2));
}

// Add debug logging
function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Directory exists: ${dir}`);
  }
}

// Main execution
async function main() {
  console.log('Starting problem scan...');
  console.log('Current working directory:', process.cwd());
  
  // Ensure directories exist
  ensureDirectoryExists(OUTPUT_FILE);
  ensureDirectoryExists(PROBLEMS_JSON);
  
  console.log('Scanning for problems...');
  
  const problems = await scanProblems();
  
  console.log(`Found ${problems.length} problems`);
  
  if (problems.length === 0) {
    console.log('No problems found!');
    return;
  }

  try {
    // Generate and save markdown report
    console.log('Generating markdown report...');
    const markdown = generateMarkdown(problems);
    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log(`Successfully wrote to ${OUTPUT_FILE}`);

    // Save JSON tracker
    console.log('Saving JSON tracker...');
    saveProblemTracker(problems);
    console.log(`Successfully wrote to ${PROBLEMS_JSON}`);

    console.log('All operations completed successfully!');
  } catch (error) {
    console.error('Error writing files:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scanProblems, generateMarkdown, saveProblemTracker }; 