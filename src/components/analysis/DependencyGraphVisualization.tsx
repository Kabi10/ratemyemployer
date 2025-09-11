'use client';

/**
 * Interactive Dependency Graph Visualization
 * Displays component dependencies with interactive filtering and exploration
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DependencyVisualizer, DependencyGraph, DependencyNode } from '../../analysis/dependency-visualizer';
import { FileInfo, AnalysisResult } from '../../analysis/types';

interface DependencyGraphVisualizationProps {
  files: FileInfo[];
  dependencyMap: Record<string, { imports: string[]; exports: string[]; dependents: string[] }>;
  classifications: Record<string, AnalysisResult>;
}

interface GraphNode extends DependencyNode {
  x: number;
  y: number;
  selected: boolean;
  highlighted: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  type: 'import' | 'export';
  highlighted: boolean;
}

export default function DependencyGraphVisualization({ 
  files, 
  dependencyMap, 
  classifications 
}: DependencyGraphVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [showOnlyConnected, setShowOnlyConnected] = useState(true);
  const [maxNodes, setMaxNodes] = useState(50);
  const [graphData, setGraphData] = useState<DependencyGraph | null>(null);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize dependency visualizer and generate graph
  useEffect(() => {
    const visualizer = new DependencyVisualizer(dependencyMap, files);
    const graph = visualizer.generateDependencyGraph();
    setGraphData(graph);
  }, [files, dependencyMap]);

  // Process graph data for visualization
  useEffect(() => {
    if (!graphData) return;

    let nodes = [...graphData.nodes];

    // Apply classification filter
    if (filterClassification !== 'all') {
      nodes = nodes.filter(node => {
        const classification = classifications[node.id.replace(/_/g, '/')]?.classification;
        return classification === filterClassification;
      });
    }

    // Apply connected filter
    if (showOnlyConnected) {
      nodes = nodes.filter(node => 
        node.dependencies.length > 0 || node.dependents.length > 0
      );
    }

    // Limit number of nodes
    nodes = nodes.slice(0, maxNodes);

    // Calculate positions using force-directed layout simulation
    const processedNodes = calculateNodePositions(nodes);
    
    // Process edges
    const processedEdges = graphData.edges
      .filter(edge => 
        processedNodes.some(n => n.id === edge.from) && 
        processedNodes.some(n => n.id === edge.to)
      )
      .map(edge => ({
        ...edge,
        highlighted: selectedNode ? 
          edge.from === selectedNode || edge.to === selectedNode : false
      }));

    setGraphNodes(processedNodes);
    setGraphEdges(processedEdges);
  }, [graphData, filterClassification, showOnlyConnected, maxNodes, selectedNode, classifications]);

  // Simple force-directed layout calculation
  const calculateNodePositions = (nodes: DependencyNode[]): GraphNode[] => {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    return nodes.map((node, index) => {
      // Simple circular layout based on level and index
      const level = node.level || 0;
      const radius = Math.min(200 + level * 50, 250);
      const angle = (index / nodes.length) * 2 * Math.PI;
      
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        selected: selectedNode === node.id,
        highlighted: selectedNode ? 
          node.id === selectedNode || 
          node.dependencies.includes(selectedNode) || 
          node.dependents.includes(selectedNode) : false
      };
    });
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const getNodeColor = (node: GraphNode) => {
    const classification = classifications[node.id.replace(/_/g, '/')]?.classification;
    
    if (node.selected) return '#3B82F6'; // Blue for selected
    if (node.highlighted) return '#F59E0B'; // Amber for highlighted
    
    switch (classification) {
      case 'Essential': return '#10B981'; // Green
      case 'Nice-to-Have': return '#F59E0B'; // Amber
      case 'Bloat': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  const getNodeSize = (node: GraphNode) => {
    const baseSize = 8;
    const connectivityBonus = Math.min((node.dependencies.length + node.dependents.length) * 2, 12);
    return baseSize + connectivityBonus;
  };

  const selectedNodeData = selectedNode ? 
    graphNodes.find(n => n.id === selectedNode) : null;

  const statistics = graphData ? {
    totalNodes: graphData.nodes.length,
    totalEdges: graphData.edges.length,
    circularDependencies: graphData.circularDependencies.length,
    orphanedNodes: graphData.orphanedNodes.length,
    displayedNodes: graphNodes.length,
    displayedEdges: graphEdges.length
  } : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dependency Graph Visualization
        </h2>
        <p className="text-gray-600">
          Interactive exploration of component dependencies and relationships
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classification Filter
            </label>
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classifications</option>
              <option value="Essential">Essential</option>
              <option value="Nice-to-Have">Nice-to-Have</option>
              <option value="Bloat">Bloat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Nodes
            </label>
            <select
              value={maxNodes}
              onChange={(e) => setMaxNodes(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25 nodes</option>
              <option value={50}>50 nodes</option>
              <option value={100}>100 nodes</option>
              <option value={200}>200 nodes</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnlyConnected"
              checked={showOnlyConnected}
              onChange={(e) => setShowOnlyConnected(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showOnlyConnected" className="text-sm text-gray-700">
              Show only connected nodes
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedNode(null)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Dependency Graph</h3>
              {statistics && (
                <p className="text-sm text-gray-600">
                  Showing {statistics.displayedNodes} of {statistics.totalNodes} nodes, 
                  {statistics.displayedEdges} of {statistics.totalEdges} edges
                </p>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden">
              <svg
                ref={svgRef}
                width="100%"
                height="600"
                viewBox="0 0 800 600"
                className="bg-gray-50"
              >
                {/* Edges */}
                {graphEdges.map((edge, index) => {
                  const fromNode = graphNodes.find(n => n.id === edge.from);
                  const toNode = graphNodes.find(n => n.id === edge.to);
                  
                  if (!fromNode || !toNode) return null;

                  return (
                    <line
                      key={index}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={edge.highlighted ? '#F59E0B' : '#D1D5DB'}
                      strokeWidth={edge.highlighted ? 2 : 1}
                      opacity={edge.highlighted ? 1 : 0.6}
                    />
                  );
                })}

                {/* Nodes */}
                {graphNodes.map((node) => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={getNodeSize(node)}
                      fill={getNodeColor(node)}
                      stroke={node.selected ? '#1F2937' : 'white'}
                      strokeWidth={node.selected ? 2 : 1}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => handleNodeClick(node.id)}
                    />
                    {(node.selected || node.highlighted) && (
                      <text
                        x={node.x}
                        y={node.y - getNodeSize(node) - 5}
                        textAnchor="middle"
                        className="text-xs fill-gray-700 pointer-events-none"
                      >
                        {node.name}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Essential</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>Nice-to-Have</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Bloat</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Statistics */}
          {statistics && (
            <div className="bg-white rounded-lg shadow-md border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Graph Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Nodes:</span>
                  <span className="font-medium">{statistics.totalNodes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Edges:</span>
                  <span className="font-medium">{statistics.totalEdges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Displayed:</span>
                  <span className="font-medium">{statistics.displayedNodes} nodes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Circular Dependencies:</span>
                  <span className="font-medium text-red-600">{statistics.circularDependencies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orphaned Nodes:</span>
                  <span className="font-medium text-gray-600">{statistics.orphanedNodes}</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Node Details */}
          {selectedNodeData && (
            <div className="bg-white rounded-lg shadow-md border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Node Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900 break-all">{selectedNodeData.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900">{selectedNodeData.type}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Classification</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedNodeData.classification === 'Essential' ? 'bg-green-100 text-green-800' :
                    selectedNodeData.classification === 'Nice-to-Have' ? 'bg-yellow-100 text-yellow-800' :
                    selectedNodeData.classification === 'Bloat' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedNodeData.classification || 'Unknown'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dependencies</label>
                  <p className="text-sm text-gray-900">{selectedNodeData.dependencies.length}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dependents</label>
                  <p className="text-sm text-gray-900">{selectedNodeData.dependents.length}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <p className="text-sm text-gray-900">{selectedNodeData.level}</p>
                </div>

                {selectedNodeData.dependencies.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Depends On</label>
                    <div className="max-h-32 overflow-y-auto">
                      {selectedNodeData.dependencies.slice(0, 10).map((dep, index) => (
                        <div key={index} className="text-xs text-gray-600 truncate">
                          {dep}
                        </div>
                      ))}
                      {selectedNodeData.dependencies.length > 10 && (
                        <div className="text-xs text-gray-500 italic">
                          ... and {selectedNodeData.dependencies.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedNodeData.dependents.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Used By</label>
                    <div className="max-h-32 overflow-y-auto">
                      {selectedNodeData.dependents.slice(0, 10).map((dep, index) => (
                        <div key={index} className="text-xs text-gray-600 truncate">
                          {dep}
                        </div>
                      ))}
                      {selectedNodeData.dependents.length > 10 && (
                        <div className="text-xs text-gray-500 italic">
                          ... and {selectedNodeData.dependents.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">How to Use</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Click nodes to see details and highlight connections</li>
              <li>• Use filters to focus on specific classifications</li>
              <li>• Larger nodes have more dependencies</li>
              <li>• Lines show import relationships</li>
              <li>• Colors indicate MVP classification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}