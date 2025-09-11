import * as fs from 'fs';
import * as path from 'path';
import { FileInfo, ComponentInfo, APIInfo, ScriptInfo, FileType, ScanResult, DependencyMap } from './types';

/**
 * Codebase scanner utility for MVP redundancy analysis
 */
export class CodebaseScanner {
  private readonly excludePatterns = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    '.env',
    '.env.local',
    '.env.production',
    '.env.development'
  ];

  private readonly sourceExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sql', '.yml', '.yaml'
  ];

  /**
   * Scan the entire codebase starting from the given directory
   */
  async scanCodebase(rootDir: string = process.cwd()): Promise<ScanResult> {
    const allFiles = this.getAllFiles(rootDir);
    const fileInfos: FileInfo[] = [];
    const components: ComponentInfo[] = [];
    const apis: APIInfo[] = [];
    const scripts: ScriptInfo[] = [];

    for (const filePath of allFiles) {
      try {
        const fileInfo = await this.analyzeFile(filePath, rootDir);
        fileInfos.push(fileInfo);

        // Categorize specific file types
        if (fileInfo.type === 'component') {
          components.push(fileInfo as ComponentInfo);
        } else if (fileInfo.type === 'api') {
          apis.push(fileInfo as APIInfo);
        } else if (fileInfo.type === 'script') {
          scripts.push(fileInfo as ScriptInfo);
        }
      } catch (error) {
        console.warn(`Failed to analyze file ${filePath}:`, error);
      }
    }

    const dependencies = this.buildDependencyMap(fileInfos);
    const filesByType = this.groupFilesByType(fileInfos);

    return {
      totalFiles: fileInfos.length,
      totalLinesOfCode: fileInfos.reduce((sum, file) => sum + file.linesOfCode, 0),
      filesByType,
      components,
      apis,
      scripts,
      dependencies,
      scanTimestamp: new Date()
    };
  }

  /**
   * Get all files in directory recursively, excluding patterns
   */
  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    const traverse = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.shouldExclude(entry.name)) {
            traverse(fullPath);
          }
        } else if (entry.isFile() && this.isSourceFile(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    traverse(dir);
    return files;
  }

  /**
   * Analyze individual file and extract metadata
   */
  private async analyzeFile(filePath: string, rootDir: string): Promise<FileInfo> {
    const relativePath = path.relative(rootDir, filePath);
    const name = path.basename(filePath);
    const extension = path.extname(filePath);
    const stats = fs.statSync(filePath);
    
    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.warn(`Could not read file ${filePath}`);
    }

    const linesOfCode = this.countLinesOfCode(content);
    const dependencies = this.extractDependencies(content);
    const exports = this.extractExports(content);
    const fileType = this.determineFileType(relativePath, content);
    const isTestFile = this.isTestFile(relativePath);

    const baseInfo: FileInfo = {
      path: relativePath,
      name,
      extension,
      type: fileType,
      size: stats.size,
      linesOfCode,
      dependencies,
      exports,
      isTestFile
    };

    // Enhanced analysis for specific file types
    if (fileType === 'component') {
      return this.analyzeComponent(baseInfo, content);
    } else if (fileType === 'api') {
      return this.analyzeAPI(baseInfo, content, relativePath);
    } else if (fileType === 'script') {
      return this.analyzeScript(baseInfo, relativePath);
    }

    return baseInfo;
  }  
