// KV-backed Cost Monitor for Edge Runtime

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

const PRICING = {
  'gpt-4o-mini': {
    input: 0.15 / 1_000_000,
    output: 0.60 / 1_000_000,
  },
  'whisper-1': {
    perMinute: 0.006,
  },
  'tts-1': {
    perCharacter: 15 / 1_000_000,
  },
} as const;

export class KVCostMonitor {
  private kv: KVNamespace;
  private readonly dailyCostLimit = 10;
  private readonly alertThreshold = 5;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async track(entry: Omit<UsageEntry, 'timestamp' | 'cost'>): Promise<number> {
    const cost = this.calculateCost(entry);
    const usageEntry: UsageEntry = {
      ...entry,
      timestamp: Date.now(),
      cost,
    };

    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `cost:daily:${today}`;
    const entryKey = `cost:entry:${Date.now()}:${Math.random()}`;

    // Store entry with 48 hour TTL
    await this.kv.put(entryKey, JSON.stringify(usageEntry), { expirationTtl: 172800 });

    // Update daily total
    const dailyTotal = await this.getDailyCost();
    await this.kv.put(dailyKey, JSON.stringify(dailyTotal + cost), { expirationTtl: 172800 });

    if (dailyTotal + cost >= this.dailyCostLimit) {
      console.error(`🚨 DAILY COST LIMIT EXCEEDED: $${(dailyTotal + cost).toFixed(2)}`);
    } else if (dailyTotal + cost >= this.alertThreshold) {
      console.warn(`⚠️ COST ALERT: $${(dailyTotal + cost).toFixed(2)}`);
    }

    return cost;
  }

  private calculateCost(entry: Omit<UsageEntry, 'timestamp' | 'cost'>): number {
    if (entry.cached) return 0;

    let cost = 0;
    switch (entry.model) {
      case 'gpt-4o-mini':
        cost = (entry.inputTokens * PRICING['gpt-4o-mini'].input) +
               (entry.outputTokens * PRICING['gpt-4o-mini'].output);
        break;
      case 'whisper-1':
        const estimatedMinutes = (entry.inputTokens * 0.75) / 150;
        cost = estimatedMinutes * PRICING['whisper-1'].perMinute;
        break;
      case 'tts-1':
        cost = entry.outputTokens * PRICING['tts-1'].perCharacter;
        break;
    }
    return cost;
  }

  async getDailyCost(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `cost:daily:${today}`;
    const value = await this.kv.get(dailyKey, 'json');
    return (value as number) || 0;
  }

  async isOverDailyLimit(): Promise<boolean> {
    const dailyCost = await this.getDailyCost();
    return dailyCost >= this.dailyCostLimit;
  }
}

export function estimateWhisperCost(durationSeconds: number): number {
  const minutes = durationSeconds / 60;
  return minutes * PRICING['whisper-1'].perMinute;
}

export function estimateGPTCost(inputTokens: number, outputTokens: number): number {
  return (
    inputTokens * PRICING['gpt-4o-mini'].input +
    outputTokens * PRICING['gpt-4o-mini'].output
  );
}

export function estimateTTSCost(textLength: number): number {
  return textLength * PRICING['tts-1'].perCharacter;
}
