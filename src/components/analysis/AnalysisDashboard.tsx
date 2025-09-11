'use client';

/**
 * Interactive Analysis Dashboard
 * Provides visualization and filtering of MVP redundancy analysis results
 */

import React, { useState, useMemo } from 'react';
import { AnalysisResult, FileInfo, ComponentInfo, APIInfo, ScriptInfo } from '../../analysis/types';

interface AnalysisDashboardProps {
  analysisData: {
    scanResults: {
      totalFiles: number;
      totalLinesOfCode: number;
      filesByType: Record<string, FileInfo[]>;
    };
    classifications: Record<string, AnalysisResult>;
    summary: {
      totalFiles: number;
      totalLinesOfCode: number;
      essentialFiles: number;
      niceToHaveFiles: number;
      bloatFiles: number;
      removalCandidates: number;
      simplificationCandidates: number;
    };
  };
}

type FilterType = 'all' | 'Essential' | 'Nice-to-Have' | 'Bloat';
type SortField = 'name' | 'classification' | 'linesOfCode' | 'recommendation';
type SortDirection = 'asc' | 'desc';

export default function AnalysisDashboard({ analysisData }: AnalysisDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all files with their classifications
  const allFiles = useMemo(() => {
    const files: Array<FileInfo & { classification: AnalysisResult }> = [];
    
    Object.values(analysisData.scanResults.filesByType).flat().forEach(file => {
      const classification = analysisData.classifications[file.path];
      if (classification) {
        files.push({ ...file, classification });
      }
    });

    return files;
  }, [analysisData]);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let filtered = allFiles;

    // Apply classification filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(file => file.classification.classification === selectedFilter);
    }

    // Apply file type filter
    if (selectedFileType !== 'all') {
      filtered = filtered.filter(file => file.type === selectedFileType);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort files
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'classification':
          aValue = a.classification.classification;
          bValue = b.classification.classification;
          break;
        case 'linesOfCode':
          aValue = a.linesOfCode;
          bValue = b.linesOfCode;
          break;
        case 'recommendation':
          aValue = a.classification.recommendation;
          bValue = b.classification.recommendation;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allFiles, selectedFilter, selectedFileType, searchTerm, sortField, sortDirection]);

  // Get file type options
  const fileTypes = useMemo(() => {
    const types = new Set<string>();
    allFiles.forEach(file => types.add(file.type));
    return Array.from(types).sort();
  }, [allFiles]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Essential': return 'text-green-700 bg-green-100';
      case 'Nice-to-Have': return 'text-yellow-700 bg-yellow-100';
      case 'Bloat': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Keep': return 'text-green-700 bg-green-100';
      case 'Simplify': return 'text-blue-700 bg-blue-100';
      case 'Remove': return 'text-red-700 bg-red-100';
      case 'Defer': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MVP Redundancy Analysis Dashboard
        </h1>
        <p className="text-gray-600">
          Interactive visualization of codebase analysis results
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Files</h3>
          <p className="text-3xl font-bold text-blue-600">
            {analysisData.summary.totalFiles.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analysisData.summary.totalLinesOfCode.toLocaleString()} lines of code
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential</h3>
          <p className="text-3xl font-bold text-green-600">
            {analysisData.summary.essentialFiles}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {((analysisData.summary.essentialFiles / analysisData.summary.totalFiles) * 100).toFixed(1)}% of codebase
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bloat</h3>
          <p className="text-3xl font-bold text-red-600">
            {analysisData.summary.bloatFiles}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {((analysisData.summary.bloatFiles / analysisData.summary.totalFiles) * 100).toFixed(1)}% can be removed
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions Needed</h3>
          <p className="text-3xl font-bold text-orange-600">
            {analysisData.summary.removalCandidates + analysisData.summary.simplificationCandidates}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analysisData.summary.removalCandidates} remove, {analysisData.summary.simplificationCandidates} simplify
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classification Filter
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as FilterType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Classifications</option>
              <option value="Essential">Essential</option>
              <option value="Nice-to-Have">Nice-to-Have</option>
              <option value="Bloat">Bloat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type Filter
            </label>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {fileTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Files
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by file name or path..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredFiles.length} of {allFiles.length} files
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  File Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('classification')}
                >
                  Classification {sortField === 'classification' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('recommendation')}
                >
                  Recommendation {sortField === 'recommendation' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('linesOfCode')}
                >
                  LOC {sortField === 'linesOfCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.path} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {file.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {file.path}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {file.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(file.classification.classification)}`}>
                      {file.classification.classification}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationColor(file.classification.recommendation)}`}>
                      {file.classification.recommendation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {file.linesOfCode.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedFile(file.path)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Detail Modal */}
      {selectedFile && (
        <FileDetailModal
          file={allFiles.find(f => f.path === selectedFile)!}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

// File Detail Modal Component
interface FileDetailModalProps {
  file: FileInfo & { classification: AnalysisResult };
  onClose: () => void;
}

function FileDetailModal({ file, onClose }: FileDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">File Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
              <p className="text-sm text-gray-600 break-all">{file.path}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{file.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lines of Code</label>
                <p className="mt-1 text-sm text-gray-900">{file.linesOfCode.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Classification</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getClassificationColor(file.classification.classification)}`}>
                  {file.classification.classification}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recommendation</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRecommendationColor(file.classification.recommendation)}`}>
                  {file.classification.recommendation}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Reasoning</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {file.classification.reasoning}
              </p>
            </div>

            {file.classification.risks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risks</label>
                <ul className="text-sm text-gray-900 bg-red-50 p-3 rounded-md space-y-1">
                  {file.classification.risks.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {file.classification.benefits.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                <ul className="text-sm text-gray-900 bg-green-50 p-3 rounded-md space-y-1">
                  {file.classification.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Component-specific details */}
            {file.type === 'component' && (
              <ComponentDetails component={file as ComponentInfo} />
            )}

            {/* API-specific details */}
            {file.type === 'api' && (
              <APIDetails api={file as APIInfo} />
            )}

            {/* Script-specific details */}
            {file.type === 'script' && (
              <ScriptDetails script={file as ScriptInfo} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions (moved outside component to avoid re-creation)
function getClassificationColor(classification: string) {
  switch (classification) {
    case 'Essential': return 'text-green-700 bg-green-100';
    case 'Nice-to-Have': return 'text-yellow-700 bg-yellow-100';
    case 'Bloat': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
}

function getRecommendationColor(recommendation: string) {
  switch (recommendation) {
    case 'Keep': return 'text-green-700 bg-green-100';
    case 'Simplify': return 'text-blue-700 bg-blue-100';
    case 'Remove': return 'text-red-700 bg-red-100';
    case 'Defer': return 'text-gray-700 bg-gray-100';
    default: return 'text-gray-700 bg-gray-100';
  }
}

// Component-specific details
function ComponentDetails({ component }: { component: ComponentInfo }) {
  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-semibold text-gray-900 mb-2">Component Details</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block font-medium text-gray-700">Component Name</label>
          <p className="text-gray-900">{component.componentName || 'N/A'}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700">Complexity Score</label>
          <p className="text-gray-900">{component.complexity || 'N/A'}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700">React Component</label>
          <p className="text-gray-900">{component.isReactComponent ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700">Hooks Used</label>
          <p className="text-gray-900">{component.hooks?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}

// API-specific details
function APIDetails({ api }: { api: APIInfo }) {
  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-semibold text-gray-900 mb-2">API Details</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block font-medium text-gray-700">HTTP Method</label>
          <p className="text-gray-900">{api.method || 'N/A'}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700">Route</label>
          <p className="text-gray-900">{api.route || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <label className="block font-medium text-gray-700">Handlers</label>
          <p className="text-gray-900">{api.handlers?.join(', ') || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

// Script-specific details
function ScriptDetails({ script }: { script: ScriptInfo }) {
  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-semibold text-gray-900 mb-2">Script Details</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block font-medium text-gray-700">Script Type</label>
          <p className="text-gray-900">{script.scriptType || 'N/A'}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700">Execution Frequency</label>
          <p className="text-gray-900">{script.executionFrequency || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}