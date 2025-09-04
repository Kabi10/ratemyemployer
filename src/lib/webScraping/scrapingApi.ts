/**
 * Web Scraping API
 * API layer for managing scraping operations and data retrieval
 */

import { supabase } from '@/lib/supabaseClient';
import { scrapingEngine } from './scrapingEngine';
import type {
  ScrapingJob,
  ScrapedData,
  CompanyDataEnhancement,
  ScrapingStatsResponse,
  CreateScrapingJobRequest,
  ScrapingJobResponse,
  ScrapingJobFilter,
  DataEnhancementFilter,
  ScrapingStatus,
  ScraperType as _ScraperType,
  DataSource
} from '@/types/webScraping';

export class ScrapingApi {
  /**
   * Create a new scraping job
   */
  async createScrapingJob(request: CreateScrapingJobRequest): Promise<ScrapingJobResponse> {
    return await scrapingEngine.createJob(request);
  }

  /**
   * Get scraping jobs with filtering
   */
  async getScrapingJobs(
    filter: ScrapingJobFilter = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{ jobs: ScrapingJob[]; total_count: number }> {
    try {
      let query = supabase
        .from('scraping_jobs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.scraper_type) {
        query = query.eq('scraper_type', filter.scraper_type);
      }

      if (filter.data_source) {
        query = query.eq('data_source', filter.data_source);
      }

      if (filter.company_id) {
        query = query.eq('target_company_id', filter.company_id);
      }

      if (filter.date_range) {
        query = query
          .gte('created_at', filter.date_range.start)
          .lte('created_at', filter.date_range.end);
      }

      // Apply pagination and ordering
      const { data: jobs, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch scraping jobs: ${error.message}`);
      }

      return {
        jobs: jobs as ScrapingJob[],
        total_count: count || 0
      };

    } catch (error) {
      console.error('Error fetching scraping jobs:', error);
      throw error;
    }
  }

  /**
   * Get scraped data with filtering
   */
  async getScrapedData(
    filter: { 
      company_id?: number; 
      data_type?: string; 
      is_validated?: boolean;
      scraping_job_id?: string;
    } = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: ScrapedData[]; total_count: number }> {
    try {
      let query = supabase
        .from('scraped_data')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filter.company_id) {
        query = query.eq('company_id', filter.company_id);
      }

      if (filter.data_type) {
        query = query.eq('data_type', filter.data_type);
      }

      if (filter.is_validated !== undefined) {
        query = query.eq('is_validated', filter.is_validated);
      }

      if (filter.scraping_job_id) {
        query = query.eq('scraping_job_id', filter.scraping_job_id);
      }

      // Apply pagination and ordering
      const { data: scrapedData, error, count } = await query
        .order('scraped_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch scraped data: ${error.message}`);
      }

      return {
        data: scrapedData as ScrapedData[],
        total_count: count || 0
      };

    } catch (error) {
      console.error('Error fetching scraped data:', error);
      throw error;
    }
  }

