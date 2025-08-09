/**
 * Supabase Usage Monitoring and Cost Tracking
 * Implements comprehensive monitoring for database usage, bandwidth, and costs
 */

import { supabase } from './supabaseClient';
import type { Database } from '@/types/supabase';

export interface SupabaseUsageMetrics {
  databaseSize: number; // MB
  bandwidth: number; // GB
  storage: number; // GB
  activeUsers: number;
  apiRequests: number;
  timestamp: string;
}

export interface CostEstimate {
  current: number;
  projected: number;
  breakdown: {
    database: number;
    bandwidth: number;
    storage: number;
    compute: number;
  };
  freeTierStatus: {
    databaseUsage: number; // percentage
    bandwidthUsage: number; // percentage
    storageUsage: number; // percentage
    usersUsage: number; // percentage
  };
}

// Supabase Free Tier Limits
const FREE_TIER_LIMITS = {
  databaseSize: 500, // MB
  bandwidth: 5, // GB per month
  storage: 1, // GB
  activeUsers: 50000,
  apiRequests: Infinity // Unlimited
};

// Supabase Pro Pricing (as of 2024)
const PRICING = {
  proTier: 25, // $25/month base
  additionalBandwidth: 0.09, // $0.09 per GB
  additionalStorage: 0.021, // $0.021 per GB per month
  additionalCompute: 0.0034 // $0.0034 per hour
};

/**
 * Get current database size in MB
 */
export async function getDatabaseSize(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_database_size');
    
    if (error) {
      console.error('Error fetching database size:', error);
      return 0;
    }
    
    // Convert bytes to MB
    return Math.round((data || 0) / (1024 * 1024));
  } catch (error) {
    console.error('Error in getDatabaseSize:', error);
    return 0;
  }
}

/**
 * Estimate bandwidth usage based on API calls and data transfer
 */
export async function estimateBandwidthUsage(): Promise<number> {
  try {
    // Get recent API activity from logs
    const { data: recentActivity, error } = await supabase
      .from('error_logs')
      .select('created_at, metadata')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bandwidth data:', error);
      return 0;
    }

    // Estimate based on typical API response sizes
    const avgResponseSize = 2; // KB average response size
    const estimatedRequests = (recentActivity?.length || 0) * 10; // Extrapolate
    const bandwidthKB = estimatedRequests * avgResponseSize;
    
    return Math.round(bandwidthKB / (1024 * 1024)); // Convert to GB
  } catch (error) {
    console.error('Error in estimateBandwidthUsage:', error);
    return 0;
  }
}

/**
 * Get storage usage (file uploads, etc.)
 */
export async function getStorageUsage(): Promise<number> {
  try {
    // Since we don't have direct storage API access, estimate based on known usage
    // This would need to be implemented with actual storage bucket queries
    return 0.05; // Estimated 50 MB current usage
  } catch (error) {
    console.error('Error in getStorageUsage:', error);
    return 0;
  }
}

/**
 * Get active users count (last 30 days)
 */
export async function getActiveUsersCount(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('reviewer_id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching active users:', error);
      return 0;
    }

    // Count unique reviewers
    const uniqueUsers = new Set(data?.map(r => r.reviewer_id) || []);
    return uniqueUsers.size;
  } catch (error) {
    console.error('Error in getActiveUsersCount:', error);
    return 0;
  }
}

/**
 * Get comprehensive usage metrics
 */
