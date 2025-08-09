'use client';

/**
 * Web Scraping Dashboard Component
 * Comprehensive dashboard for managing and monitoring web scraping operations
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Play, 
  Pause, 
  Plus, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Database,
  Globe,
  Settings,
  Eye,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { scrapingApi } from '@/lib/webScraping/scrapingApi';
import type { 
  ScrapingJob, 
  ScrapingStatsResponse, 
  ScrapingStatus,
  ScraperType,
  DataSource 
} from '@/types/webScraping';
import { 
  STATUS_LABELS, 
  STATUS_COLORS, 
  SCRAPER_TYPE_LABELS, 
  DATA_SOURCE_LABELS,
  getStatusColor 
} from '@/types/webScraping';

interface WebScrapingDashboardProps {
  showCreateJob?: boolean;
  showEngineControls?: boolean;
}

export function WebScrapingDashboard({ 
  showCreateJob = true,
  showEngineControls = true 
}: WebScrapingDashboardProps) {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [stats, setStats] = useState<ScrapingStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engineRunning, setEngineRunning] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ScrapingJob | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch jobs and stats in parallel
      const [jobsResponse, statsResponse] = await Promise.all([
        scrapingApi.getScrapingJobs({}, 20, 0),
        scrapingApi.getScrapingStats()
      ]);

      setJobs(jobsResponse.jobs);
      setStats(statsResponse);
    } catch (err) {
      console.error('Error fetching scraping data:', err);
      setError('Failed to load scraping data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEngine = async () => {
    try {
      await scrapingApi.startEngine();
      setEngineRunning(true);
    } catch (error) {
      console.error('Error starting engine:', error);
    }
  };

  const handleStopEngine = async () => {
    try {
      await scrapingApi.stopEngine();
      setEngineRunning(false);
    } catch (error) {
      console.error('Error stopping engine:', error);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await scrapingApi.cancelScrapingJob(jobId);
      await fetchData();
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await scrapingApi.retryScrapingJob(jobId);
      await fetchData();
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  const getStatusIcon = (status: ScrapingStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const duration = end - start;
    
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Web Scraping Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor and manage automated data collection operations
            </p>
          </div>
        </div>

        {showEngineControls && (
          <div className="flex items-center space-x-2">
            <Badge variant={engineRunning ? "default" : "secondary"}>
              {engineRunning ? "Engine Running" : "Engine Stopped"}
            </Badge>
            <Button
              variant={engineRunning ? "destructive" : "default"}
              size="sm"
              onClick={engineRunning ? handleStopEngine : handleStartEngine}
            >
              {engineRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Engine
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Engine
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Total Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_jobs}</div>
              <p className="text-xs text-gray-500">
                All scraping operations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.success_rate.toFixed(1)}%
              </div>
              <Progress value={stats.success_rate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Avg. Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.average_completion_time / 1000 / 60)}m
              </div>
              <p className="text-xs text-gray-500">
                Average processing time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Data Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.data_quality_average * 100).toFixed(0)}%
              </div>
              <Progress value={stats.data_quality_average * 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="data">Scraped Data</TabsTrigger>
          {showCreateJob && <TabsTrigger value="create">Create Job</TabsTrigger>}
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Scraping Jobs
                </h3>
                <p className="text-gray-500">
                  No scraping operations have been created yet.
                </p>
                {showCreateJob && (
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Job
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(job.status)}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {job.job_name}
                          </h3>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getStatusColor(job.status),
                              color: getStatusColor(job.status)
                            }}
                          >
                            {STATUS_LABELS[job.status]}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span>
                            <br />
                            {SCRAPER_TYPE_LABELS[job.scraper_type]}
                          </div>
                          <div>
                            <span className="font-medium">Source:</span>
                            <br />
                            {DATA_SOURCE_LABELS[job.data_source]}
                          </div>
                          <div>
                            <span className="font-medium">Company:</span>
                            <br />
                            {job.target_company_name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <br />
                            {job.started_at ? formatDuration(job.started_at, job.completed_at) : 'N/A'}
                          </div>
                        </div>

                        {job.error_message && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{job.error_message}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        
                        {job.status === 'running' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelJob(job.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        
                        {job.status === 'failed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRetryJob(job.id)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Data Source</CardTitle>
              <CardDescription>
                Success rates and job counts for each data source
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.by_source.map((source) => (
                <div key={source.source} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{DATA_SOURCE_LABELS[source.source]}</div>
                    <div className="text-sm text-gray-500">{source.job_count} jobs</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{source.success_rate.toFixed(1)}%</div>
                    <Progress value={source.success_rate} className="w-20 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Scraped Data Overview</CardTitle>
              <CardDescription>
                Recent data collected from scraping operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Scraped data management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {showCreateJob && (
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create Scraping Job</CardTitle>
                <CardDescription>
                  Set up a new automated data collection operation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Job creation interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
