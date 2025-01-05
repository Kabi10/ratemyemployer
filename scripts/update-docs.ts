import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as z from 'zod';

const DOCS_DIR = 'resources';
const DOCS_FILES = {
  PROJECT_GUIDE: 'PROJECT_GUIDE.md',
  AUTOMATION_GUIDE: 'AUTOMATION_GUIDE.md',
  SYSTEM_CHECKS: 'SYSTEM_CHECKS.md',
  ERROR_SOLUTIONS: 'ERROR_SOLUTIONS.md',
  README: 'README.md'
};

const PACKAGE_JSON_PATH = 'package.json';
const SCHEMAS_PATH = 'src/lib/schemas.ts';
const API_DIR = 'src/app/api';
const COMPONENTS_DIR = 'src/components';

interface UpdateInfo {
  lastUpdate: string;
  techStack: Record<string, string>;
  schemas: Record<string, any>;
  apiEndpoints: string[];
  components: string[];
  errors: string[];
  systemChecks: string[];
}

async function getPackageInfo(): Promise<Record<string, string>> {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  return {
    nextjs: packageJson.dependencies.next,
    react: packageJson.dependencies.react,
    typescript: packageJson.devDependencies.typescript,
    supabase: packageJson.dependencies['@supabase/supabase-js'],
    tailwind: packageJson.devDependencies.tailwindcss,
  };
}

async function getSchemaInfo(): Promise<Record<string, any>> {
  const schemaContent = fs.readFileSync(SCHEMAS_PATH, 'utf-8');
  const ast = parse(schemaContent, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  
  const schemas: Record<string, any> = {};
  
  traverse(ast, {
    VariableDeclaration(path) {
      const declarations = path.node.declarations;
      declarations.forEach(declaration => {
        if (declaration.id.type === 'Identifier' && 
            declaration.id.name.toLowerCase().includes('schema')) {
          schemas[declaration.id.name] = declaration;
        }
      });
    },
  });
  
  return schemas;
}

async function getAPIEndpoints(): Promise<string[]> {
  const endpoints: string[] = [];
  
  function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file === 'route.ts' || file === 'route.tsx') {
        endpoints.push(fullPath.replace(API_DIR, ''));
      }
    });
  }
  
  scanDir(API_DIR);
  return endpoints;
}

async function getComponents(): Promise<string[]> {
  const components: string[] = [];
  
  function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.tsx') && !file.endsWith('.test.tsx')) {
        components.push(fullPath.replace(COMPONENTS_DIR, ''));
      }
    });
  }
  
  scanDir(COMPONENTS_DIR);
  return components;
}

async function getErrorLog(): Promise<string[]> {
  try {
    const errorLog = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'error-log.json'), 'utf-8'));
    return errorLog.errors || [];
  } catch {
    return [];
  }
}

async function getSystemChecks(): Promise<string[]> {
  try {
    const checksLog = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'system-checks.json'), 'utf-8'));
    return checksLog.checks || [];
  } catch {
    return [];
  }
}

async function getCurrentInfo(): Promise<UpdateInfo> {
  return {
    lastUpdate: new Date().toISOString(),
    techStack: await getPackageInfo(),
    schemas: await getSchemaInfo(),
    apiEndpoints: await getAPIEndpoints(),
    components: await getComponents(),
    errors: await getErrorLog(),
    systemChecks: await getSystemChecks(),
  };
}

function updateProjectGuide(info: UpdateInfo): string {
  const guidePath = path.join(DOCS_DIR, DOCS_FILES.PROJECT_GUIDE);
  let content = fs.readFileSync(guidePath, 'utf-8');
  
  // Update tech stack versions
  content = content.replace(
    /## Architecture[\s\S]*?(?=##)/m,
    `## Architecture\n- Next.js ${info.techStack.nextjs}\n- React ${info.techStack.react}\n- TypeScript ${info.techStack.typescript}\n- Supabase ${info.techStack.supabase}\n- Tailwind CSS ${info.techStack.tailwind}\n- React Query for data fetching\n- Zod for schema validation\n\n`
  );
  
  return updateLastModified(content);
}

function updateSystemChecks(info: UpdateInfo): string {
  const checksPath = path.join(DOCS_DIR, DOCS_FILES.SYSTEM_CHECKS);
  let content = fs.readFileSync(checksPath, 'utf-8');
  
  // Update recent checks
  const recentChecks = info.systemChecks
    .slice(-5)
    .map(check => `- ${check}`)
    .join('\n');
  
  content = content.replace(
    /## Recent Checks[\s\S]*?(?=##)/m,
    `## Recent Checks\n${recentChecks}\n\n`
  );
  
  return updateLastModified(content);
}

function updateErrorSolutions(info: UpdateInfo): string {
  const errorsPath = path.join(DOCS_DIR, DOCS_FILES.ERROR_SOLUTIONS);
  let content = fs.readFileSync(errorsPath, 'utf-8');
  
  // Update recent errors
  const recentErrors = info.errors
    .slice(-5)
    .map(error => `- ${error}`)
    .join('\n');
  
  content = content.replace(
    /## Recent Issues[\s\S]*?(?=##)/m,
    `## Recent Issues\n${recentErrors}\n\n`
  );
  
  return updateLastModified(content);
}

function updateLastModified(content: string): string {
  return content.replace(
    /\*This guide is automatically maintained.*\*/,
    `*This guide is automatically maintained and updated with project changes. Last updated: ${new Date().toLocaleDateString()}*`
  );
}

async function main() {
  try {
    const info = await getCurrentInfo();
    
    // Update all documentation files
    fs.writeFileSync(
      path.join(DOCS_DIR, DOCS_FILES.PROJECT_GUIDE),
      updateProjectGuide(info)
    );
    
    fs.writeFileSync(
      path.join(DOCS_DIR, DOCS_FILES.SYSTEM_CHECKS),
      updateSystemChecks(info)
    );
    
    fs.writeFileSync(
      path.join(DOCS_DIR, DOCS_FILES.ERROR_SOLUTIONS),
      updateErrorSolutions(info)
    );
    
    console.log('All documentation updated successfully!');
  } catch (error) {
    console.error('Error updating documentation:', error);
    process.exit(1);
  }
}

main(); 