interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  lastReset: Date;
  rateLimitHits: number;
  activeConnections: number;
}

interface RequestLog {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private recentRequests: RequestLog[] = [];
  private maxLogSize = 1000; // Keep last 1000 requests
  
  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      lastReset: new Date(),
      rateLimitHits: 0,
      activeConnections: 0,
    };
  }

  /**
   * Log a request and update metrics
   */
  logRequest(log: RequestLog): void {
    this.metrics.requestCount++;
    
    if (log.statusCode >= 400) {
      this.metrics.errorCount++;
    }
    
    if (log.statusCode === 429) {
      this.metrics.rateLimitHits++;
    }
    
    // Update average response time
    const totalTime = this.metrics.avgResponseTime * (this.metrics.requestCount - 1);
    this.metrics.avgResponseTime = (totalTime + log.responseTime) / this.metrics.requestCount;
    
    // Add to recent requests (keep only the most recent)
    this.recentRequests.push(log);
    if (this.recentRequests.length > this.maxLogSize) {
      this.recentRequests.shift();
    }
    
    // Log interesting events
    if (log.statusCode >= 500) {
      console.error('Server Error:', {
        path: log.path,
        statusCode: log.statusCode,
        responseTime: log.responseTime,
        ip: log.ip,
        userAgent: log.userAgent,
      });
    } else if (log.responseTime > 5000) {
      console.warn('Slow Request:', {
        path: log.path,
        responseTime: log.responseTime,
        ip: log.ip,
      });
    }
  }

  /**
   * Track active connections
   */
  incrementConnections(): void {
    this.metrics.activeConnections++;
  }

  decrementConnections(): void {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get recent requests (for debugging)
   */
  getRecentRequests(limit: number = 100): RequestLog[] {
    return this.recentRequests.slice(-limit);
  }

  /**
   * Get error rate as percentage
   */
  getErrorRate(): number {
    if (this.metrics.requestCount === 0) return 0;
    return (this.metrics.errorCount / this.metrics.requestCount) * 100;
  }

  /**
   * Get requests per minute (approximate)
   */
  getRequestsPerMinute(): number {
    const minutesSinceReset = (Date.now() - this.metrics.lastReset.getTime()) / (1000 * 60);
    if (minutesSinceReset === 0) return 0;
    return this.metrics.requestCount / minutesSinceReset;
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: PerformanceMetrics;
  } {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check error rate
    const errorRate = this.getErrorRate();
    if (errorRate > 10) {
      issues.push(`High error rate: ${errorRate.toFixed(2)}%`);
      status = 'critical';
    } else if (errorRate > 5) {
      issues.push(`Elevated error rate: ${errorRate.toFixed(2)}%`);
      status = 'warning';
    }

    // Check average response time
    if (this.metrics.avgResponseTime > 5000) {
      issues.push(`High response time: ${this.metrics.avgResponseTime.toFixed(0)}ms`);
      status = 'critical';
    } else if (this.metrics.avgResponseTime > 2000) {
      issues.push(`Elevated response time: ${this.metrics.avgResponseTime.toFixed(0)}ms`);
      if (status === 'healthy') status = 'warning';
    }

    // Check rate limit hits
    const rateLimitRate = this.metrics.requestCount > 0 
      ? (this.metrics.rateLimitHits / this.metrics.requestCount) * 100 
      : 0;
    if (rateLimitRate > 20) {
      issues.push(`High rate limit hits: ${rateLimitRate.toFixed(2)}%`);
      if (status === 'healthy') status = 'warning';
    }

    return {
      status,
      issues,
      metrics: this.getMetrics(),
    };
  }

  /**
   * Reset metrics (useful for periodic resets)
   */
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      lastReset: new Date(),
      rateLimitHits: 0,
      activeConnections: this.metrics.activeConnections, // Keep active connections
    };
    // Clear old request logs
    this.recentRequests = this.recentRequests.slice(-100); // Keep last 100
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const health = this.getHealthStatus();
    const rpm = this.getRequestsPerMinute();
    
    return `
Performance Report - ${new Date().toISOString()}
=================================================
Status: ${health.status.toUpperCase()} ${health.status === 'healthy' ? 'OK' : health.status === 'warning' ? 'WARNING' : 'ERROR'}

Metrics:
- Total Requests: ${this.metrics.requestCount}
- Error Rate: ${this.getErrorRate().toFixed(2)}%
- Avg Response Time: ${this.metrics.avgResponseTime.toFixed(0)}ms
- Requests/Minute: ${rpm.toFixed(1)}
- Rate Limit Hits: ${this.metrics.rateLimitHits}
- Active Connections: ${this.metrics.activeConnections}

${health.issues.length > 0 ? '\nIssues:\n' + health.issues.map(issue => `- ${issue}`).join('\n') : ''}

Recent Activity:
${this.recentRequests.slice(-5).map(req => 
  `- ${req.method} ${req.path} [${req.statusCode}] ${req.responseTime}ms`
).join('\n')}
    `.trim();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetrics, RequestLog };
