// KV-backed Rate Limiter for Edge Runtime
// Uses Cloudflare KV for persistent state across requests

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

export class KVRateLimiter {
  private kv: KVNamespace;
  private readonly minuteLimit: number = 10;
  private readonly hourLimit: number = 100;
  private readonly blockDuration: number = 60 * 60 * 1000;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async check(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    reason?: string;
  }> {
    const now = Date.now();
    const minuteKey = `ratelimit:${identifier}:minute`;
    const hourKey = `ratelimit:${identifier}:hour`;

    // Check if blocked
    const minuteEntry = await this.getEntry(minuteKey);
    if (minuteEntry?.blockedUntil && minuteEntry.blockedUntil > now) {
      const resetTime = minuteEntry.blockedUntil;
      const minutesRemaining = Math.ceil((resetTime - now) / 60000);
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        reason: `Rate limit exceeded. Try again in ${minutesRemaining} minutes.`,
      };
    }

    // Check minute limit
    const minuteResult = await this.checkLimit(minuteKey, this.minuteLimit, 60 * 1000, now);
    if (!minuteResult.allowed) {
      const blockedUntil = now + this.blockDuration;
      await this.setEntry(minuteKey, {
        ...minuteResult,
        blockedUntil,
      });
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockedUntil,
        reason: 'Rate limit exceeded. Blocked for 1 hour.',
      };
    }

    // Check hour limit
    const hourResult = await this.checkLimit(hourKey, this.hourLimit, 60 * 60 * 1000, now);
    if (!hourResult.allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: hourResult.resetTime,
        reason: 'Hourly limit exceeded. Try again later.',
      };
    }

    // Increment counters
    await this.increment(minuteKey, 60 * 1000, now);
    await this.increment(hourKey, 60 * 60 * 1000, now);

    return {
      allowed: true,
      remaining: Math.min(minuteResult.remaining, hourResult.remaining),
      resetTime: Math.min(minuteResult.resetTime, hourResult.resetTime),
    };
  }

  private async checkLimit(key: string, limit: number, window: number, now: number): Promise<RateLimitEntry & { allowed: boolean; remaining: number }> {
    const entry = await this.getEntry(key);

    if (!entry || entry.resetTime < now) {
      return {
        allowed: true,
        count: 0,
        resetTime: now + window,
        remaining: limit,
      };
    }

    const allowed = entry.count < limit;
    const remaining = Math.max(0, limit - entry.count);

    return {
      allowed,
      count: entry.count,
      resetTime: entry.resetTime,
      remaining,
    };
  }

  private async increment(key: string, window: number, now: number): Promise<void> {
    const entry = await this.getEntry(key);

    if (!entry || entry.resetTime < now) {
      await this.setEntry(key, {
        count: 1,
        resetTime: now + window,
      });
    } else {
      entry.count++;
      await this.setEntry(key, entry);
    }
  }

  private async getEntry(key: string): Promise<RateLimitEntry | null> {
    const value = await this.kv.get(key, 'json');
    return value as RateLimitEntry | null;
  }

  private async setEntry(key: string, entry: RateLimitEntry): Promise<void> {
    const ttl = Math.max(60, Math.ceil((entry.resetTime - Date.now()) / 1000));
    await this.kv.put(key, JSON.stringify(entry), { expirationTtl: ttl });
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}
