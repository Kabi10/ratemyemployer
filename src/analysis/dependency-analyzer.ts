import { FileInfo, DependencyMap } from './types';

/**
 * Dependency analysis tools for MVP redundancy analysis
 */

export interface DependencyNode {
  path: string;
  dependencies: string[];
  dependents: string[];
  depth: number;
  isCircular: boolean;
  circularPath?: string[];
}

export interface CircularDependency {
  cycle: string[];
  severity: 'High' | 'Medium' | 'Low';
  impact: string;
}

export interface ImpactAnalysis {
  affectedFiles: string[];
  riskLevel: 'High' | 'Medium' | 'Low';
  cascadeEffects: string[];
  mitigationSteps: string[];
}

export interface UnusedDependency {
  dependency: string;
  declaredIn: string[];
  actuallyUsed: boolean;
  canRemove: boolean;
  savings: {
    bundleSize?: number;
    complexity: number;
  };
}

export class DependencyAnalyzer {
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private packageJsonDeps: Set<string> = new Set();

  /**
   * Build comprehensive dependency graph from scan results
   */
  buildDependencyGraph(files: FileInfo[], dependencyMap: DependencyMap): Map<string, DependencyNode> {
    this.dependencyGraph.clear();

    // Initialize nodes
    for (const file of files) {
      const node: DependencyNode = {
        path: file.path,
        dependencies: dependencyMap[file.path]?.imports || [],
        dependents: dependencyMap[file.path]?.dependents || [],
        depth: 0,
        isCircular: false
      };
      this.dependencyGraph.set(file.path, node);
    }

    // Calculate depths and detect circular dependencies
    this.calculateDepths();
    this.detectCircularDependencies();

    return this.dependencyGraph;
  }

  /**
   * Detect circular dependencies in the codebase
   */
  detectCircularDependencies(): CircularDependency[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circularDeps: CircularDependency[] = [];

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart).concat([node]);
        
        const circular: CircularDependency = {
          cycle,
          severity: this.assessCircularSeverity(cycle),
          impact: this.describeCircularImpact(cycle)
        };
        
        circularDeps.push(circular);
        
        // Mark nodes as circular
        for (const cyclePath of cycle) {
          const graphNode = this.dependencyGraph.get(cyclePath);
          if (graphNode) {
            graphNode.isCircular = true;
            graphNode.circularPath = cycle;
          }
        }
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      recursionStack.add(node);

      const graphNode = this.dependencyGraph.get(node);
      if (graphNode) {
        for (const dep of graphNode.dependencies) {
          // Find the actual file path for this dependency
          const depFile = this.findDependencyFile(dep);
          if (depFile && this.dependencyGraph.has(depFile)) {
            dfs(depFile, [...path, node]);
          }
        }
      }

