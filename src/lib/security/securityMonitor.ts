/**
 * Security Monitoring System
 * Comprehensive security monitoring and threat detection for RateMyEmployer
 */

import { supabase } from '@/lib/supabaseClient';
import { headers } from 'next/headers';

interface SecurityEvent {
  id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  request_url?: string;
  request_method?: string;
  request_headers?: Record<string, string>;
  request_body?: any;
  response_status?: number;
  metadata: Record<string, any>;
  timestamp: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'block' | 'alert';
  enabled: boolean;
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  private securityRules: SecurityRule[] = [];
  private blockedIPs = new Set<string>();
  private suspiciousPatterns = [
    /(<script[^>]*>.*?<\/script>)/gi, // XSS attempts
    /(union\s+select|drop\s+table|insert\s+into)/gi, // SQL injection
    /(\.\.\/|\.\.\\)/g, // Path traversal
    /(<iframe|<object|<embed)/gi, // Malicious embeds
    /(eval\s*\(|setTimeout\s*\(|setInterval\s*\()/gi, // Code injection
  ];

  private constructor() {
    this.initializeSecurityRules();
    this.startCleanupTimer();
  }

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  /**
   * Initialize default security rules
   */
  private async initializeSecurityRules(): Promise<void> {
    try {
      const { data: rules } = await supabase
        .from('security_rules')
        .select('*')
        .eq('enabled', true);

      if (rules) {
        this.securityRules = rules;
      } else {
        // Create default rules if none exist
        await this.createDefaultSecurityRules();
      }
    } catch (error) {
      console.error('Error initializing security rules:', error);
    }
  }

  /**
   * Create default security rules
   */
  private async createDefaultSecurityRules(): Promise<void> {
    const defaultRules: Omit<SecurityRule, 'id'>[] = [
      {
        name: 'XSS Detection',
        description: 'Detect cross-site scripting attempts',
        pattern: '(<script[^>]*>.*?</script>)',
        severity: 'high',
        action: 'block',
        enabled: true,
      },
      {
        name: 'SQL Injection Detection',
        description: 'Detect SQL injection attempts',
        pattern: '(union\\s+select|drop\\s+table|insert\\s+into)',
        severity: 'critical',
        action: 'block',
        enabled: true,
      },
      {
        name: 'Path Traversal Detection',
        description: 'Detect path traversal attempts',
        pattern: '(\\.\\./|\\.\\.\\\\ )',
        severity: 'high',
        action: 'block',
        enabled: true,
      },
      {
        name: 'Excessive Request Rate',
        description: 'Detect potential DDoS or brute force attacks',
        pattern: 'rate_limit_exceeded',
        severity: 'medium',
        action: 'alert',
        enabled: true,
      },
    ];

    try {
      const { data } = await supabase
        .from('security_rules')
        .insert(defaultRules)
        .select();

      if (data) {
        this.securityRules = data;
      }
    } catch (error) {
      console.error('Error creating default security rules:', error);
    }
  }

  /**
   * Monitor incoming request for security threats
   */
  async monitorRequest(
    request: Request,
    userId?: string,
    additionalContext?: Record<string, any>
  ): Promise<{ allowed: boolean; reason?: string }> {
    const url = new URL(request.url);
    const method = request.method;
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = this.getClientIP(request);

    // Check if IP is blocked
    if (this.blockedIPs.has(ipAddress)) {
      await this.logSecurityEvent({
        event_type: 'blocked_ip_access',
        severity: 'high',
        description: `Blocked IP ${ipAddress} attempted access`,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        request_url: url.pathname,
        request_method: method,
        metadata: { ...additionalContext },
        timestamp: new Date().toISOString(),
      });

      return { allowed: false, reason: 'IP address blocked' };
    }

    // Check rate limits
    const rateLimitResult = await this.checkRateLimit(ipAddress, userId);
    if (!rateLimitResult.allowed) {
      await this.logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        severity: 'medium',
        description: `Rate limit exceeded for ${ipAddress}`,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        request_url: url.pathname,
        request_method: method,
        metadata: { 
          limit_type: rateLimitResult.limitType,
          ...additionalContext 
        },
        timestamp: new Date().toISOString(),
      });

      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    // Check for malicious patterns in URL and headers
    const maliciousCheck = await this.checkMaliciousPatterns(request, userId);
    if (!maliciousCheck.allowed) {
      return maliciousCheck;
    }

    // Check request body if present
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        const body = await request.clone().text();
        const bodyCheck = await this.checkRequestBody(body, request, userId);
        if (!bodyCheck.allowed) {
          return bodyCheck;
        }
      } catch (error) {
        // Body already consumed or invalid, continue
      }
    }

    return { allowed: true };
  }

