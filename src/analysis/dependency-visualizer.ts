/**
 * Dependency Graph Visualization Utility
 * Creates visual representations of component dependencies for analysis reports
 */

import { DependencyMap, FileInfo } from './types';

export interface DependencyNode {
  id: string;
  name: string;
  type: string;
  classification?: 'Essential' | 'Nice-to-Have' | 'Bloat';
  dependents: string[];
  dependencies: string[];
  level: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: Array<{ from: string; to: string; type: 'import' | 'export' }>;
  levels: Record<number, string[]>;
  circularDependencies: string[][];
  orphanedNodes: string[];
}

export class DependencyVisualizer {
  private dependencyMap: DependencyMap;
  private files: FileInfo[];

  constructor(dependencyMap: DependencyMap, files: FileInfo[]) {
    this.dependencyMap = dependencyMap;
    this.files = files;
  }

  /**
   * Generate dependency graph data structure
   */
  generateDependencyGraph(): DependencyGraph {
    const nodes = this.createNodes();
    const edges = this.createEdges();
    const levels = this.calculateLevels(nodes);
    const circularDependencies = this.detectCircularDependencies();
    const orphanedNodes = this.findOrphanedNodes(nodes);

    return {
      nodes,
      edges,
      levels,
      circularDependencies,
      orphanedNodes
    };
  }

  /**
   * Generate Mermaid diagram syntax for dependency graph
   */
  generateMermaidDiagram(maxNodes: number = 50): string {
    const graph = this.generateDependencyGraph();
    const importantNodes = this.selectImportantNodes(graph.nodes, maxNodes);
    
    let mermaid = 'graph TD\n';
    
    // Add nodes with styling based on classification
    importantNodes.forEach(node => {
      const style = this.getNodeStyle(node.classification);
      const label = this.sanitizeLabel(node.name);
      mermaid += `    ${node.id}[${label}]${style}\n`;
    });

    // Add edges between important nodes
    graph.edges.forEach(edge => {
      const fromNode = importantNodes.find(n => n.id === edge.from);
      const toNode = importantNodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        mermaid += `    ${edge.from} --> ${edge.to}\n`;
      }
    });

    // Add styling definitions
    mermaid += '\n    classDef essential fill:#d4edda,stroke:#155724,stroke-width:2px\n';
    mermaid += '    classDef niceToHave fill:#fff3cd,stroke:#856404,stroke-width:2px\n';
    mermaid += '    classDef bloat fill:#f8d7da,stroke:#721c24,stroke-width:2px\n';

