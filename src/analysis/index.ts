/**
 * Main entry point for MVP redundancy analysis infrastructure
 */

export { CodebaseScanner } from './scanner';
export { ComponentClassifier } from './classification';
export { DependencyAnalyzer } from './dependency-analyzer';
export * from './types';

import { CodebaseScanner } from './scanner';
import { ComponentClassifier } from './classification';
import { DependencyAnalyzer } from './dependency-analyzer';
import { ScanResult, AnalysisResult } from './types';

/**
 * Main analysis orchestrator that combines all analysis tools
 */
export class MVPRedundancyAnalyzer {
  private scanner: CodebaseScanner;
  private classifier: ComponentClassifier;
  private dependencyAnalyzer: DependencyAnalyzer;

  constructor() {
    this.scanner = new CodebaseScanner();
    this.classifier = new ComponentClassifier();
    this.dependencyAnalyzer = new DependencyAnalyzer();
  }

  /**
   * Run complete analysis of the codebase
   */
  async runCompleteAnalysis(rootDir?: string): Promise<{
    scanResults: ScanResult;
    classifications: Map<string, AnalysisResult>;
    dependencyAnalysis: ReturnType<DependencyAnalyzer['exportAnalysis']>;
    summary: {
      totalFiles: number;
      totalLinesOfCode: number;
      essentialFiles: number;
      niceToHaveFiles: number;
      bloatFiles: number;
      removalCandidates: number;
      simplificationCandidates: number;
    };
  }> {
    console.log('Starting MVP redundancy analysis...');

    // Step 1: Scan codebase
    console.log('Scanning codebase...');
    const scanResults = await this.scanner.scanCodebase(rootDir);

    // Step 2: Build dependency graph
    console.log('Building dependency graph...');
    this.dependencyAnalyzer.buildDependencyGraph(
      Object.values(scanResults.filesByType).flat(),
      scanResults.dependencies
    );

    // Step 3: Classify all files
    console.log('Classifying files...');
    const classifications = new Map<string, AnalysisResult>();
    const allFiles = Object.values(scanResults.filesByType).flat();

    for (const file of allFiles) {
      const analysis = this.classifier.classifyFile(file);
      classifications.set(file.path, analysis);
    }

    // Step 4: Validate classification consistency
    console.log('Validating classifications...');
    const inconsistencies = this.classifier.validateClassificationConsistency(classifications);
    if (inconsistencies.length > 0) {
      console.warn('Classification inconsistencies found:', inconsistencies);
    }

    // Step 5: Generate dependency analysis
    console.log('Analyzing dependencies...');
    const dependencyAnalysis = this.dependencyAnalyzer.exportAnalysis();

    // Step 6: Generate summary
    const summary = this.generateSummary(scanResults, classifications);

    console.log('Analysis complete!');
    return {
      scanResults,
      classifications,
      dependencyAnalysis,
      summary
    };
  }

  /**
   * Generate analysis summary
   */
  private generateSummary(
    scanResults: ScanResult,
    classifications: Map<string, AnalysisResult>
  ) {
    let essentialFiles = 0;
    let niceToHaveFiles = 0;
    let bloatFiles = 0;
    let removalCandidates = 0;
    let simplificationCandidates = 0;

    for (const [, analysis] of classifications) {
      switch (analysis.classification) {
        case 'Essential':
          essentialFiles++;
          break;
        case 'Nice-to-Have':
          niceToHaveFiles++;
          break;
        case 'Bloat':
          bloatFiles++;
          break;
      }

      switch (analysis.recommendation) {
        case 'Remove':
          removalCandidates++;
          break;
        case 'Simplify':
          simplificationCandidates++;
          break;
      }
    }

    return {
      totalFiles: scanResults.totalFiles,
      totalLinesOfCode: scanResults.totalLinesOfCode,
      essentialFiles,
      niceToHaveFiles,
      bloatFiles,
      removalCandidates,
      simplificationCandidates
    };
  }
}