/**
   * Analyze React component file
   */
  private analyzeComponent(baseInfo: FileInfo, content: string): ComponentInfo {
    const componentName = this.extractComponentName(baseInfo.name, content);
    const isReactComponent = this.isReactComponent(content);
    const hooks = this.extractReactHooks(content);
    const props = this.extractProps(content);
    const complexity = this.calculateComplexity(content);

    return {
      ...baseInfo,
      componentName,
      isReactComponent,
      hooks,
      props,
      complexity
    };
  }

  /**
   * Analyze API endpoint file
   */
  private analyzeAPI(baseInfo: FileInfo, content: string, filePath: string): APIInfo {
    const route = this.extractAPIRoute(filePath);
    const method = this.extractHTTPMethod(content);
    const handlers = this.extractAPIHandlers(content);

    return {
      ...baseInfo,
      method,
      route,
      handlers
    };
  }

  /**
   * Analyze script file
   */
  private analyzeScript(baseInfo: FileInfo, filePath: string): ScriptInfo {
    const scriptType = this.determineScriptType(filePath);
    const executionFrequency = this.estimateExecutionFrequency(filePath);

    return {
      ...baseInfo,
      scriptType,
      executionFrequency
    };
  }

  /**
   * Determine file type based on path and content
   */
  private determineFileType(filePath: string, content: string): FileType {
    // Test files
    if (this.isTestFile(filePath)) {
      return 'test';
    }

    // API routes
    if (filePath.includes('/api/') || filePath.includes('\\api\\')) {
      return 'api';
    }

    // Pages
    if (filePath.includes('/app/') || filePath.includes('/pages/')) {
      return 'page';
    }

    // Components
    if (filePath.includes('/components/') && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'))) {
      return 'component';
    }

    // Scripts
    if (filePath.includes('/scripts/') || filePath.endsWith('.js') && !filePath.includes('/src/')) {
      return 'script';
    }

    // Configuration files
    if (this.isConfigFile(filePath)) {
      return 'config';
    }

    // Documentation
    if (filePath.endsWith('.md') || filePath.includes('/docs/')) {
      return 'documentation';
    }

    // Styles
    if (filePath.endsWith('.css') || filePath.endsWith('.scss') || filePath.endsWith('.sass')) {
      return 'style';
    }

    // React components (broader check)
    if (this.isReactComponent(content)) {
      return 'component';
    }

    // Utility files
    if (filePath.includes('/utils/') || filePath.includes('/lib/')) {
      return 'utility';
    }

    return 'unknown';
  }

  /**
   * Count lines of code (excluding empty lines and comments)
   */
  private countLinesOfCode(content: string): number {
    const lines = content.split('\n');
    let count = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
        count++;
      }
    }

    return count;
  }

  /**
   * Extract import dependencies from file content
   */
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    return [...new Set(dependencies)];
  }

  /**
   * Extract exports from file content
   */
  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    const namedExportRegex = /export\s*\{\s*([^}]+)\s*\}/g;

    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    while ((match = namedExportRegex.exec(content)) !== null) {
      const namedExports = match[1].split(',').map(exp => exp.trim().split(' as ')[0]);
      exports.push(...namedExports);
    }

    return [...new Set(exports)];
  }

  /**
   * Helper methods for file analysis
   */
  private shouldExclude(name: string): boolean {
    return this.excludePatterns.some(pattern => name.includes(pattern));
  }

  private isSourceFile(name: string): boolean {
    return this.sourceExtensions.some(ext => name.endsWith(ext));
  }

  private isTestFile(filePath: string): boolean {
    return filePath.includes('.test.') || 
           filePath.includes('.spec.') || 
           filePath.includes('/__tests__/') ||
           filePath.includes('\\__tests__\\');
  }

  private isConfigFile(filePath: string): boolean {
    const configFiles = [
      'package.json', 'tsconfig.json', 'next.config.js', 'tailwind.config.js',
      'jest.config.js', 'eslint.config.js', '.eslintrc.json', '.prettierrc',
      'docker-compose.yml', 'vercel.json', 'playwright.config.ts'
    ];
    return configFiles.some(config => filePath.endsWith(config));
  }

  private isReactComponent(content: string): boolean {
    return content.includes('import React') || 
           content.includes('from "react"') ||
           content.includes('from \'react\'') ||
           /export\s+(?:default\s+)?function\s+\w+.*\{[\s\S]*return\s*\([\s\S]*</.test(content) ||
           /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*return\s*\([\s\S]*</.test(content);
  }

  private extractComponentName(fileName: string, content: string): string {
    // Try to extract from export default
    const defaultExportMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)/);
    if (defaultExportMatch) {
      return defaultExportMatch[1];
    }

    // Fallback to filename
    return path.basename(fileName, path.extname(fileName));
  }

  private extractReactHooks(content: string): string[] {
    const hooks: string[] = [];
    const hookRegex = /use[A-Z]\w*/g;
    let match;

    while ((match = hookRegex.exec(content)) !== null) {
      hooks.push(match[0]);
    }

    return [...new Set(hooks)];
  }

  private extractProps(content: string): string[] {
    const props: string[] = [];
    // Simple prop extraction - could be enhanced
    const propsMatch = content.match(/interface\s+\w*Props\s*\{([^}]+)\}/);
    if (propsMatch) {
      const propsContent = propsMatch[1];
      const propMatches = propsContent.match(/(\w+)(?:\?)?:/g);
      if (propMatches) {
        props.push(...propMatches.map(prop => prop.replace(/[?:]/g, '')));
      }
    }

    return props;
  }

  private calculateComplexity(content: string): number {
    // Simple complexity calculation based on various factors
    let complexity = 0;
    
    // Count conditional statements
    complexity += (content.match(/if\s*\(/g) || []).length;
    complexity += (content.match(/\?\s*:/g) || []).length;
    complexity += (content.match(/switch\s*\(/g) || []).length;
    
    // Count loops
    complexity += (content.match(/for\s*\(/g) || []).length;
    complexity += (content.match(/while\s*\(/g) || []).length;
    complexity += (content.match(/\.map\s*\(/g) || []).length;
    complexity += (content.match(/\.filter\s*\(/g) || []).length;
    
    // Count function definitions
    complexity += (content.match(/function\s+\w+/g) || []).length;
    complexity += (content.match(/=>\s*\{/g) || []).length;

    return complexity;
  }

  private extractAPIRoute(filePath: string): string {
    // Extract route from file path (Next.js style)
    const apiMatch = filePath.match(/\/api\/(.+)\.(?:ts|js)$/);
    return apiMatch ? `/${apiMatch[1]}` : '';
  }

  private extractHTTPMethod(content: string): string {
    if (content.includes('export async function GET')) return 'GET';
    if (content.includes('export async function POST')) return 'POST';
    if (content.includes('export async function PUT')) return 'PUT';
    if (content.includes('export async function DELETE')) return 'DELETE';
    if (content.includes('export async function PATCH')) return 'PATCH';
    return 'UNKNOWN';
  }

  private extractAPIHandlers(content: string): string[] {
    const handlers: string[] = [];
    const handlerRegex = /export\s+async\s+function\s+(\w+)/g;
    let match;

    while ((match = handlerRegex.exec(content)) !== null) {
      handlers.push(match[1]);
    }

    return handlers;
  }

  private determineScriptType(filePath: string): 'build' | 'dev' | 'test' | 'automation' | 'utility' {
    if (filePath.includes('build') || filePath.includes('deploy')) return 'build';
    if (filePath.includes('test')) return 'test';
    if (filePath.includes('dev') || filePath.includes('watch')) return 'dev';
    if (filePath.includes('populate') || filePath.includes('migrate') || filePath.includes('setup')) return 'automation';
    return 'utility';
  }

  private estimateExecutionFrequency(filePath: string): 'high' | 'medium' | 'low' | 'unknown' {
    if (filePath.includes('build') || filePath.includes('dev')) return 'high';
    if (filePath.includes('test') || filePath.includes('setup')) return 'medium';
    if (filePath.includes('populate') || filePath.includes('migrate')) return 'low';
    return 'unknown';
  }

  /**
   * Build dependency map showing relationships between files
   */
  private buildDependencyMap(files: FileInfo[]): DependencyMap {
    const dependencyMap: DependencyMap = {};

    for (const file of files) {
      dependencyMap[file.path] = {
        imports: file.dependencies,
        exports: file.exports,
        dependents: []
      };
    }

    // Build reverse dependencies (dependents)
    for (const file of files) {
      for (const dependency of file.dependencies) {
        // Find files that match this dependency
        const matchingFiles = files.filter(f => 
          f.path.includes(dependency) || 
          f.name === dependency ||
          dependency.startsWith('./') && f.path.endsWith(dependency.slice(2))
        );

        for (const matchingFile of matchingFiles) {
          if (dependencyMap[matchingFile.path]) {
            dependencyMap[matchingFile.path].dependents.push(file.path);
          }
        }
      }
    }

    return dependencyMap;
  }

  /**
   * Group files by their type
   */
  private groupFilesByType(files: FileInfo[]): Record<FileType, FileInfo[]> {
    const grouped: Record<FileType, FileInfo[]> = {
      component: [],
      page: [],
      api: [],
      script: [],
      config: [],
      documentation: [],
      test: [],
      utility: [],
      style: [],
      unknown: []
    };

    for (const file of files) {
      grouped[file.type].push(file);
    }

    return grouped;
  }
}