/**
 * Feature flags for controlling application features
 * This allows us to enable/disable features based on environment or user role
 */

export interface FeatureFlags {
  mcpDemo: boolean;
  enhancedAnalytics: boolean;
  betaFeatures: boolean;
}

/**
 * Get feature flags based on environment and user role
 */
export function getFeatureFlags(userRole?: string): FeatureFlags {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isAdmin = userRole === 'admin';
  
  return {
    // MCP Demo is only available in development or for admins
    mcpDemo: isDevelopment || isAdmin,
    
    // Enhanced analytics powered by MCP
    enhancedAnalytics: true,
    
    // Beta features for testing
    betaFeatures: isDevelopment,
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags, userRole?: string): boolean {
  const flags = getFeatureFlags(userRole);
  return flags[feature];
}
