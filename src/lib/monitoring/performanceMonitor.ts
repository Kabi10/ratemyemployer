/**
 * Performance Monitoring System
 * Comprehensive performance tracking and optimization for RateMyEmployer
 */

import { supabase } from '@/lib/supabaseClient';

interface PerformanceMetric {
  id?: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  context: Record<string, any>;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
  timestamp: string;
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

interface DatabasePerformanceMetric {
  query_type: string;
  table_name: string;
  execution_time_ms: number;
  rows_affected: number;
  query_hash: string;
  success: boolean;
  error_message?: string;
}

interface APIPerformanceMetric {
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  request_size_bytes?: number;
  response_size_bytes?: number;
  user_id?: string;
  error_message?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsBuffer: PerformanceMetric[] = [];
  private bufferSize = 50;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.startPeriodicFlush();
    this.setupWebVitalsTracking();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Track Web Vitals metrics
   */
  private setupWebVitalsTracking(): void {
    if (typeof window === 'undefined') return;

    // Dynamic import for client-side only
    import('web-vitals').then((mod: any) => {
      const getCLS = mod.getCLS || mod.onCLS;
      const getFID = mod.getFID || mod.onFID;
      const getFCP = mod.getFCP || mod.onFCP;
      const getLCP = mod.getLCP || mod.onLCP;
      const getTTFB = mod.getTTFB || mod.onTTFB;
      if (getCLS) getCLS(this.onWebVital.bind(this));
      if (getFID) getFID(this.onWebVital.bind(this));
      if (getFCP) getFCP(this.onWebVital.bind(this));
      if (getLCP) getLCP(this.onWebVital.bind(this));
      if (getTTFB) getTTFB(this.onWebVital.bind(this));
    }).catch(error => {
      console.warn('Web Vitals not available:', error);
    });
  }

