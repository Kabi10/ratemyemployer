#!/usr/bin/env tsx

/**
 * Import Optimization Script
 * Identifies and reports unused imports across the codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface ImportAnalysis {
  file: string;
  unusedImports: string[];
  duplicateImports: string[];
  suggestions: string[];
}

class ImportOptimizer {
  private results: ImportAnalysis[] = [];
  private srcDir = 'src';

  async analyze(): Promise<ImportAnalysis[]> {
    console.log('🔍 Analyzing imports for optimization opportunities...');
    
    this.scanDirectory(this.srcDir);
    
    console.log(`\n📊 Analysis complete! Found ${this.results.length} files with optimization opportunities.`);
    
    return this.results;
  }

  private scanDirectory(dir: string): void {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.scanDirectory(fullPath);
      } else if (stat.isFile() && ['.ts', '.tsx'].includes(extname(item))) {
        this.analyzeFile(fullPath);
      }
    }
  }

  private analyzeFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const analysis = this.analyzeImports(filePath, content);
      
      if (analysis.unusedImports.length > 0 || analysis.duplicateImports.length > 0 || analysis.suggestions.length > 0) {
        this.results.push(analysis);
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze ${filePath}: ${error}`);
    }
  }

  private analyzeImports(filePath: string, content: string): ImportAnalysis {
    const lines = content.split('\n');
    const imports: string[] = [];
    const unusedImports: string[] = [];
    const duplicateImports: string[] = [];
    const suggestions: string[] = [];

    // Extract import statements
    const importRegex = /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"];?/gm;
    const importMatches = content.match(importRegex) || [];

    // Check for unused React import (common optimization)
    if (content.includes("import React from 'react'") || content.includes("import * as React from 'react'")) {
      if (!content.includes('React.') && !content.includes('createElement') && !content.includes('JSX')) {
        // Check if it's a TSX file that might need React for JSX
        if (filePath.endsWith('.tsx') && content.includes('<')) {
          // Modern React doesn't need React import for JSX
          suggestions.push('Consider removing React import (not needed in modern React with new JSX transform)');
        }
      }
    }

    // Check for duplicate imports from same module
    const importSources = new Map<string, string[]>();
    for (const importStatement of importMatches) {
      const sourceMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
      if (sourceMatch) {
        const source = sourceMatch[1];
        if (!importSources.has(source)) {
          importSources.set(source, []);
        }
        importSources.get(source)!.push(importStatement);
      }
    }

    // Find duplicates
    for (const [source, statements] of importSources) {
      if (statements.length > 1) {
        duplicateImports.push(`Multiple imports from '${source}' - consider consolidating`);
      }
    }

    // Check for unused Lucide React icons (common bloat)
    const lucideImports = importMatches.filter(imp => imp.includes('lucide-react'));
    for (const lucideImport of lucideImports) {
      const iconMatch = lucideImport.match(/\{\s*([^}]+)\s*\}/);
      if (iconMatch) {
        const icons = iconMatch[1].split(',').map(i => i.trim());
        for (const icon of icons) {
          if (!content.includes(`<${icon}`) && !content.includes(`${icon}(`)) {
            unusedImports.push(`Unused Lucide icon: ${icon}`);
          }
        }
      }
    }

    // Check for unused utility imports
    const utilityImports = ['clsx', 'cn', 'cva'];
    for (const util of utilityImports) {
      if (content.includes(`import.*${util}`) && !content.includes(`${util}(`)) {
        unusedImports.push(`Unused utility import: ${util}`);
      }
    }

    return {
      file: filePath,
      unusedImports,
      duplicateImports,
      suggestions
    };
  }

  generateReport(): string {
    let report = '# Import Optimization Report\n\n';
    report += `Generated on: ${new Date().toISOString()}\n\n`;
    
    if (this.results.length === 0) {
      report += '✅ No optimization opportunities found!\n';
      return report;
    }

    report += `## Summary\n\n`;
    report += `- Files analyzed: ${this.results.length}\n`;
    report += `- Total unused imports: ${this.results.reduce((sum, r) => sum + r.unusedImports.length, 0)}\n`;
    report += `- Total duplicate imports: ${this.results.reduce((sum, r) => sum + r.duplicateImports.length, 0)}\n\n`;

    for (const result of this.results) {
      report += `## ${result.file}\n\n`;
      
      if (result.unusedImports.length > 0) {
        report += `### Unused Imports\n`;
        for (const unused of result.unusedImports) {
          report += `- ${unused}\n`;
        }
        report += '\n';
      }
      
      if (result.duplicateImports.length > 0) {
        report += `### Duplicate Imports\n`;
        for (const duplicate of result.duplicateImports) {
          report += `- ${duplicate}\n`;
        }
        report += '\n';
      }
      
      if (result.suggestions.length > 0) {
        report += `### Suggestions\n`;
        for (const suggestion of result.suggestions) {
          report += `- ${suggestion}\n`;
        }
        report += '\n';
      }
    }

    return report;
  }
}

async function main() {
  const optimizer = new ImportOptimizer();
  const results = await optimizer.analyze();
  
  const report = optimizer.generateReport();
  writeFileSync('reports/import-optimization-report.md', report);
  
  console.log('\n📄 Report saved to reports/import-optimization-report.md');
  
  if (results.length > 0) {
    console.log('\n🎯 Top optimization opportunities:');
    results.slice(0, 5).forEach(result => {
      console.log(`  • ${result.file}: ${result.unusedImports.length + result.duplicateImports.length} issues`);
    });
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ImportOptimizer };