  /**
   * Get company data enhancements
   */
  async getCompanyEnhancements(
    filter: DataEnhancementFilter = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{ enhancements: CompanyDataEnhancement[]; total_count: number }> {
    try {
      let query = supabase
        .from('company_data_enhancements')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filter.company_id) {
        query = query.eq('company_id', filter.company_id);
      }

      if (filter.data_source) {
        query = query.eq('data_source', filter.data_source);
      }

      if (filter.enhancement_type) {
        query = query.eq('enhancement_type', filter.enhancement_type);
      }

      if (filter.is_verified !== undefined) {
        query = query.eq('is_verified', filter.is_verified);
      }

      if (filter.confidence_threshold) {
        query = query.gte('confidence_score', filter.confidence_threshold);
      }

      // Apply pagination and ordering
      const { data: enhancements, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch company enhancements: ${error.message}`);
      }

      return {
        enhancements: enhancements as CompanyDataEnhancement[],
        total_count: count || 0
      };

    } catch (error) {
      console.error('Error fetching company enhancements:', error);
      throw error;
    }
  }

  /**
   * Get scraping statistics
   */
  async getScrapingStats(): Promise<ScrapingStatsResponse> {
    try {
      // Get job counts by status
      const { data: jobStats } = await supabase
        .from('scraping_jobs')
        .select('status')
        .order('created_at', { ascending: false });

      if (!jobStats) {
        throw new Error('Failed to fetch job statistics');
      }

      const totalJobs = jobStats.length;
      const completedJobs = jobStats.filter(j => j.status === 'completed').length;
      const failedJobs = jobStats.filter(j => j.status === 'failed').length;
      const pendingJobs = jobStats.filter(j => j.status === 'pending').length;

      // Calculate success rate
      const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

      // Get average completion time for completed jobs
      const { data: completedJobsData } = await supabase
        .from('scraping_jobs')
        .select('started_at, completed_at')
        .eq('status', 'completed')
        .not('started_at', 'is', null)
        .not('completed_at', 'is', null);

      let averageCompletionTime = 0;
      if (completedJobsData && completedJobsData.length > 0) {
        const totalTime = completedJobsData.reduce((sum, job) => {
          const start = new Date(job.started_at!).getTime();
          const end = new Date(job.completed_at!).getTime();
          return sum + (end - start);
        }, 0);
        averageCompletionTime = totalTime / completedJobsData.length;
      }

      // Get data quality average
      const { data: qualityData } = await supabase
        .from('scraped_data')
        .select('confidence_score')
        .not('confidence_score', 'is', null);

      let dataQualityAverage = 0;
      if (qualityData && qualityData.length > 0) {
        const totalQuality = qualityData.reduce((sum, item) => sum + item.confidence_score, 0);
        dataQualityAverage = totalQuality / qualityData.length;
      }

      // Get stats by source
      const { data: sourceStats } = await supabase
        .from('scraping_jobs')
        .select('data_source, status')
        .order('created_at', { ascending: false });

      const bySource = this.calculateSourceStats(sourceStats || []);

      return {
        total_jobs: totalJobs,
        completed_jobs: completedJobs,
        failed_jobs: failedJobs,
        pending_jobs: pendingJobs,
        average_completion_time: averageCompletionTime,
        success_rate: successRate,
        data_quality_average: dataQualityAverage,
        by_source: bySource
      };

    } catch (error) {
      console.error('Error fetching scraping statistics:', error);
      throw error;
    }
  }

  /**
   * Cancel a scraping job
   */
  async cancelScrapingJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) {
        throw new Error(`Failed to cancel scraping job: ${error.message}`);
      }

    } catch (error) {
      console.error('Error cancelling scraping job:', error);
      throw error;
    }
  }

  /**
   * Retry a failed scraping job
   */
  async retryScrapingJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'pending',
          retry_count: 0,
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) {
        throw new Error(`Failed to retry scraping job: ${error.message}`);
      }

    } catch (error) {
      console.error('Error retrying scraping job:', error);
      throw error;
    }
  }

  /**
   * Validate scraped data
   */
  async validateScrapedData(dataId: string, isValid: boolean, notes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('scraped_data')
        .update({ 
          is_validated: isValid,
          validation_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', dataId);

      if (error) {
        throw new Error(`Failed to validate scraped data: ${error.message}`);
      }

    } catch (error) {
      console.error('Error validating scraped data:', error);
      throw error;
    }
  }

  /**
   * Verify company enhancement
   */
  async verifyEnhancement(enhancementId: string, isVerified: boolean): Promise<void> {
    try {
      const updateData: any = { 
        is_verified: isVerified,
        updated_at: new Date().toISOString()
      };

      if (isVerified) {
        updateData.verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('company_data_enhancements')
        .update(updateData)
        .eq('id', enhancementId);

      if (error) {
        throw new Error(`Failed to verify enhancement: ${error.message}`);
      }

    } catch (error) {
      console.error('Error verifying enhancement:', error);
      throw error;
    }
  }

  /**
   * Get scraping logs for a job
   */
  async getScrapingLogs(
    jobId: string,
    limit: number = 50
  ): Promise<Array<{
    id: string;
    log_level: string;
    message: string;
    details: Record<string, any>;
    created_at: string;
  }>> {
    try {
      const { data: logs, error } = await supabase
        .from('scraping_logs')
        .select('id, log_level, message, details, created_at')
        .eq('scraping_job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch scraping logs: ${error.message}`);
      }

      return logs || [];

    } catch (error) {
      console.error('Error fetching scraping logs:', error);
      throw error;
    }
  }

  /**
   * Start the scraping engine
   */
  async startEngine(): Promise<void> {
    await scrapingEngine.start();
  }

  /**
   * Stop the scraping engine
   */
  async stopEngine(): Promise<void> {
    await scrapingEngine.stop();
  }

  /**
   * Calculate statistics by data source
   */
  private calculateSourceStats(jobs: Array<{ data_source: DataSource; status: ScrapingStatus }>) {
    const sourceMap = new Map<DataSource, { total: number; completed: number }>();

    for (const job of jobs) {
      const current = sourceMap.get(job.data_source) || { total: 0, completed: 0 };
      current.total++;
      if (job.status === 'completed') {
        current.completed++;
      }
      sourceMap.set(job.data_source, current);
    }

    return Array.from(sourceMap.entries()).map(([source, stats]) => ({
      source,
      job_count: stats.total,
      success_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }));
  }
}

// Export singleton instance
export const scrapingApi = new ScrapingApi();
