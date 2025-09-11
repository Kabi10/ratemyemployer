'use client';

/**
 * Analysis Dashboard Page - Optimized for MVP
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load heavy components to improve initial page load
const AnalysisDashboard = dynamic(() => import('../../components/analysis/AnalysisDashboard'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
});

const DependencyGraphVisualization = dynamic(() => import('../../components/analysis/DependencyGraphVisualization'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
});

interface AnalysisData {
  scanResults: {
    totalFiles: number;
    totalLinesOfCode: number;
    filesByType: Record<string, any[]>;
    dependencies: Record<string, { imports: string[]; exports: string[]; dependents: string[] }>;
  };
  classifications: Record<string, any>;
  summary: {
    totalFiles: number;
    totalLinesOfCode: number;
    essentialFiles: number;
    niceToHaveFiles: number;
    bloatFiles: number;
    removalCandidates: number;
    simplificationCandidates: number;
  };
}

export default function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dependencies'>('dashboard');

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      
      // Try to load from existing JSON report
      const response = await fetch('/reports/mvp-redundancy-analysis-report.json');
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
      } else {
        // If no report exists, show instructions to generate one
        setError('No analysis report found. Please run the analysis first.');
      }
    } catch (err) {
      console.error('Error loading analysis data:', err);
      setError('Failed to load analysis data. Please ensure the analysis has been run.');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would trigger the analysis script
      // For now, we'll show a message about running the script manually
      setError('Please run the analysis script: npm run analyze:mvp');
    } catch (err) {
      setError('Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Available</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={runAnalysis}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Run Analysis
              </button>
              
              <div className="text-sm text-gray-500">
                <p className="mb-2">Or run manually:</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  npm run analyze:mvp
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analysis data available</p>
        </div>
      </div>
    );
  }

  const allFiles = Object.values(analysisData.scanResults.filesByType).flat();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                MVP Redundancy Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Interactive dashboard for codebase analysis and optimization
              </p>
            </div>
            
            <button
              onClick={loadAnalysisData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analysis Dashboard
            </button>
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dependencies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dependency Graph
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'dashboard' && (
          <AnalysisDashboard analysisData={analysisData} />
        )}
        
        {activeTab === 'dependencies' && (
          <DependencyGraphVisualization
            files={allFiles}
            dependencyMap={analysisData.scanResults.dependencies}
            classifications={analysisData.classifications}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Analysis generated on {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-4">
              <span>
                {analysisData.summary.totalFiles.toLocaleString()} files analyzed
              </span>
              <span>•</span>
              <span>
                {analysisData.summary.bloatFiles} files marked as bloat
              </span>
              <span>•</span>
              <span>
                {((analysisData.summary.bloatFiles / analysisData.summary.totalFiles) * 100).toFixed(1)}% reduction potential
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}