  /**
   * Check for malicious patterns in request
   */
  private async checkMaliciousPatterns(
    request: Request,
    userId?: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = this.getClientIP(request);

    // Check URL for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(url.pathname) || pattern.test(url.search)) {
        await this.logSecurityEvent({
          event_type: 'malicious_pattern_detected',
          severity: 'high',
          description: `Malicious pattern detected in URL: ${pattern.source}`,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          request_url: url.pathname,
          request_method: request.method,
          metadata: { 
            pattern: pattern.source,
            matched_text: url.pathname + url.search 
          },
          timestamp: new Date().toISOString(),
        });

        return { allowed: false, reason: 'Malicious pattern detected' };
      }
    }

    // Check headers for suspicious content
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'referer'];
    for (const headerName of suspiciousHeaders) {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        for (const pattern of this.suspiciousPatterns) {
          if (pattern.test(headerValue)) {
            await this.logSecurityEvent({
              event_type: 'malicious_header_detected',
              severity: 'medium',
              description: `Malicious pattern detected in header ${headerName}`,
              user_id: userId,
              ip_address: ipAddress,
              user_agent: userAgent,
              request_url: url.pathname,
              request_method: request.method,
              metadata: { 
                header_name: headerName,
                pattern: pattern.source,
                matched_text: headerValue 
              },
              timestamp: new Date().toISOString(),
            });

            return { allowed: false, reason: 'Malicious header detected' };
          }
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Check request body for malicious content
   */
  private async checkRequestBody(
    body: string,
    request: Request,
    userId?: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const url = new URL(request.url);
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check for malicious patterns in body
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(body)) {
        await this.logSecurityEvent({
          event_type: 'malicious_payload_detected',
          severity: 'critical',
          description: `Malicious pattern detected in request body: ${pattern.source}`,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          request_url: url.pathname,
          request_method: request.method,
          request_body: body.substring(0, 1000), // Limit body size in logs
          metadata: { 
            pattern: pattern.source,
            body_size: body.length 
          },
          timestamp: new Date().toISOString(),
        });

        return { allowed: false, reason: 'Malicious payload detected' };
      }
    }

    // Check for excessively large payloads
    if (body.length > 1024 * 1024) { // 1MB limit
      await this.logSecurityEvent({
        event_type: 'large_payload_detected',
        severity: 'medium',
        description: `Excessively large payload detected: ${body.length} bytes`,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        request_url: url.pathname,
        request_method: request.method,
        metadata: { 
          payload_size: body.length,
          limit: 1024 * 1024 
        },
        timestamp: new Date().toISOString(),
      });

      return { allowed: false, reason: 'Payload too large' };
    }

    return { allowed: true };
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(
    ipAddress: string,
    userId?: string
  ): Promise<{ allowed: boolean; limitType?: string }> {
    const now = Date.now();

    // IP-based rate limiting
    const ipKey = `ip:${ipAddress}`;
    const ipLimit = this.getRateLimitConfig('ip');
    
    if (!this.checkLimit(ipKey, ipLimit, now)) {
      return { allowed: false, limitType: 'ip' };
    }

    // User-based rate limiting (if authenticated)
    if (userId) {
      const userKey = `user:${userId}`;
      const userLimit = this.getRateLimitConfig('user');
      
      if (!this.checkLimit(userKey, userLimit, now)) {
        return { allowed: false, limitType: 'user' };
      }
    }

    return { allowed: true };
  }

  /**
   * Check individual rate limit
   */
  private checkLimit(key: string, config: RateLimitConfig, now: number): boolean {
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (record.count >= config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Get rate limit configuration
   */
  private getRateLimitConfig(type: string): RateLimitConfig {
    const configs: Record<string, RateLimitConfig> = {
      ip: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000, // 1000 requests per 15 minutes per IP
      },
      user: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 2000, // 2000 requests per 15 minutes per user
      },
      api: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // 100 API calls per minute
      },
    };

    return configs[type] || configs.ip;
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await supabase
        .from('security_events')
        .insert(event);

      // If critical severity, also log to console for immediate attention
      if (event.severity === 'critical') {
        console.error('CRITICAL SECURITY EVENT:', event);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Block IP address
   */
  async blockIP(ipAddress: string, reason: string, duration?: number): Promise<void> {
    this.blockedIPs.add(ipAddress);

    await this.logSecurityEvent({
      event_type: 'ip_blocked',
      severity: 'high',
      description: `IP ${ipAddress} blocked: ${reason}`,
      ip_address: ipAddress,
      metadata: { 
        reason,
        duration: duration || 'permanent',
        blocked_at: new Date().toISOString() 
      },
      timestamp: new Date().toISOString(),
    });

    // If duration specified, unblock after timeout
    if (duration) {
      setTimeout(() => {
        this.blockedIPs.delete(ipAddress);
      }, duration);
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: Request): string {
    // Try various headers for IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Fallback to connection remote address
    return 'unknown';
  }

  /**
   * Get security dashboard data
   */
  async getSecurityDashboard(timeRange: string = '24h'): Promise<{
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    topThreats: Array<{ type: string; count: number }>;
    blockedIPs: number;
    rateLimitViolations: number;
  }> {
    try {
      const timeStart = this.getTimeRangeStart(timeRange);

      const { data: events } = await supabase
        .from('security_events')
        .select('event_type, severity')
        .gte('timestamp', timeStart);

      if (!events) {
        return {
          totalEvents: 0,
          eventsBySeverity: {},
          topThreats: [],
          blockedIPs: 0,
          rateLimitViolations: 0,
        };
      }

      const eventsBySeverity: Record<string, number> = {};
      const threatCounts: Record<string, number> = {};
      let rateLimitViolations = 0;

      events.forEach(event => {
        eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
        threatCounts[event.event_type] = (threatCounts[event.event_type] || 0) + 1;

        if (event.event_type === 'rate_limit_exceeded') {
          rateLimitViolations++;
        }
      });

      const topThreats = Object.entries(threatCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([type, count]) => ({ type, count }));

      return {
        totalEvents: events.length,
        eventsBySeverity,
        topThreats,
        blockedIPs: this.blockedIPs.size,
        rateLimitViolations,
      };
    } catch (error) {
      console.error('Error fetching security dashboard:', error);
      throw error;
    }
  }

  /**
   * Clean up expired rate limit records
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.rateLimitStore.entries()) {
        if (now > record.resetTime) {
          this.rateLimitStore.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Clean up every 5 minutes
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
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();