export async function getSupabaseUsageMetrics(): Promise<SupabaseUsageMetrics> {
  const [databaseSize, bandwidth, storage, activeUsers] = await Promise.all([
    getDatabaseSize(),
    estimateBandwidthUsage(),
    getStorageUsage(),
    getActiveUsersCount()
  ]);

  return {
    databaseSize,
    bandwidth,
    storage,
    activeUsers,
    apiRequests: 0, // Would need to implement API request tracking
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate cost estimates based on usage
 */
export function calculateCostEstimate(metrics: SupabaseUsageMetrics): CostEstimate {
  const { databaseSize, bandwidth, storage, activeUsers } = metrics;

  // Check if we exceed free tier limits
  const exceedsDatabase = databaseSize > FREE_TIER_LIMITS.databaseSize;
  const exceedsBandwidth = bandwidth > FREE_TIER_LIMITS.bandwidth;
  const exceedsStorage = storage > FREE_TIER_LIMITS.storage;
  const exceedsUsers = activeUsers > FREE_TIER_LIMITS.activeUsers;

  let currentCost = 0;
  let projectedCost = 0;

  // If any limit is exceeded, we need Pro tier
  if (exceedsDatabase || exceedsBandwidth || exceedsStorage || exceedsUsers) {
    currentCost += PRICING.proTier;
    projectedCost += PRICING.proTier;
  }

  // Additional bandwidth costs
  if (exceedsBandwidth) {
    const additionalBandwidth = bandwidth - FREE_TIER_LIMITS.bandwidth;
    currentCost += additionalBandwidth * PRICING.additionalBandwidth;
  }

  // Additional storage costs
  if (exceedsStorage) {
    const additionalStorage = storage - FREE_TIER_LIMITS.storage;
    currentCost += additionalStorage * PRICING.additionalStorage;
  }

  // Project 6-month growth (conservative estimate)
  const growthMultiplier = 1.5;
  const projectedDatabase = databaseSize * growthMultiplier;
  const projectedBandwidth = bandwidth * growthMultiplier;
  const projectedStorage = storage * growthMultiplier;

  if (projectedDatabase > FREE_TIER_LIMITS.databaseSize ||
      projectedBandwidth > FREE_TIER_LIMITS.bandwidth ||
      projectedStorage > FREE_TIER_LIMITS.storage) {
    projectedCost = PRICING.proTier;
    
    if (projectedBandwidth > FREE_TIER_LIMITS.bandwidth) {
      projectedCost += (projectedBandwidth - FREE_TIER_LIMITS.bandwidth) * PRICING.additionalBandwidth;
    }
    
    if (projectedStorage > FREE_TIER_LIMITS.storage) {
      projectedCost += (projectedStorage - FREE_TIER_LIMITS.storage) * PRICING.additionalStorage;
    }
  }

  return {
    current: Math.round(currentCost * 100) / 100,
    projected: Math.round(projectedCost * 100) / 100,
    breakdown: {
      database: exceedsDatabase ? PRICING.proTier : 0,
      bandwidth: exceedsBandwidth ? (bandwidth - FREE_TIER_LIMITS.bandwidth) * PRICING.additionalBandwidth : 0,
      storage: exceedsStorage ? (storage - FREE_TIER_LIMITS.storage) * PRICING.additionalStorage : 0,
      compute: 0 // Not using Edge Functions currently
    },
    freeTierStatus: {
      databaseUsage: Math.round((databaseSize / FREE_TIER_LIMITS.databaseSize) * 100),
      bandwidthUsage: Math.round((bandwidth / FREE_TIER_LIMITS.bandwidth) * 100),
      storageUsage: Math.round((storage / FREE_TIER_LIMITS.storage) * 100),
      usersUsage: Math.round((activeUsers / FREE_TIER_LIMITS.activeUsers) * 100)
    }
  };
}

/**
 * Check if usage is approaching free tier limits
 */
export function checkUsageAlerts(metrics: SupabaseUsageMetrics): string[] {
  const alerts: string[] = [];
  const { databaseSize, bandwidth, storage, activeUsers } = metrics;

  // 80% threshold warnings
  if (databaseSize > FREE_TIER_LIMITS.databaseSize * 0.8) {
    alerts.push(`Database size approaching limit: ${databaseSize}MB / ${FREE_TIER_LIMITS.databaseSize}MB`);
  }

  if (bandwidth > FREE_TIER_LIMITS.bandwidth * 0.8) {
    alerts.push(`Bandwidth approaching limit: ${bandwidth}GB / ${FREE_TIER_LIMITS.bandwidth}GB`);
  }

  if (storage > FREE_TIER_LIMITS.storage * 0.8) {
    alerts.push(`Storage approaching limit: ${storage}GB / ${FREE_TIER_LIMITS.storage}GB`);
  }

  if (activeUsers > FREE_TIER_LIMITS.activeUsers * 0.8) {
    alerts.push(`Active users approaching limit: ${activeUsers} / ${FREE_TIER_LIMITS.activeUsers}`);
  }

  return alerts;
}

/**
 * Log usage metrics to database for historical tracking
 */
export async function logUsageMetrics(metrics: SupabaseUsageMetrics): Promise<void> {
  try {
    const { error } = await supabase
      .from('usage_logs')
      .insert({
        database_size_mb: metrics.databaseSize,
        bandwidth_gb: metrics.bandwidth,
        storage_gb: metrics.storage,
        active_users: metrics.activeUsers,
        api_requests: metrics.apiRequests,
        recorded_at: metrics.timestamp
      });

    if (error) {
      console.error('Error logging usage metrics:', error);
    }
  } catch (error) {
    console.error('Error in logUsageMetrics:', error);
  }
}

/**
 * Get usage trends over time
 */
export async function getUsageTrends(days: number = 30): Promise<SupabaseUsageMetrics[]> {
  try {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Error fetching usage trends:', error);
      return [];
    }

    return (data || []).map(row => ({
      databaseSize: row.database_size_mb,
      bandwidth: row.bandwidth_gb,
      storage: row.storage_gb,
      activeUsers: row.active_users,
      apiRequests: row.api_requests,
      timestamp: row.recorded_at
    }));
  } catch (error) {
    console.error('Error in getUsageTrends:', error);
    return [];
  }
}

/**
 * Optimize database queries for better performance
 */
export const optimizedQueries = {
  // Optimized company queries with proper indexing
  getCompaniesWithStats: async (limit: number = 20) => {
    return supabase
      .from('companies')
      .select(`
        id,
        name,
        industry,
        location,
        average_rating,
        total_reviews,
        created_at
      `)
      .order('total_reviews', { ascending: false })
      .limit(limit);
  },

  // Optimized review queries
  getRecentReviews: async (limit: number = 10) => {
    return supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        created_at,
        companies!inner(name, industry)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  // Optimized analytics queries
  getAnalyticsData: async () => {
    return supabase.rpc('get_comprehensive_analytics');
  }
};

/**
 * Database maintenance functions
 */
export const maintenanceTasks = {
  // Clean up old error logs
  cleanupErrorLogs: async (daysToKeep: number = 30) => {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    return supabase
      .from('error_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());
  },

  // Vacuum analyze for performance
  optimizeDatabase: async () => {
    return supabase.rpc('optimize_database_performance');
  },

  // Update statistics
  updateTableStatistics: async () => {
    return supabase.rpc('update_table_statistics');
  }
};
