// Cost Monitor - Track API usage and prevent runaway costs

interface UsageEntry {
  timestamp: number;
  endpoint: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  cached?: boolean;
  ip?: string;
}

interface DailyCost {
  date: string;
  totalCost: number;
  totalRequests: number;
  cachedRequests: number;
  models: Record<string, number>;
}

// OpenAI Pricing (as of Feb 2026)
const PRICING = {
  // GPT-4.1-nano
  'gpt-4.1-nano': {
    input: 0.10 / 1_000_000, // $0.10 per 1M tokens
    output: 0.40 / 1_000_000, // $0.40 per 1M tokens
  },
  // Whisper
  'whisper-1': {
    perMinute: 0.006, // $0.006 per minute
  },
  // GPT-4o-mini-tts (token-based pricing)
  'gpt-4o-mini-tts': {
    perCharacter: 12 / 1_000_000, // $12 per 1M characters
  },
} as const;

class CostMonitor {
  private usage: UsageEntry[] = [];
  private readonly maxEntries = 10000; // Keep last 10k requests
  private readonly dailyCostLimit = 10; // $10 per day
  private readonly alertThreshold = 5; // Alert at $5

  /**
   * Track a request
   */
  track(entry: Omit<UsageEntry, 'timestamp' | 'cost'>): number {
    const cost = this.calculateCost(entry);

    const usageEntry: UsageEntry = {
      ...entry,
      timestamp: Date.now(),
      cost,
    };

    this.usage.push(usageEntry);

    // Trim old entries
    if (this.usage.length > this.maxEntries) {
      this.usage = this.usage.slice(-this.maxEntries);
    }

    // Check daily limit
    const dailyCost = this.getDailyCost();
    if (dailyCost.totalCost >= this.dailyCostLimit) {
      console.error(`🚨 DAILY COST LIMIT EXCEEDED: $${dailyCost.totalCost.toFixed(2)} (limit: $${this.dailyCostLimit})`);
    } else if (dailyCost.totalCost >= this.alertThreshold) {
      console.warn(`⚠️ COST ALERT: $${dailyCost.totalCost.toFixed(2)} today (alert threshold: $${this.alertThreshold})`);
    }

    console.log(`💰 Cost tracking: ${entry.endpoint} - $${cost.toFixed(4)} (daily: $${dailyCost.totalCost.toFixed(2)})`);

    return cost;
  }

  /**
   * Calculate cost for a request
   */
  private calculateCost(entry: Omit<UsageEntry, 'timestamp' | 'cost'>): number {
    // Cached requests are free
    if (entry.cached) {
      return 0;
    }

    let cost = 0;

    switch (entry.model) {
      case 'gpt-4.1-nano':
        cost =
          (entry.inputTokens * PRICING['gpt-4.1-nano'].input) +
          (entry.outputTokens * PRICING['gpt-4.1-nano'].output);
        break;

      case 'whisper-1':
        // Estimate based on input tokens (rough approximation)
        // Assume 1 token ≈ 0.75 words, 150 words/minute speaking
        const estimatedMinutes = (entry.inputTokens * 0.75) / 150;
        cost = estimatedMinutes * PRICING['whisper-1'].perMinute;
        break;

      case 'gpt-4o-mini-tts':
        // Output tokens represent characters for TTS
        cost = entry.outputTokens * PRICING['gpt-4o-mini-tts'].perCharacter;
        break;

      default:
        console.warn(`Unknown model: ${entry.model}`);
    }

    return cost;
  }

  /**
   * Get daily cost summary
   */
  getDailyCost(): DailyCost {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today).getTime();

    const todayUsage = this.usage.filter(entry => entry.timestamp >= todayStart);

    const totalCost = todayUsage.reduce((sum, entry) => sum + entry.cost, 0);
    const totalRequests = todayUsage.length;
    const cachedRequests = todayUsage.filter(entry => entry.cached).length;

