/**
 * Supabase Monitoring Dashboard
 * Real-time monitoring of database usage, costs, and performance metrics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Activity, 
  DollarSign, 
  Users, 
  HardDrive, 
  Wifi, 
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  getSupabaseUsageMetrics,
  calculateCostEstimate,
  checkUsageAlerts,
  logUsageMetrics,
  getUsageTrends,
  type SupabaseUsageMetrics,
  type CostEstimate
} from '@/lib/supabaseMonitoring';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonitoringDashboardProps {
  isAdmin?: boolean;
  refreshInterval?: number; // milliseconds
}

export function SupabaseMonitoringDashboard({ 
  isAdmin = false, 
  refreshInterval = 300000 // 5 minutes
}: MonitoringDashboardProps) {
  const [metrics, setMetrics] = useState<SupabaseUsageMetrics | null>(null);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [trends, setTrends] = useState<SupabaseUsageMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch current metrics
      const currentMetrics = await getSupabaseUsageMetrics();
      setMetrics(currentMetrics);
      
      // Calculate cost estimates
      const costs = calculateCostEstimate(currentMetrics);
      setCostEstimate(costs);
      
      // Check for alerts
      const currentAlerts = checkUsageAlerts(currentMetrics);
      setAlerts(currentAlerts);
      
      // Fetch usage trends
      const usageTrends = await getUsageTrends(7); // Last 7 days
      setTrends(usageTrends);
      
      // Log metrics for historical tracking
      await logUsageMetrics(currentMetrics);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching Supabase metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatBytes = (bytes: number, unit: 'MB' | 'GB' = 'MB') => {
    if (unit === 'GB') {
      return `${bytes.toFixed(2)} GB`;
    }
    return `${Math.round(bytes)} MB`;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!isAdmin) {
    return null; // Only show to admins
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Supabase Monitoring</h2>
          <p className="text-gray-600">
            Real-time database usage and cost tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <strong>Usage Alerts:</strong>
              {alerts.map((alert, index) => (
                <div key={index} className="text-sm">• {alert}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cost Overview */}
      {costEstimate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Cost Analysis
            </CardTitle>
            <CardDescription>
              Current and projected monthly costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${costEstimate.current}
                </div>
                <div className="text-sm text-gray-600">Current Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${costEstimate.projected}
                </div>
                <div className="text-sm text-gray-600">Projected (6mo)</div>
              </div>
              <div className="text-center">
                <Badge variant={costEstimate.current === 0 ? "default" : "destructive"}>
                  {costEstimate.current === 0 ? "Free Tier" : "Paid Plan"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Metrics */}
      {metrics && costEstimate && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Database Size */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Database Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{formatBytes(metrics.databaseSize)}</span>
                  <span className={getUsageColor(costEstimate.freeTierStatus.databaseUsage)}>
                    {costEstimate.freeTierStatus.databaseUsage}%
                  </span>
                </div>
                <Progress 
                  value={costEstimate.freeTierStatus.databaseUsage} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Limit: 500 MB
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bandwidth */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Bandwidth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{formatBytes(metrics.bandwidth, 'GB')}</span>
                  <span className={getUsageColor(costEstimate.freeTierStatus.bandwidthUsage)}>
                    {costEstimate.freeTierStatus.bandwidthUsage}%
                  </span>
                </div>
                <Progress 
                  value={costEstimate.freeTierStatus.bandwidthUsage} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Limit: 5 GB/month
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <HardDrive className="h-4 w-4 mr-2" />
                File Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{formatBytes(metrics.storage, 'GB')}</span>
                  <span className={getUsageColor(costEstimate.freeTierStatus.storageUsage)}>
                    {costEstimate.freeTierStatus.storageUsage}%
                  </span>
                </div>
                <Progress 
                  value={costEstimate.freeTierStatus.storageUsage} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Limit: 1 GB
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metrics.activeUsers.toLocaleString()}</span>
                  <span className={getUsageColor(costEstimate.freeTierStatus.usersUsage)}>
                    {costEstimate.freeTierStatus.usersUsage}%
                  </span>
                </div>
                <Progress 
                  value={costEstimate.freeTierStatus.usersUsage} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Limit: 50,000/month
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Trends Chart */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Usage Trends (7 Days)
            </CardTitle>
            <CardDescription>
              Historical database and bandwidth usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value, name) => [
                      name === 'databaseSize' ? `${value} MB` : `${value} GB`,
                      name === 'databaseSize' ? 'Database Size' : 'Bandwidth'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="databaseSize" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Database Size (MB)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bandwidth" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Bandwidth (GB)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costEstimate?.freeTierStatus.databaseUsage > 70 && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <strong>Database Size:</strong> Consider archiving old reviews or implementing data compression.
                </div>
              </div>
            )}
            
            {costEstimate?.freeTierStatus.bandwidthUsage > 70 && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <strong>Bandwidth:</strong> Implement response caching and optimize API payload sizes.
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <strong>Performance:</strong> Current setup is well-optimized for the free tier.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
