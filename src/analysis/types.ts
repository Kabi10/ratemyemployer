/**
 * Core types for MVP redundancy analysis
 */

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  type: FileType;
  size: number;
  linesOfCode: number;
  dependencies: string[];
  exports: string[];
  isTestFile: boolean;
}

export interface ComponentInfo extends FileInfo {
  componentName: string;
  isReactComponent: boolean;
  hooks: string[];
  props: string[];
  complexity: number;
}

export interface APIInfo extends FileInfo {
  method: string;
  route: string;
  handlers: string[];
}

export interface ScriptInfo extends FileInfo {
  scriptType: 'build' | 'dev' | 'test' | 'automation' | 'utility';
  executionFrequency: 'high' | 'medium' | 'low' | 'unknown';
}

export type FileType = 
  | 'component' 
  | 'page' 
  | 'api' 
  | 'script' 
  | 'config' 
  | 'documentation' 
  | 'test' 
  | 'utility' 
  | 'style' 
  | 'unknown';

export interface ScanResult {
  totalFiles: number;
  totalLinesOfCode: number;
  filesByType: Record<FileType, FileInfo[]>;
  components: ComponentInfo[];
  apis: APIInfo[];
  scripts: ScriptInfo[];
  dependencies: DependencyMap;
  scanTimestamp: Date;
}

export interface DependencyMap {
  [filePath: string]: {
    imports: string[];
    exports: string[];
    dependents: string[];
  };
}

export interface AnalysisResult {
  classification: 'Essential' | 'Nice-to-Have' | 'Bloat';
  recommendation: 'Keep' | 'Simplify' | 'Remove' | 'Defer';
  priority: 'High' | 'Medium' | 'Low';
  effort: 'Small' | 'Medium' | 'Large';
  reasoning: string;
  score: number;
  risks: string[];
  benefits: string[];
}