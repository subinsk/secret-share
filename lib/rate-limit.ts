import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (for development)
// In production, use Redis or another persistent store
class MemoryStore {
  private hits: Map<string, { count: number; resetTime: number }> = new Map();

  async increment(key: string): Promise<{ totalHits: number; timeUntilReset?: number }> {
    const now = Date.now();
    const hit = this.hits.get(key);
    
    if (!hit || now > hit.resetTime) {
      // First hit or window expired
      this.hits.set(key, { count: 1, resetTime: now + 60 * 1000 }); // 1 minute window
      return { totalHits: 1 };
    }
    
    hit.count++;
    this.hits.set(key, hit);
    
    return {
      totalHits: hit.count,
      timeUntilReset: Math.max(0, hit.resetTime - now)
    };
  }

  async decrement(key: string): Promise<void> {
    const hit = this.hits.get(key);
    if (hit && hit.count > 0) {
      hit.count--;
      if (hit.count === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, hit);
      }
    }
  }

  async resetKey(key: string): Promise<void> {
    this.hits.delete(key);
  }
}

const store = new MemoryStore();

// Rate limit configurations
export const rateLimitConfigs = {
  // General API rate limit
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },
  
  // Secret creation rate limit
  createSecret: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 secret creations per minute
    message: 'Too many secrets created from this IP, please try again later.',
  },
  
  // Secret access rate limit
  accessSecret: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 secret accesses per minute
    message: 'Too many secret access attempts from this IP, please try again later.',
  },
  
  // Authentication rate limit
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth attempts per windowMs
    message: 'Too many authentication attempts from this IP, please try again later.',
  },
};

export function createRateLimiter(config: typeof rateLimitConfigs.api) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = getClientIP(request);
    const key = `rate_limit:${ip}`;
    
    try {
      const result = await store.increment(key);
      
      if (result.totalHits > config.max) {
        return new NextResponse(
          JSON.stringify({
            error: config.message,
            retryAfter: Math.ceil((result.timeUntilReset || 0) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((result.timeUntilReset || 0) / 1000).toString(),
              'X-RateLimit-Limit': config.max.toString(),
              'X-RateLimit-Remaining': Math.max(0, config.max - result.totalHits).toString(),
              'X-RateLimit-Reset': new Date(Date.now() + (result.timeUntilReset || 0)).toISOString(),
            },
          }
        );
      }
      
      return null; // No rate limit exceeded
    } catch (error) {
      console.error('Rate limiting error:', error);
      return null; // Allow request on error
    }
  };
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

// Middleware function to apply rate limiting
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: typeof rateLimitConfigs.api
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await createRateLimiter(config)(request);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(request);
  };
}

// User-based rate limiting (requires authentication)
export async function checkUserRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 50,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `user_rate_limit:${userId}:${action}`;
  
  try {
    const result = await store.increment(key);
    
    if (result.totalHits > maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((result.timeUntilReset || 0) / 1000),
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('User rate limiting error:', error);
    return { allowed: true }; // Allow on error
  }
}
