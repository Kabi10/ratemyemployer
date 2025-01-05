import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ERROR_LOG_PATH = 'resources/ERRORS_AND_SOLUTIONS.md';
const ERROR_PATTERNS = {
  typescript: /TS\d+:/,
  nextjs: /error.*(?:build|Failed to compile)/i,
  supabase: /error.*(?:supabase|authentication|jwt)/i,
  database: /error.*(?:database|sql|rls policy)/i,
  test: /(?:FAIL|ERROR).*(?:test|expect)/i
};

interface ErrorEntry {
  date: string;
  title: string;
  message: string;
  context: {
    file?: string;
    environment: string;
    components?: string[];
  };
  solution?: string[];
  prevention?: string[];
  references?: string[];
  category: string;
}

async function getRecentErrors(): Promise<ErrorEntry[]> {
  const errors: ErrorEntry[] = [];

  // Check git commits for error fixes
  try {
    const gitLog = execSync(
      'git log --since="1 week ago" --grep="fix:" --grep="error" -i --pretty=format:"%h|%ad|%s" --date=short'
    ).toString();

    gitLog.split('\n').forEach(line => {
      if (line) {
        const [hash, date, message] = line.split('|');
        if (message.toLowerCase().includes('fix:')) {
          errors.push({
            date,
            title: message.replace('fix:', '').trim(),
            message: `Fixed in commit ${hash}`,
            context: {
              environment: 'production',
            },
            category: determineCategory(message)
          });
        }
      }
    });
  } catch (error) {
    console.warn('Could not read git logs:', error);
  }

  // Check TypeScript errors
  try {
    const tsErrors = execSync('npm run type-check 2>&1 || true').toString();
    const typeErrors = tsErrors.match(/TS\d+:.*$/gm);
    if (typeErrors) {
      typeErrors.forEach(error => {
        const match = error.match(/(.*?)\((.*?)\)/);
        if (match) {
          errors.push({
            date: new Date().toISOString().split('T')[0],
            title: 'TypeScript Error',
            message: error,
            context: {
              file: match[2],
              environment: 'development'
            },
            category: 'typescript'
          });
        }
      });
    }
  } catch (error) {
    console.warn('Could not check TypeScript errors:', error);
  }

  // Check test failures
  try {
    const testOutput = execSync('npm test 2>&1 || true').toString();
    const testErrors = testOutput.match(/FAIL.*test\\.*\.test\.[tj]sx?/g);
    if (testErrors) {
      testErrors.forEach(error => {
        errors.push({
          date: new Date().toISOString().split('T')[0],
          title: 'Test Failure',
          message: error,
          context: {
            environment: 'test'
          },
          category: 'testing'
        });
      });
    }
  } catch (error) {
    console.warn('Could not check test failures:', error);
  }

  return errors;
}

function determineCategory(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (ERROR_PATTERNS.typescript.test(lowerMessage)) return 'typescript';
  if (ERROR_PATTERNS.nextjs.test(lowerMessage)) return 'build';
  if (ERROR_PATTERNS.supabase.test(lowerMessage)) return 'authentication';
  if (ERROR_PATTERNS.database.test(lowerMessage)) return 'database';
  if (ERROR_PATTERNS.test.test(lowerMessage)) return 'testing';
  return 'runtime';
}

function formatErrorEntry(error: ErrorEntry): string {
  return `
### ${error.date} - ${error.title}
**Error Message:**
\`\`\`
${error.message}
\`\`\`

**Context:**
- File/Location: ${error.context.file || 'N/A'}
- Environment: ${error.context.environment}
${error.context.components ? `- Related Components: ${error.context.components.join(', ')}` : ''}

${error.solution ? `**Solution:**\n${error.solution.map(s => `- ${s}`).join('\n')}` : ''}

${error.prevention ? `**Prevention:**\n${error.prevention.map(p => `- ${p}`).join('\n')}` : ''}

${error.references ? `**References:**\n${error.references.map(r => `- ${r}`).join('\n')}` : ''}
`;
}

async function updateErrorLog(newErrors: ErrorEntry[]) {
  const currentContent = fs.readFileSync(ERROR_LOG_PATH, 'utf-8');
  const sections = currentContent.split('\n## ');
  
  newErrors.forEach(error => {
    const categorySection = sections.find(s => 
      s.toLowerCase().includes(error.category.toLowerCase())
    );
    
    if (categorySection) {
      const formattedError = formatErrorEntry(error);
      sections[sections.indexOf(categorySection)] += formattedError;
    }
  });

  const updatedContent = sections.join('\n## ');
  fs.writeFileSync(ERROR_LOG_PATH, updatedContent);
}

async function main() {
  try {
    console.log('Gathering recent errors...');
    const newErrors = await getRecentErrors();
    
    if (newErrors.length > 0) {
      console.log(`Found ${newErrors.length} new errors to add`);
      await updateErrorLog(newErrors);
      console.log('Error log updated successfully!');
    } else {
      console.log('No new errors found');
    }
  } catch (error) {
    console.error('Error updating error log:', error);
    process.exit(1);
  }
}

main(); 