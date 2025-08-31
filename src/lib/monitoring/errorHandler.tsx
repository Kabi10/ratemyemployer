/**
 * Comprehensive Error Handling and Logging System
 * Advanced error tracking, reporting, and recovery for RateMyEmployer
 */

import { supabase } from '@/lib/supabaseClient';
import * as React from 'react';

interface ErrorLog {
  id?: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
  component_name?: string;
  function_name?: string;
  line_number?: number;
  column_number?: number;
  source_map_url?: string;
  resolved: boolean;
  resolution_notes?: string;
  timestamp: string;
}

interface ErrorPattern {
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_resolve: boolean;
  notification_threshold: number;
}

interface ErrorMetrics {
  total_errors: number;
  errors_by_severity: Record<string, number>;
  errors_by_type: Record<string, number>;
  error_rate: number;
  resolution_rate: number;
  average_resolution_time: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorBuffer: ErrorLog[] = [];
  private bufferSize = 25;
  private flushInterval = 15000; // 15 seconds
  private flushTimer?: NodeJS.Timeout;
  private errorPatterns: ErrorPattern[] = [];
  private errorCounts = new Map<string, number>();

  private constructor() {
    this.initializeErrorPatterns();
    this.setupGlobalErrorHandlers();
    this.startPeriodicFlush();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Initialize error patterns for classification
   */
  private async initializeErrorPatterns(): Promise<void> {
    this.errorPatterns = [
      {
        pattern: 'ChunkLoadError|Loading chunk \\d+ failed',
        severity: 'medium',
        auto_resolve: true,
        notification_threshold: 10,
      },
      {
        pattern: 'Network request failed|fetch.*failed',
        severity: 'medium',
        auto_resolve: false,
        notification_threshold: 5,
      },
      {
        pattern: 'TypeError.*null|Cannot read prop.*undefined',
        severity: 'high',
        auto_resolve: false,
        notification_threshold: 3,
      },
      {
        pattern: 'ReferenceError|is not defined',
        severity: 'high',
        auto_resolve: false,
        notification_threshold: 1,
      },
      {
        pattern: 'SecurityError|Permission denied',
        severity: 'critical',
        auto_resolve: false,
        notification_threshold: 1,
      },
      {
        pattern: 'Database.*error|Supabase.*error',
        severity: 'critical',
        auto_resolve: false,
        notification_threshold: 1,
      },
    ];
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        type: 'javascript_error',
        filename: event.filename,
        line_number: event.lineno,
        column_number: event.colno,
        page_url: window.location.href,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: 'unhandled_promise_rejection',
        page_url: window.location.href,
      });
    });

    // Handle React error boundaries (if using React)
    if (typeof window !== 'undefined' && (window as any).React) {
      this.setupReactErrorBoundary();
    }
  }

  /**
   * Setup React error boundary integration
   */
  private setupReactErrorBoundary(): void {
    // This would be integrated with React Error Boundary components
    // For now, we'll just set up a global handler
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a React error
      if (args[0] && typeof args[0] === 'string' && args[0].includes('React')) {
        this.handleError(new Error(args[0]), {
          type: 'react_error',
          page_url: window.location.href,
          component_stack: args[1],
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * Handle and log errors
   */
  handleError(
    error: Error | string | any,
    context: Record<string, any> = {},
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Determine severity if not provided
      const determinedSeverity = severity || this.determineSeverity(errorMessage);
      
      // Create error log entry
      const errorLog: ErrorLog = {
        error_type: context.type || 'unknown_error',
        error_message: errorMessage,
        error_stack: errorStack,
        severity: determinedSeverity,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        },
        page_url: context.page_url || (typeof window !== 'undefined' ? window.location.href : undefined),
        component_name: context.component_name,
        function_name: context.function_name,
        line_number: context.line_number,
        column_number: context.column_number,
        resolved: false,
        timestamp: new Date().toISOString(),
      };

      // Add to buffer
      this.errorBuffer.push(errorLog);

      // Track error count for rate limiting notifications
      const errorKey = `${errorLog.error_type}:${errorMessage}`;
      const currentCount = this.errorCounts.get(errorKey) || 0;
      this.errorCounts.set(errorKey, currentCount + 1);

      // Check if we should send immediate notification
      this.checkNotificationThreshold(errorLog, currentCount + 1);

      // Flush if buffer is full
      if (this.errorBuffer.length >= this.bufferSize) {
        this.flushErrors();
      }

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', errorLog);
      }

    } catch (loggingError) {
      console.error('Error in error handler:', loggingError);
    }
  }

  /**
   * Determine error severity based on patterns
   */
  private determineSeverity(errorMessage: string): 'low' | 'medium' | 'high' | 'critical' {
    for (const pattern of this.errorPatterns) {
      if (new RegExp(pattern.pattern, 'i').test(errorMessage)) {
        return pattern.severity;
      }
    }

    // Default severity based on error type
    if (errorMessage.toLowerCase().includes('network')) return 'medium';
    if (errorMessage.toLowerCase().includes('permission')) return 'critical';
    if (errorMessage.toLowerCase().includes('security')) return 'critical';
    if (errorMessage.toLowerCase().includes('database')) return 'high';
    
    return 'medium';
  }

  /**
   * Check if error should trigger notification
   */
  private checkNotificationThreshold(errorLog: ErrorLog, count: number): void {
    const pattern = this.errorPatterns.find(p => 
      new RegExp(p.pattern, 'i').test(errorLog.error_message)
    );

    if (pattern && count >= pattern.notification_threshold) {
      this.sendErrorNotification(errorLog, count);
    }
  }

  /**
   * Send error notification (implement based on your notification system)
   */
  private async sendErrorNotification(errorLog: ErrorLog, count: number): Promise<void> {
    // This would integrate with your notification system (email, Slack, etc.)
    console.warn(`Error notification: ${errorLog.error_message} (occurred ${count} times)`);
    
    // You could implement email notifications, Slack webhooks, etc. here
    // For now, we'll just log to the database with a notification flag
    try {
      await supabase
        .from('error_notifications')
        .insert({
          error_type: errorLog.error_type,
          error_message: errorLog.error_message,
          severity: errorLog.severity,
          occurrence_count: count,
          notification_sent_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Failed to log error notification:', error);
    }
  }

  /**
   * Handle API errors specifically
   */
  handleAPIError(
    error: any,
    endpoint: string,
    method: string,
    statusCode?: number,
    requestData?: any
  ): void {
    this.handleError(error, {
      type: 'api_error',
      endpoint,
      method,
      status_code: statusCode,
      request_data: requestData,
    }, statusCode && statusCode >= 500 ? 'high' : 'medium');
  }

  /**
   * Handle database errors specifically
   */
  handleDatabaseError(
    error: any,
    operation: string,
    table?: string,
    query?: string
  ): void {
    this.handleError(error, {
      type: 'database_error',
      operation,
      table,
      query: query?.substring(0, 500), // Limit query length in logs
    }, 'high');
  }

  /**
   * Handle component errors specifically
   */
  handleComponentError(
    error: any,
    componentName: string,
    props?: Record<string, any>,
    state?: Record<string, any>
  ): void {
    this.handleError(error, {
      type: 'component_error',
      component_name: componentName,
      props: props ? Object.keys(props) : undefined, // Don't log actual prop values for privacy
      state: state ? Object.keys(state) : undefined,
    }, 'medium');
  }

  /**
   * Handle authentication errors specifically
   */
  handleAuthError(error: any, operation: string, userId?: string): void {
    this.handleError(error, {
      type: 'auth_error',
      operation,
      user_id: userId,
    }, 'high');
  }

  /**
   * Flush errors to database
   */
  private async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    const errorsToFlush = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      const { error } = await supabase
        .from('error_logs')
        .insert(errorsToFlush);

      if (error) {
        console.error('Error flushing error logs:', error);
        // Re-add errors to buffer for retry
        this.errorBuffer.unshift(...errorsToFlush);
      }
    } catch (error) {
      console.error('Error flushing error logs:', error);
      // Re-add errors to buffer for retry
      this.errorBuffer.unshift(...errorsToFlush);
    }
  }

  /**
   * Start periodic error flushing
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);
  }

  /**
   * Get error metrics and insights
   */
  async getErrorMetrics(timeRange: string = '24h'): Promise<ErrorMetrics> {
    try {
      const timeStart = this.getTimeRangeStart(timeRange);

      const { data: errors } = await supabase
        .from('error_logs')
        .select('error_type, severity, resolved, timestamp')
        .gte('timestamp', timeStart)
        .order('timestamp', { ascending: false });

      if (!errors || errors.length === 0) {
        return {
          total_errors: 0,
          errors_by_severity: {},
          errors_by_type: {},
          error_rate: 0,
          resolution_rate: 0,
          average_resolution_time: 0,
        };
      }

      const errorsBySeverity: Record<string, number> = {};
      const errorsByType: Record<string, number> = {};
      let resolvedCount = 0;

      errors.forEach(error => {
        errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
        errorsByType[error.error_type] = (errorsByType[error.error_type] || 0) + 1;
        if (error.resolved) resolvedCount++;
      });

      const totalErrors = errors.length;
      const resolutionRate = totalErrors > 0 ? (resolvedCount / totalErrors) * 100 : 0;

      // Calculate error rate (errors per hour)
      const timeRangeHours = this.getTimeRangeHours(timeRange);
      const errorRate = totalErrors / timeRangeHours;

      return {
        total_errors: totalErrors,
        errors_by_severity: errorsBySeverity,
        errors_by_type: errorsByType,
        error_rate: Math.round(errorRate * 100) / 100,
        resolution_rate: Math.round(resolutionRate * 100) / 100,
        average_resolution_time: 0, // Would need resolution timestamps to calculate
      };

    } catch (error) {
      console.error('Error fetching error metrics:', error);
      throw error;
    }
  }

  /**
   * Mark error as resolved
   */
  async resolveError(errorId: string, resolutionNotes?: string): Promise<void> {
    try {
      await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolution_notes: resolutionNotes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', errorId);
    } catch (error) {
      console.error('Error resolving error:', error);
      throw error;
    }
  }

  /**
   * Get recent errors for dashboard
   */
  async getRecentErrors(limit: number = 50): Promise<ErrorLog[]> {
    try {
      const { data: errors } = await supabase
        .from('error_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      return errors || [];
    } catch (error) {
      console.error('Error fetching recent errors:', error);
      throw error;
    }
  }

  /**
   * Stop error handler and flush remaining errors
   */
  async stop(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flushErrors();
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
   * Get time range in hours
   */
  private getTimeRangeHours(range: string): number {
    const ranges: Record<string, number> = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
    };

    return ranges[range] || 24;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export React Error Boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    errorHandler.handleComponentError(
      error,
      'ErrorBoundary',
      undefined,
      { componentStack: errorInfo.componentStack }
    );
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="error-boundary p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            We've been notified of this error and are working to fix it.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
