import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface MCPQueryOptions {
  enabled?: boolean;
  refreshInterval?: number;
  retryCount?: number;
  retryDelay?: number;
}

export interface MCPQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for MCP-powered database queries
 * Provides transparent integration with Model Context Protocol stored procedures
 */
export function useMCPQuery<T = any>(
  procedure: string,
  params?: Record<string, any>,
  options: MCPQueryOptions = {}
): MCPQueryResult<T> {
  const {
    enabled = true,
    refreshInterval,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithRetry = useCallback(async (
    operation: () => Promise<void>,
    maxRetries: number = retryCount
  ): Promise<void> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await operation();
        return;
      } catch (err) {
        if (i === maxRetries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }, [retryCount, retryDelay]);

  const handleError = useCallback((error: unknown, operation: string) => {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    setError(`Failed to ${operation}. Please try again.`);
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error ${operation}:`, error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await fetchWithRetry(async () => {
        const { data: result, error: queryError } = await supabase.rpc(procedure, params);
        
        if (queryError) throw queryError;
        setData(result);
      });
    } catch (err) {
      handleError(err, `execute ${procedure}`);
    } finally {
      setLoading(false);
    }
  }, [procedure, params, enabled, fetchWithRetry, handleError]);

  useEffect(() => {
    fetchData();
    
    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for MCP queries with fallback to direct Supabase queries
 * Useful for gradual migration from direct queries to MCP
 */
export function useMCPQueryWithFallback<T = any>(
  procedure: string,
  fallbackQuery: () => Promise<{ data: T | null; error: any }>,
  params?: Record<string, any>,
  options: MCPQueryOptions = {}
): MCPQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try MCP first
      const { data: mcpResult, error: mcpError } = await supabase.rpc(procedure, params);
      
      if (mcpError) {
        // Fall back to direct query
        console.warn(`MCP procedure ${procedure} failed, using fallback:`, mcpError);
        const { data: fallbackResult, error: fallbackError } = await fallbackQuery();
        
        if (fallbackError) throw fallbackError;
        setData(fallbackResult);
      } else {
        setData(mcpResult);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Query failed';
      setError(message);
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error in ${procedure} with fallback:`, err);
      }
    } finally {
      setLoading(false);
    }
  }, [procedure, params, fallbackQuery, options.enabled]);

  useEffect(() => {
    fetchData();
    
    if (options.refreshInterval && options.enabled) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refreshInterval, options.enabled]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Specialized hook for industry statistics with MCP enhancement
 */
export function useIndustryStatistics(options: MCPQueryOptions = {}) {
  return useMCPQueryWithFallback(
    'get_industry_statistics',
    async () => {
      // Fallback to TypeScript statistics module
      const { getIndustryStatistics } = await import('@/lib/statistics');
      const data = await getIndustryStatistics();
      return { data, error: null };
    },
    undefined,
    { enabled: true, ...options }
  );
}

/**
 * Specialized hook for location statistics with MCP enhancement
 */
export function useLocationStatistics(options: MCPQueryOptions = {}) {
  return useMCPQueryWithFallback(
    'get_location_statistics',
    async () => {
      // Fallback to TypeScript statistics module
      const { getLocationStatistics } = await import('@/lib/statistics');
      const data = await getLocationStatistics();
      return { data, error: null };
    },
    undefined,
    { enabled: true, ...options }
  );
}
