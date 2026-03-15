import { FileInfo, ComponentInfo, APIInfo, ScriptInfo } from './types';

/**
 * Classification framework for MVP redundancy analysis
 */

export type Classification = 'Essential' | 'Nice-to-Have' | 'Bloat';
export type Recommendation = 'Keep' | 'Simplify' | 'Remove' | 'Defer';
export type Priority = 'High' | 'Medium' | 'Low';
export type Effort = 'Small' | 'Medium' | 'Large';

export interface AnalysisResult {
  classification: Classification;
  recommendation: Recommendation;
  priority: Priority;
  effort: Effort;
  reasoning: string;
  score: number;
  risks: string[];
  benefits: string[];
}

export interface ClassificationCriteria {
  functionalityImpact: number; // 0-10: Does removing this break core user flows?
  complexityCost: number; // 0-10: How much maintenance burden does this add?
  userValue: number; // 0-10: Do users actually need this for the core use case?
  developmentVelocity: number; // 0-10: Does this slow down feature development?
  operationalOverhead: number; // 0-10: Does this complicate deployment/monitoring?
}

export class ComponentClassifier {
  private readonly mvpCoreFeatures = [
    'authentication',
    'login',
    'signup',
    'company',
    'review',
    'search',
    'filter',
    'form',
    'button',
    'input',
    'card',
    'list'
  ];

  private readonly bloatKeywords = [
    'scraping',
    'scraper',
    'monitoring',
    'analytics',
    'metrics',
    'distress',
    'rising',
    'wall',
    'fame',
    'shame',
    'mcp',
    'automation',
    'advanced',
    'complex'
  ];

  private readonly niceToHaveKeywords = [
    'profile',
    'notification',
    'email',
    'image',
    'upload',
    'social',
    'like',
    'share',
    'dashboard',
    'admin'
  ];

  /**
   * Classify a file based on its analysis
   */
  classifyFile(file: FileInfo): AnalysisResult {
    const criteria = this.evaluateCriteria(file);
    const score = this.calculateScore(criteria);
    const classification = this.determineClassification(score, file);
    const recommendation = this.generateRecommendation(classification, criteria, file);
    const priority = this.determinePriority(classification, criteria);
    const effort = this.estimateEffort(file, recommendation);
    const reasoning = this.generateReasoning(file, criteria, classification);
    const risks = this.identifyRisks(file, recommendation);
    const benefits = this.identifyBenefits(file, recommendation);

    return {
      classification,
      recommendation,
      priority,
      effort,
      reasoning,
      score,
      risks,
      benefits
    };
  }

  /**
   * Evaluate classification criteria for a file
   */
  private evaluateCriteria(file: FileInfo): ClassificationCriteria {
    const filePath = file.path.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Functionality Impact (higher = more essential)
    let functionalityImpact = 0;
    if (this.isCoreFeature(filePath, fileName)) {
      functionalityImpact = 9;
    } else if (this.isNiceToHave(filePath, fileName)) {
      functionalityImpact = 5;
    } else if (this.isBloat(filePath, fileName)) {
      functionalityImpact = 1;
    } else {
      functionalityImpact = 3;
    }

    // Complexity Cost (higher = more complex/costly)
    let complexityCost = 0;
    if (file.type === 'component' && (file as ComponentInfo).complexity) {
      complexityCost = Math.min(10, (file as ComponentInfo).complexity / 2);
    } else if (file.linesOfCode > 500) {
      complexityCost = 8;
    } else if (file.linesOfCode > 200) {
      complexityCost = 5;
    } else {
      complexityCost = 2;
    }

    // User Value (higher = more valuable to users)
    let userValue = functionalityImpact; // Start with functionality impact
    if (file.type === 'test') {
      userValue = 3; // Tests don't directly provide user value but are important
    } else if (file.type === 'documentation') {
      userValue = this.isCoreFeature(filePath, fileName) ? 4 : 1;
    }

    // Development Velocity (higher = slows down development more)
    let developmentVelocity = 0;
    if (file.dependencies.length > 10) {
      developmentVelocity = 7;
    } else if (file.dependencies.length > 5) {
      developmentVelocity = 4;
    } else {
      developmentVelocity = 1;
    }

    // Operational Overhead (higher = more operational complexity)
    let operationalOverhead = 0;
    if (file.type === 'script' && (file as ScriptInfo).scriptType === 'automation') {
      operationalOverhead = 6;
    } else if (file.type === 'config') {
      operationalOverhead = 3;
    } else if (this.isBloat(filePath, fileName)) {
      operationalOverhead = 5;
    } else {
      operationalOverhead = 1;
    }

    return {
      functionalityImpact,
      complexityCost,
      userValue,
      developmentVelocity,
      operationalOverhead
    };
  }