    const models: Record<string, number> = {};
    for (const entry of todayUsage) {
      models[entry.model] = (models[entry.model] || 0) + entry.cost;
    }

    return {
      date: today,
      totalCost,
      totalRequests,
      cachedRequests,
      models,
    };
  }

  /**
   * Check if daily limit is exceeded
   */
  isOverDailyLimit(): boolean {
    const dailyCost = this.getDailyCost();
    return dailyCost.totalCost >= this.dailyCostLimit;
  }

  /**
   * Get usage statistics
   */
  getStats() {
    const dailyCost = this.getDailyCost();
    const hourlyUsage = this.getHourlyUsage();

    // Cost by model (all time)
    const modelCosts: Record<string, number> = {};
    for (const entry of this.usage) {
      modelCosts[entry.model] = (modelCosts[entry.model] || 0) + entry.cost;
    }

    // Top IPs by cost
    const ipCosts: Record<string, number> = {};
    for (const entry of this.usage) {
      if (entry.ip) {
        ipCosts[entry.ip] = (ipCosts[entry.ip] || 0) + entry.cost;
      }
    }

    const topIPs = Object.entries(ipCosts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, cost]) => ({ ip, cost }));

    return {
      daily: dailyCost,
      hourly: hourlyUsage,
      allTime: {
        totalCost: this.usage.reduce((sum, e) => sum + e.cost, 0),
        totalRequests: this.usage.length,
        cachedRequests: this.usage.filter(e => e.cached).length,
        modelCosts,
      },
      topIPs,
      limits: {
        dailyLimit: this.dailyCostLimit,
        alertThreshold: this.alertThreshold,
        overLimit: this.isOverDailyLimit(),
      },
    };
  }

  /**
   * Get hourly usage for the last 24 hours
   */
  private getHourlyUsage(): Array<{ hour: string; cost: number; requests: number }> {
    const now = Date.now();
    const hours: Array<{ hour: string; cost: number; requests: number }> = [];

    for (let i = 23; i >= 0; i--) {
      const hourStart = now - (i * 60 * 60 * 1000);
      const hourEnd = hourStart + (60 * 60 * 1000);
      const hourDate = new Date(hourStart);
      const hourLabel = `${hourDate.getHours().toString().padStart(2, '0')}:00`;

      const hourUsage = this.usage.filter(
        entry => entry.timestamp >= hourStart && entry.timestamp < hourEnd
      );

      const cost = hourUsage.reduce((sum, e) => sum + e.cost, 0);
      const requests = hourUsage.length;

      hours.push({
        hour: hourLabel,
        cost,
        requests,
      });
    }

    return hours;
  }

  /**
   * Get recent requests (for debugging)
   */
  getRecentRequests(limit: number = 20) {
    return this.usage
      .slice(-limit)
      .reverse()
      .map(entry => ({
        timestamp: new Date(entry.timestamp).toISOString(),
        endpoint: entry.endpoint,
        model: entry.model,
        cost: entry.cost,
        cached: entry.cached,
        ip: entry.ip,
      }));
  }

  /**
   * Reset usage data (admin function)
   */
  reset(): void {
    this.usage = [];
    console.log('🔄 Cost monitor reset');
  }
}

// Singleton instance
export const costMonitor = new CostMonitor();

/**
 * Helper to estimate Whisper cost from audio duration
 */
export function estimateWhisperCost(durationSeconds: number): number {
  const minutes = durationSeconds / 60;
  return minutes * PRICING['whisper-1'].perMinute;
}

/**
 * Helper to estimate GPT cost from token counts
 */
export function estimateGPTCost(inputTokens: number, outputTokens: number): number {
  return (
    inputTokens * PRICING['gpt-4.1-nano'].input +
    outputTokens * PRICING['gpt-4.1-nano'].output
  );
}

/**
 * Helper to estimate TTS cost from text length
 */
export function estimateTTSCost(textLength: number): number {
  return textLength * PRICING['gpt-4o-mini-tts'].perCharacter;
}