      recursionStack.delete(node);
    };

    for (const [filePath] of this.dependencyGraph) {
      if (!visited.has(filePath)) {
        dfs(filePath, []);
      }
    }

    return circularDeps;
  }

  /**
   * Analyze impact of removing a specific component
   */
  analyzeRemovalImpact(targetFile: string): ImpactAnalysis {
    const node = this.dependencyGraph.get(targetFile);
    if (!node) {
      return {
        affectedFiles: [],
        riskLevel: 'Low',
        cascadeEffects: [],
        mitigationSteps: []
      };
    }

    const affectedFiles = [...node.dependents];
    const cascadeEffects: string[] = [];
    const mitigationSteps: string[] = [];

    // Analyze cascade effects
    const visited = new Set<string>();
    const analyzeCascade = (filePath: string, depth: number = 0) => {
      if (visited.has(filePath) || depth > 3) return; // Limit depth to prevent infinite loops
      visited.add(filePath);

      const currentNode = this.dependencyGraph.get(filePath);
      if (currentNode) {
        for (const dependent of currentNode.dependents) {
          if (!affectedFiles.includes(dependent)) {
            affectedFiles.push(dependent);
            cascadeEffects.push(`${dependent} depends on ${filePath} which depends on ${targetFile}`);
          }
          analyzeCascade(dependent, depth + 1);
        }
      }
    };

    analyzeCascade(targetFile);

    // Determine risk level
    const riskLevel = this.assessRemovalRisk(affectedFiles.length, node);

    // Generate mitigation steps
    if (affectedFiles.length > 0) {
      mitigationSteps.push('Update import statements in dependent files');
      mitigationSteps.push('Replace functionality or provide alternatives');
      
      if (node.dependencies.length > 0) {
        mitigationSteps.push('Ensure dependencies are still needed by other files');
      }
      
      if (riskLevel === 'High') {
        mitigationSteps.push('Consider gradual removal with feature flags');
        mitigationSteps.push('Implement comprehensive testing before removal');
      }
    }

    return {
      affectedFiles,
      riskLevel,
      cascadeEffects,
      mitigationSteps
    };
  }

  /**
   * Detect unused dependencies from package.json
   */
  async detectUnusedDependencies(packageJsonPath: string, files: FileInfo[]): Promise<UnusedDependency[]> {
    const unusedDeps: UnusedDependency[] = [];
    
    try {
      // Read package.json (in a real implementation, you'd use fs.readFileSync)
      // For now, we'll simulate this with common dependencies
      const commonDeps = [
        '@types/node', '@types/react', 'typescript', 'eslint', 'prettier',
        'next', 'react', 'react-dom', 'tailwindcss', 'postcss'
      ];
      
      this.packageJsonDeps = new Set(commonDeps);
      
      // Collect all imports from files
      const usedDependencies = new Set<string>();
      for (const file of files) {
        for (const dep of file.dependencies) {
          // Extract package name (handle scoped packages)
          const packageName = this.extractPackageName(dep);
          if (packageName) {
            usedDependencies.add(packageName);
          }
        }
      }

      // Find unused dependencies
      for (const dep of this.packageJsonDeps) {
        const isUsed = usedDependencies.has(dep) || this.isImplicitlyUsed(dep);
        
        if (!isUsed) {
          unusedDeps.push({
            dependency: dep,
            declaredIn: ['package.json'],
            actuallyUsed: false,
            canRemove: this.canSafelyRemove(dep),
            savings: {
              complexity: this.estimateComplexityReduction(dep)
            }
          });
        }
      }
    } catch (error) {
      console.warn('Could not analyze package.json dependencies:', error);
    }

    return unusedDeps;
  }  /**
   *
 Generate dependency graph visualization data
   */
  generateVisualizationData(): {
    nodes: Array<{ id: string; label: string; type: string; circular: boolean }>;
    edges: Array<{ from: string; to: string; type: string }>;
  } {
    const nodes: Array<{ id: string; label: string; type: string; circular: boolean }> = [];
    const edges: Array<{ from: string; to: string; type: string }> = [];

    for (const [filePath, node] of this.dependencyGraph) {
      // Add node
      nodes.push({
        id: filePath,
        label: this.getFileLabel(filePath),
        type: this.getFileType(filePath),
        circular: node.isCircular
      });

      // Add edges for dependencies
      for (const dep of node.dependencies) {
        const depFile = this.findDependencyFile(dep);
        if (depFile && this.dependencyGraph.has(depFile)) {
          edges.push({
            from: filePath,
            to: depFile,
            type: 'dependency'
          });
        }
      }
    }

    return { nodes, edges };
  }

  /**
   * Get critical path analysis - files that are most depended upon
   */
  getCriticalPaths(): Array<{ file: string; dependentCount: number; depth: number; criticality: number }> {
    const criticalPaths: Array<{ file: string; dependentCount: number; depth: number; criticality: number }> = [];

    for (const [filePath, node] of this.dependencyGraph) {
      const dependentCount = node.dependents.length;
      const depth = node.depth;
      
      // Calculate criticality score (more dependents + deeper = more critical)
      const criticality = dependentCount * 2 + depth;

      if (dependentCount > 0) {
        criticalPaths.push({
          file: filePath,
          dependentCount,
          depth,
          criticality
        });
      }
    }

    return criticalPaths.sort((a, b) => b.criticality - a.criticality);
  }

  /**
   * Private helper methods
   */
  private calculateDepths(): void {
    const visited = new Set<string>();
    
    const calculateDepth = (filePath: string, currentDepth: number = 0): number => {
      if (visited.has(filePath)) {
        return currentDepth; // Avoid infinite recursion
      }
      
      visited.add(filePath);
      const node = this.dependencyGraph.get(filePath);
      
      if (!node || node.dependencies.length === 0) {
        node && (node.depth = currentDepth);
        return currentDepth;
      }

      let maxDepth = currentDepth;
      for (const dep of node.dependencies) {
        const depFile = this.findDependencyFile(dep);
        if (depFile && this.dependencyGraph.has(depFile)) {
          const depDepth = calculateDepth(depFile, currentDepth + 1);
          maxDepth = Math.max(maxDepth, depDepth);
        }
      }

      node.depth = maxDepth;
      return maxDepth;
    };

    for (const [filePath] of this.dependencyGraph) {
      if (!visited.has(filePath)) {
        calculateDepth(filePath);
      }
    }
  }

  private findDependencyFile(dependency: string): string | null {
    // Handle relative imports
    if (dependency.startsWith('./') || dependency.startsWith('../')) {
      // In a real implementation, you'd resolve the relative path
      // For now, we'll do a simple search
      for (const [filePath] of this.dependencyGraph) {
        if (filePath.includes(dependency.replace(/\.\//g, '').replace(/\.\.\//g, ''))) {
          return filePath;
        }
      }
    }

    // Handle absolute imports
    for (const [filePath] of this.dependencyGraph) {
      if (filePath.includes(dependency) || filePath.endsWith(`${dependency}.ts`) || filePath.endsWith(`${dependency}.tsx`)) {
        return filePath;
      }
    }

    return null;
  }

  private assessCircularSeverity(cycle: string[]): 'High' | 'Medium' | 'Low' {
    if (cycle.length <= 2) {
      return 'High'; // Direct circular dependency
    } else if (cycle.length <= 4) {
      return 'Medium';
    } else {
      return 'Low'; // Long cycles are usually less problematic
    }
  }

  private describeCircularImpact(cycle: string[]): string {
    const fileTypes = cycle.map(path => this.getFileType(path));
    const hasComponents = fileTypes.includes('component');
    const hasAPIs = fileTypes.includes('api');

    if (hasComponents && hasAPIs) {
      return 'Circular dependency between UI and API layers may cause initialization issues';
    } else if (hasComponents) {
      return 'Circular dependency between components may cause rendering issues';
    } else {
      return 'Circular dependency may cause module loading issues';
    }
  }

  private assessRemovalRisk(affectedCount: number, node: DependencyNode): 'High' | 'Medium' | 'Low' {
    if (affectedCount > 5 || node.isCircular) {
      return 'High';
    } else if (affectedCount > 2) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  private extractPackageName(importPath: string): string | null {
    // Handle scoped packages like @types/node
    if (importPath.startsWith('@')) {
      const parts = importPath.split('/');
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : importPath;
    }

    // Handle regular packages
    const parts = importPath.split('/');
    return parts[0];
  }

  private isImplicitlyUsed(dependency: string): boolean {
    // Some dependencies are used implicitly by the build system
    const implicitDeps = [
      'typescript', 'next', '@types/node', '@types/react',
      'eslint', 'prettier', 'postcss', 'tailwindcss'
    ];
    return implicitDeps.includes(dependency);
  }

  private canSafelyRemove(dependency: string): boolean {
    // Dependencies that are generally safe to remove if unused
    const safeDeps = [
      'lodash', 'moment', 'axios', 'uuid', 'classnames'
    ];
    return safeDeps.includes(dependency);
  }

  private estimateComplexityReduction(dependency: string): number {
    // Estimate complexity reduction (1-10 scale)
    const complexityMap: Record<string, number> = {
      'lodash': 3,
      'moment': 4,
      'axios': 2,
      'uuid': 1,
      'classnames': 1
    };
    return complexityMap[dependency] || 2;
  }

  private getFileLabel(filePath: string): string {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  }

  private getFileType(filePath: string): string {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/api/')) return 'api';
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.includes('/utils/')) return 'utility';
    if (filePath.includes('/lib/')) return 'library';
    if (filePath.includes('.test.') || filePath.includes('.spec.')) return 'test';
    return 'other';
  }

  /**
   * Export dependency analysis results for reporting
   */
  exportAnalysis(): {
    summary: {
      totalFiles: number;
      circularDependencies: number;
      criticalFiles: number;
      unusedDependencies: number;
    };
    details: {
      circularDeps: CircularDependency[];
      criticalPaths: Array<{ file: string; dependentCount: number; depth: number; criticality: number }>;
      riskAnalysis: Array<{ file: string; risk: 'High' | 'Medium' | 'Low'; reason: string }>;
    };
  } {
    const circularDeps = this.detectCircularDependencies();
    const criticalPaths = this.getCriticalPaths();
    
    const riskAnalysis = Array.from(this.dependencyGraph.entries()).map(([filePath, node]) => ({
      file: filePath,
      risk: this.assessRemovalRisk(node.dependents.length, node),
      reason: this.generateRiskReason(node)
    }));

    return {
      summary: {
        totalFiles: this.dependencyGraph.size,
        circularDependencies: circularDeps.length,
        criticalFiles: criticalPaths.filter(p => p.criticality > 5).length,
        unusedDependencies: 0 // Would be populated by detectUnusedDependencies
      },
      details: {
        circularDeps,
        criticalPaths: criticalPaths.slice(0, 20), // Top 20 critical files
        riskAnalysis: riskAnalysis.filter(r => r.risk !== 'Low')
      }
    };
  }

  private generateRiskReason(node: DependencyNode): string {
    const reasons: string[] = [];
    
    if (node.dependents.length > 5) {
      reasons.push(`High dependency count (${node.dependents.length} dependents)`);
    }
    
    if (node.isCircular) {
      reasons.push('Part of circular dependency');
    }
    
    if (node.depth > 3) {
      reasons.push(`Deep dependency chain (depth ${node.depth})`);
    }

    return reasons.join('; ') || 'Low risk';
  }
}