  /**
   * Calculate overall score based on criteria
   */
  private calculateScore(criteria: ClassificationCriteria): number {
    // Weight the criteria (higher score = more essential)
    const weights = {
      functionalityImpact: 0.4,
      userValue: 0.3,
      complexityCost: -0.15, // Negative because high complexity is bad
      developmentVelocity: -0.1, // Negative because slowing development is bad
      operationalOverhead: -0.05 // Negative because overhead is bad
    };

    return (
      criteria.functionalityImpact * weights.functionalityImpact +
      criteria.userValue * weights.userValue +
      criteria.complexityCost * weights.complexityCost +
      criteria.developmentVelocity * weights.developmentVelocity +
      criteria.operationalOverhead * weights.operationalOverhead
    );
  }

  /**
   * Determine classification based on score and file characteristics
   */
  private determineClassification(score: number, file: FileInfo): Classification {
    const filePath = file.path.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Force classification for certain patterns
    if (this.isBloat(filePath, fileName)) {
      return 'Bloat';
    }

    if (this.isCoreFeature(filePath, fileName)) {
      return 'Essential';
    }

    // Score-based classification
    if (score >= 6) {
      return 'Essential';
    } else if (score >= 3) {
      return 'Nice-to-Have';
    } else {
      return 'Bloat';
    }
  }  /*
*
   * Generate recommendation based on classification and criteria
   */
  private generateRecommendation(
    classification: Classification,
    criteria: ClassificationCriteria,
    file: FileInfo
  ): Recommendation {
    switch (classification) {
      case 'Essential':
        // Even essential files might need simplification if they're too complex
        if (criteria.complexityCost > 7) {
          return 'Simplify';
        }
        return 'Keep';

      case 'Nice-to-Have':
        // Nice-to-have features can be kept, simplified, or deferred
        if (criteria.complexityCost > 6) {
          return 'Simplify';
        } else if (criteria.developmentVelocity > 5) {
          return 'Defer';
        }
        return 'Keep';

      case 'Bloat':
        // Bloat should generally be removed, but some might be deferred
        if (file.type === 'test' || file.type === 'documentation') {
          return 'Defer'; // Don't immediately remove tests or docs
        }
        return 'Remove';

      default:
        return 'Keep';
    }
  }

  /**
   * Determine priority for the recommendation
   */
  private determinePriority(classification: Classification, criteria: ClassificationCriteria): Priority {
    if (classification === 'Bloat' && criteria.operationalOverhead > 5) {
      return 'High';
    }

    if (classification === 'Essential' && criteria.complexityCost > 7) {
      return 'High'; // High priority to simplify complex essential components
    }

    if (classification === 'Bloat') {
      return 'Medium';
    }

    return 'Low';
  }

  /**
   * Estimate effort required for the recommendation
   */
  private estimateEffort(file: FileInfo, recommendation: Recommendation): Effort {
    switch (recommendation) {
      case 'Remove':
        if (file.dependencies.length > 5 || file.linesOfCode > 300) {
          return 'Medium';
        }
        return 'Small';

      case 'Simplify':
        if (file.linesOfCode > 500) {
          return 'Large';
        } else if (file.linesOfCode > 200) {
          return 'Medium';
        }
        return 'Small';

      case 'Defer':
        return 'Small'; // Just moving/archiving

      case 'Keep':
      default:
        return 'Small';
    }
  }