  /**
   * Handle Web Vitals metric
   */
  private onWebVital(metric: WebVitalsMetric): void {
    this.trackMetric({
      metric_name: `web_vitals_${metric.name.toLowerCase()}`,
      metric_value: metric.value,
      metric_unit: metric.name === 'CLS' ? 'score' : 'ms',
      context: {
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track custom performance metric
   */
  trackMetric(metric: Omit<PerformanceMetric, 'id'>): void {
    this.metricsBuffer.push(metric);

    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Track database performance
   */
  trackDatabasePerformance(metric: DatabasePerformanceMetric): void {
    this.trackMetric({
      metric_name: 'database_query_performance',
      metric_value: metric.execution_time_ms,
      metric_unit: 'ms',
      context: {
        query_type: metric.query_type,
        table_name: metric.table_name,
        rows_affected: metric.rows_affected,
        query_hash: metric.query_hash,
        success: metric.success,
        error_message: metric.error_message,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track API performance
   */
  trackAPIPerformance(metric: APIPerformanceMetric): void {
    this.trackMetric({
      metric_name: 'api_performance',
      metric_value: metric.response_time_ms,
      metric_unit: 'ms',
      context: {
        endpoint: metric.endpoint,
        method: metric.method,
        status_code: metric.status_code,
        request_size_bytes: metric.request_size_bytes,
        response_size_bytes: metric.response_size_bytes,
        error_message: metric.error_message,
      },
      user_id: metric.user_id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track page load performance
   */
  trackPageLoad(url: string, loadTime: number, additionalContext?: Record<string, any>): void {
    this.trackMetric({
      metric_name: 'page_load_time',
      metric_value: loadTime,
      metric_unit: 'ms',
      context: {
        url,
        ...additionalContext,
      },
      page_url: url,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, renderTime: number, props?: Record<string, any>): void {
    this.trackMetric({
      metric_name: 'component_render_time',
      metric_value: renderTime,
      metric_unit: 'ms',
      context: {
        component_name: componentName,
        props_count: props ? Object.keys(props).length : 0,
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track user interaction performance
   */
  trackUserInteraction(
    interactionType: string,
    duration: number,
    element?: string,
    additionalContext?: Record<string, any>
  ): void {
    this.trackMetric({
      metric_name: 'user_interaction_time',
      metric_value: duration,
      metric_unit: 'ms',
      context: {
        interaction_type: interactionType,
        element,
        ...additionalContext,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const memory = (performance as any).memory;
    if (!memory) return;

    this.trackMetric({
      metric_name: 'memory_usage',
      metric_value: memory.usedJSHeapSize,
      metric_unit: 'bytes',
      context: {
        total_heap_size: memory.totalJSHeapSize,
        heap_size_limit: memory.jsHeapSizeLimit,
        usage_percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track bundle size and loading performance
   */
  trackBundlePerformance(): void {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    // Track various loading metrics
    const metrics = {
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connection: navigation.connectEnd - navigation.connectStart,
      tls_handshake: navigation.secureConnectionStart > 0 
        ? navigation.connectEnd - navigation.secureConnectionStart 
        : 0,
      request_response: navigation.responseEnd - navigation.requestStart,
      dom_processing: navigation.domComplete - navigation.responseEnd,
      total_load_time: (() => {
        const navStart = (navigation as any).navigationStart !== undefined
          ? (navigation as any).navigationStart
          : navigation.startTime;
        return navigation.loadEventEnd - navStart;
      })(),
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.trackMetric({
        metric_name: `bundle_${name}`,
        metric_value: value,
        metric_unit: 'ms',
        context: {
          page_url: window.location.href,
          transfer_size: navigation.transferSize,
          encoded_body_size: navigation.encodedBodySize,
          decoded_body_size: navigation.decodedBodySize,
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Get performance insights
   */
  async getPerformanceInsights(timeRange: string = '24h'): Promise<{
    webVitals: Record<string, { average: number; p95: number; rating: string }>;
    apiPerformance: Record<string, { average: number; p95: number; errorRate: number }>;
    databasePerformance: Record<string, { average: number; p95: number; errorRate: number }>;
    pageLoadTimes: Record<string, { average: number; p95: number }>;
  }> {
    try {
      const { data: metrics, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', this.getTimeRangeStart(timeRange))
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return this.analyzeMetrics(metrics || []);
    } catch (error) {
      console.error('Error fetching performance insights:', error);
      throw error;
    }
  }

  /**
   * Flush metrics to database
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert(metricsToFlush);

      if (error) {
        console.error('Error flushing performance metrics:', error);
        // Re-add metrics to buffer for retry
        this.metricsBuffer.unshift(...metricsToFlush);
      }
    } catch (error) {
      console.error('Error flushing performance metrics:', error);
      // Re-add metrics to buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Start periodic metric flushing
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  /**
   * Stop monitoring and flush remaining metrics
   */
  async stop(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flushMetrics();
  }

  /**
   * Get time range start for queries
   */
  private getTimeRangeStart(range: string): string {
    const now = new Date();
    const ranges: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const offset = ranges[range] || ranges['24h'];
    return new Date(now.getTime() - offset).toISOString();
  }

  /**
   * Analyze metrics and generate insights
   */
  private analyzeMetrics(metrics: PerformanceMetric[]): any {
    const webVitals: Record<string, number[]> = {};
    const apiPerformance: Record<string, { times: number[]; errors: number; total: number }> = {};
    const databasePerformance: Record<string, { times: number[]; errors: number; total: number }> = {};
    const pageLoadTimes: Record<string, number[]> = {};

    metrics.forEach(metric => {
      switch (metric.metric_name) {
        case 'web_vitals_cls':
        case 'web_vitals_fid':
        case 'web_vitals_fcp':
        case 'web_vitals_lcp':
        case 'web_vitals_ttfb':
          if (!webVitals[metric.metric_name]) webVitals[metric.metric_name] = [];
          webVitals[metric.metric_name].push(metric.metric_value);
          break;

        case 'api_performance':
          const endpoint = metric.context.endpoint;
          if (!apiPerformance[endpoint]) {
            apiPerformance[endpoint] = { times: [], errors: 0, total: 0 };
          }
          apiPerformance[endpoint].times.push(metric.metric_value);
          apiPerformance[endpoint].total++;
          if (metric.context.status_code >= 400) {
            apiPerformance[endpoint].errors++;
          }
          break;

        case 'database_query_performance':
          const table = metric.context.table_name;
          if (!databasePerformance[table]) {
            databasePerformance[table] = { times: [], errors: 0, total: 0 };
          }
          databasePerformance[table].times.push(metric.metric_value);
          databasePerformance[table].total++;
          if (!metric.context.success) {
            databasePerformance[table].errors++;
          }
          break;

        case 'page_load_time':
          const url = metric.context.url;
          if (!pageLoadTimes[url]) pageLoadTimes[url] = [];
          pageLoadTimes[url].push(metric.metric_value);
          break;
      }
    });

    return {
      webVitals: this.calculateStats(webVitals),
      apiPerformance: this.calculatePerformanceStats(apiPerformance),
      databasePerformance: this.calculatePerformanceStats(databasePerformance),
      pageLoadTimes: this.calculateStats(pageLoadTimes),
    };
  }

  /**
   * Calculate statistics for metrics
   */
  private calculateStats(data: Record<string, number[]>): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(data).forEach(([key, values]) => {
      if (values.length === 0) return;

      values.sort((a, b) => a - b);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const p95Index = Math.floor(values.length * 0.95);
      const p95 = values[p95Index] || values[values.length - 1];

      result[key] = {
        average: Math.round(average * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        rating: this.getRating(key, average),
      };
    });

    return result;
  }

  /**
   * Calculate performance statistics with error rates
   */
  private calculatePerformanceStats(
    data: Record<string, { times: number[]; errors: number; total: number }>
  ): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(data).forEach(([key, stats]) => {
      if (stats.times.length === 0) return;

      stats.times.sort((a, b) => a - b);
      const average = stats.times.reduce((sum, val) => sum + val, 0) / stats.times.length;
      const p95Index = Math.floor(stats.times.length * 0.95);
      const p95 = stats.times[p95Index] || stats.times[stats.times.length - 1];
      const errorRate = (stats.errors / stats.total) * 100;

      result[key] = {
        average: Math.round(average * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
      };
    });

    return result;
  }

  /**
   * Get performance rating
   */
  private getRating(metricName: string, value: number): string {
    const thresholds: Record<string, { good: number; poor: number }> = {
      web_vitals_cls: { good: 0.1, poor: 0.25 },
      web_vitals_fid: { good: 100, poor: 300 },
      web_vitals_fcp: { good: 1800, poor: 3000 },
      web_vitals_lcp: { good: 2500, poor: 4000 },
      web_vitals_ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
