// Rate Limiter - Protect against API abuse
// In-memory implementation (production should use Redis)

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private readonly minuteLimit: number = 10; // 10 requests per minute
  private readonly hourLimit: number = 100; // 100 requests per hour
  private readonly blockDuration: number = 60 * 60 * 1000; // 1 hour block

  constructor() {
    this.limits = new Map();

    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    reason?: string;
  } {
    const now = Date.now();
    const minuteKey = `${identifier}:minute`;
    const hourKey = `${identifier}:hour`;

    // Check if blocked
    const minuteEntry = this.limits.get(minuteKey);
    if (minuteEntry?.blockedUntil && minuteEntry.blockedUntil > now) {
      const resetTime = minuteEntry.blockedUntil;
      const minutesRemaining = Math.ceil((resetTime - now) / 60000);

      console.log(`🚫 BLOCKED: ${identifier} - ${minutesRemaining} minutes remaining`);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        reason: `Rate limit exceeded. Try again in ${minutesRemaining} minutes.`,
      };
    }

    // Check minute limit
    const minuteResult = this.checkLimit(minuteKey, this.minuteLimit, 60 * 1000);
    if (!minuteResult.allowed) {
      // Block for 1 hour on minute limit exceed
      const blockedUntil = now + this.blockDuration;
      this.limits.set(minuteKey, {
        ...minuteResult,
        blockedUntil,
      });

      console.log(`🚫 RATE LIMIT EXCEEDED: ${identifier} - Blocked for 1 hour`);

      return {
        allowed: false,
        remaining: 0,
        resetTime: blockedUntil,
        reason: 'Rate limit exceeded. Blocked for 1 hour.',
      };
    }

    // Check hour limit
    const hourResult = this.checkLimit(hourKey, this.hourLimit, 60 * 60 * 1000);
    if (!hourResult.allowed) {
      console.log(`🚫 HOURLY LIMIT EXCEEDED: ${identifier}`);

      return {
        allowed: false,
        remaining: 0,
        resetTime: hourResult.resetTime,
        reason: 'Hourly limit exceeded. Try again later.',
      };
    }

    // Increment counters
    this.increment(minuteKey, 60 * 1000);
    this.increment(hourKey, 60 * 60 * 1000);

    console.log(`✅ Rate limit OK: ${identifier} (${minuteResult.remaining}/min, ${hourResult.remaining}/hour remaining)`);

    return {
      allowed: true,
      remaining: Math.min(minuteResult.remaining, hourResult.remaining),
      resetTime: Math.min(minuteResult.resetTime, hourResult.resetTime),
    };
  }

  /**
   * Check limit for a specific key
   */
  private checkLimit(key: string, limit: number, window: number): RateLimitEntry & { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    // No entry or expired - allow
    if (!entry || entry.resetTime < now) {
      return {
        allowed: true,
        count: 0,
        resetTime: now + window,
        remaining: limit,
      };
    }

    // Check if under limit
    const allowed = entry.count < limit;
    const remaining = Math.max(0, limit - entry.count);

    return {
      allowed,
      count: entry.count,
      resetTime: entry.resetTime,
      remaining,
    };
  }

  /**
   * Increment counter for a key
   */
  private increment(key: string, window: number): void {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || entry.resetTime < now) {
      // New or expired entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + window,
      });
    } else {
      // Increment existing
      entry.count++;
      this.limits.set(key, entry);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.limits.entries()) {
      // Remove if expired and not blocked
      if (entry.resetTime < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
        this.limits.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Rate limiter cleanup: Removed ${cleaned} expired entries`);
    }
  }

  /**
   * Get stats for monitoring
   */
  getStats() {
    const now = Date.now();
    const active = Array.from(this.limits.entries())
      .filter(([_, entry]) => entry.resetTime > now)
      .map(([key, entry]) => ({
        identifier: key.split(':')[0],
        type: key.split(':')[1],
        count: entry.count,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
        blocked: entry.blockedUntil ? entry.blockedUntil > now : false,
      }));

    return {
      totalEntries: this.limits.size,
      activeEntries: active.length,
      blockedEntries: active.filter(e => e.blocked).length,
      entries: active,
    };
  }

  /**
   * Manually unblock an identifier (admin function)
   */
  unblock(identifier: string): void {
    const minuteKey = `${identifier}:minute`;
    const hourKey = `${identifier}:hour`;

    this.limits.delete(minuteKey);
    this.limits.delete(hourKey);

    console.log(`🔓 UNBLOCKED: ${identifier}`);
  }

  /**
   * Reset all limits (admin function)
   */
  reset(): void {
    this.limits.clear();
    console.log(`🔄 Rate limiter reset - All limits cleared`);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Try various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default (shouldn't happen in production)
  return 'unknown';
}