  /**
   * Generate human-readable reasoning for the classification
   */
  private generateReasoning(
    file: FileInfo,
    criteria: ClassificationCriteria,
    classification: Classification
  ): string {
    const reasons: string[] = [];

    // Functionality impact reasoning
    if (criteria.functionalityImpact >= 8) {
      reasons.push('Critical for core user functionality');
    } else if (criteria.functionalityImpact >= 5) {
      reasons.push('Supports important user features');
    } else {
      reasons.push('Limited impact on core user flows');
    }

    // Complexity reasoning
    if (criteria.complexityCost >= 7) {
      reasons.push('High maintenance burden');
    } else if (criteria.complexityCost >= 4) {
      reasons.push('Moderate complexity');
    }

    // User value reasoning
    if (criteria.userValue >= 7) {
      reasons.push('High user value');
    } else if (criteria.userValue <= 2) {
      reasons.push('Minimal user value');
    }

    // File-specific reasoning
    if (file.type === 'test') {
      reasons.push('Testing infrastructure');
    } else if (file.type === 'documentation') {
      reasons.push('Documentation overhead');
    } else if (file.type === 'script') {
      const script = file as ScriptInfo;
      if (script.scriptType === 'automation') {
        reasons.push('Automation complexity');
      }
    }

    return reasons.join('; ');
  }

  /**
   * Identify risks associated with the recommendation
   */
  private identifyRisks(file: FileInfo, recommendation: Recommendation): string[] {
    const risks: string[] = [];

    if (recommendation === 'Remove') {
      if (file.dependencies.length > 0) {
        risks.push('May break dependent components');
      }
      if (file.type === 'api') {
        risks.push('May break frontend functionality');
      }
      if (file.type === 'component') {
        risks.push('May break UI functionality');
      }
    }

    if (recommendation === 'Simplify') {
      risks.push('May reduce functionality');
      if (file.type === 'component') {
        risks.push('May affect user experience');
      }
    }

    if (file.type === 'config') {
      risks.push('May affect build or deployment');
    }

    return risks;
  }

  /**
   * Identify benefits of the recommendation
   */
  private identifyBenefits(file: FileInfo, recommendation: Recommendation): string[] {
    const benefits: string[] = [];

    if (recommendation === 'Remove') {
      benefits.push('Reduces codebase complexity');
      benefits.push('Improves maintainability');
      if (file.linesOfCode > 100) {
        benefits.push('Significant LOC reduction');
      }
    }

    if (recommendation === 'Simplify') {
      benefits.push('Easier to understand and modify');
      benefits.push('Reduced maintenance burden');
    }

    if (recommendation === 'Defer') {
      benefits.push('Reduces immediate complexity');
      benefits.push('Can be restored if needed');
    }

    return benefits;
  }

  /**
   * Helper methods for feature classification
   */
  private isCoreFeature(filePath: string, fileName: string): boolean {
    return this.mvpCoreFeatures.some(feature => 
      filePath.includes(feature) || fileName.includes(feature)
    );
  }

  private isNiceToHave(filePath: string, fileName: string): boolean {
    return this.niceToHaveKeywords.some(keyword => 
      filePath.includes(keyword) || fileName.includes(keyword)
    );
  }

  private isBloat(filePath: string, fileName: string): boolean {
    return this.bloatKeywords.some(keyword => 
      filePath.includes(keyword) || fileName.includes(keyword)
    );
  }

  /**
   * Validate classification consistency across related files
   */
  validateClassificationConsistency(results: Map<string, AnalysisResult>): string[] {
    const inconsistencies: string[] = [];

    // Check for inconsistencies in related files
    for (const [filePath, result] of results.entries()) {
      // API and component consistency
      if (filePath.includes('/api/')) {
        const relatedComponents = Array.from(results.keys()).filter(path => 
          path.includes('/components/') && 
          this.extractFeatureName(path) === this.extractFeatureName(filePath)
        );

        for (const componentPath of relatedComponents) {
          const componentResult = results.get(componentPath);
          if (componentResult && this.isInconsistent(result, componentResult)) {
            inconsistencies.push(
              `Inconsistent classification between API ${filePath} (${result.classification}) and component ${componentPath} (${componentResult.classification})`
            );
          }
        }
      }
    }

    return inconsistencies;
  }

  private extractFeatureName(filePath: string): string {
    const parts = filePath.split('/');
    return parts[parts.length - 1].split('.')[0];
  }

  private isInconsistent(result1: AnalysisResult, result2: AnalysisResult): boolean {
    // Essential APIs should have Essential components and vice versa
    if (result1.classification === 'Essential' && result2.classification === 'Bloat') {
      return true;
    }
    if (result1.classification === 'Bloat' && result2.classification === 'Essential') {
      return true;
    }
    return false;
  }
}