    return mermaid;
  }

  /**
   * Generate text-based dependency tree
   */
  generateDependencyTree(rootPath?: string): string {
    const graph = this.generateDependencyGraph();
    const root = rootPath ? graph.nodes.find(n => n.id === rootPath) : this.findRootNodes(graph.nodes)[0];
    
    if (!root) {
      return 'No root node found for dependency tree';
    }

    return this.buildTreeString(root, graph.nodes, new Set(), 0);
  }

  /**
   * Generate dependency statistics
   */
  generateDependencyStatistics(): {
    totalNodes: number;
    totalEdges: number;
    averageDependencies: number;
    averageDependents: number;
    maxDependencies: number;
    maxDependents: number;
    circularDependencyCount: number;
    orphanedNodeCount: number;
    levelDistribution: Record<number, number>;
  } {
    const graph = this.generateDependencyGraph();
    
    const dependencyCounts = graph.nodes.map(n => n.dependencies.length);
    const dependentCounts = graph.nodes.map(n => n.dependents.length);
    
    const levelDistribution: Record<number, number> = {};
    Object.entries(graph.levels).forEach(([level, nodes]) => {
      levelDistribution[parseInt(level)] = nodes.length;
    });

    return {
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
      averageDependencies: dependencyCounts.reduce((a, b) => a + b, 0) / dependencyCounts.length,
      averageDependents: dependentCounts.reduce((a, b) => a + b, 0) / dependentCounts.length,
      maxDependencies: Math.max(...dependencyCounts),
      maxDependents: Math.max(...dependentCounts),
      circularDependencyCount: graph.circularDependencies.length,
      orphanedNodeCount: graph.orphanedNodes.length,
      levelDistribution
    };
  }

  /**
   * Private helper methods
   */
  private createNodes(): DependencyNode[] {
    return this.files.map(file => ({
      id: this.sanitizeId(file.path),
      name: file.name,
      type: file.type,
      dependents: this.dependencyMap[file.path]?.dependents || [],
      dependencies: this.dependencyMap[file.path]?.imports || [],
      level: 0 // Will be calculated later
    }));
  }

  private createEdges(): Array<{ from: string; to: string; type: 'import' | 'export' }> {
    const edges: Array<{ from: string; to: string; type: 'import' | 'export' }> = [];

    Object.entries(this.dependencyMap).forEach(([filePath, deps]) => {
      const fromId = this.sanitizeId(filePath);
      
      deps.imports.forEach(importPath => {
        const toId = this.sanitizeId(importPath);
        edges.push({ from: fromId, to: toId, type: 'import' });
      });
    });

    return edges;
  }

  private calculateLevels(nodes: DependencyNode[]): Record<number, string[]> {
    const levels: Record<number, string[]> = {};
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const calculateLevel = (nodeId: string): number => {
      if (visiting.has(nodeId)) {
        return 0; // Circular dependency
      }
      if (visited.has(nodeId)) {
        const node = nodes.find(n => n.id === nodeId);
        return node?.level || 0;
      }

      visiting.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      
      if (!node || node.dependencies.length === 0) {
        node && (node.level = 0);
        visited.add(nodeId);
        visiting.delete(nodeId);
        return 0;
      }

      const maxDepLevel = Math.max(
        ...node.dependencies.map(dep => calculateLevel(this.sanitizeId(dep)))
      );
      
      node.level = maxDepLevel + 1;
      visited.add(nodeId);
      visiting.delete(nodeId);
      
      return node.level;
    };

    nodes.forEach(node => {
      calculateLevel(node.id);
      const level = node.level;
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(node.id);
    });

    return levels;
  }

  private detectCircularDependencies(): string[][] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const deps = this.dependencyMap[this.unsanitizeId(nodeId)]?.imports || [];
      deps.forEach(dep => {
        dfs(this.sanitizeId(dep), [...path, nodeId]);
      });

      recursionStack.delete(nodeId);
    };

    this.files.forEach(file => {
      const nodeId = this.sanitizeId(file.path);
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    });

    return cycles;
  }

  private findOrphanedNodes(nodes: DependencyNode[]): string[] {
    return nodes
      .filter(node => node.dependents.length === 0 && node.dependencies.length === 0)
      .map(node => node.id);
  }

  private selectImportantNodes(nodes: DependencyNode[], maxNodes: number): DependencyNode[] {
    // Prioritize nodes with high connectivity or important classifications
    return nodes
      .sort((a, b) => {
        const aScore = (a.dependents.length + a.dependencies.length) * 
          (a.classification === 'Essential' ? 3 : a.classification === 'Nice-to-Have' ? 2 : 1);
        const bScore = (b.dependents.length + b.dependencies.length) * 
          (b.classification === 'Essential' ? 3 : b.classification === 'Nice-to-Have' ? 2 : 1);
        return bScore - aScore;
      })
      .slice(0, maxNodes);
  }

  private getNodeStyle(classification?: string): string {
    switch (classification) {
      case 'Essential':
        return ':::essential';
      case 'Nice-to-Have':
        return ':::niceToHave';
      case 'Bloat':
        return ':::bloat';
      default:
        return '';
    }
  }

  private findRootNodes(nodes: DependencyNode[]): DependencyNode[] {
    return nodes.filter(node => node.dependencies.length === 0);
  }

  private buildTreeString(
    node: DependencyNode, 
    allNodes: DependencyNode[], 
    visited: Set<string>, 
    depth: number
  ): string {
    if (visited.has(node.id) || depth > 10) {
      return '  '.repeat(depth) + `${node.name} (circular/max depth)\n`;
    }

    visited.add(node.id);
    let result = '  '.repeat(depth) + `${node.name} [${node.classification || 'Unknown'}]\n`;

    node.dependents.forEach(depId => {
      const depNode = allNodes.find(n => n.id === this.sanitizeId(depId));
      if (depNode) {
        result += this.buildTreeString(depNode, allNodes, new Set(visited), depth + 1);
      }
    });

    return result;
  }

  private sanitizeId(path: string): string {
    return path.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private unsanitizeId(id: string): string {
    // This is a simplified reverse - in practice, you'd need to maintain a mapping
    return id.replace(/_/g, '/');
  }

  private sanitizeLabel(name: string): string {
    return name.replace(/[[\]]/g, '');
  }
}