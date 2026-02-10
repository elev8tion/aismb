// KV-backed Cost Monitor for Edge Runtime

import { MODELS, MODEL_COSTS } from '@/lib/openai/config';

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
      console.error(`DAILY COST LIMIT EXCEEDED: $${(dailyTotal + cost).toFixed(2)}`);
    } else if (dailyTotal + cost >= this.alertThreshold) {
      console.warn(`COST ALERT: $${(dailyTotal + cost).toFixed(2)}`);
    }

    return cost;
  }

  private calculateCost(entry: Omit<UsageEntry, 'timestamp' | 'cost'>): number {
    if (entry.cached) return 0;

    const chatCost = MODEL_COSTS[MODELS.chat];
    const ttsCost = MODEL_COSTS[MODELS.tts];
    const whisperCost = MODEL_COSTS[MODELS.transcription];

    switch (entry.model) {
      case MODELS.chat:
        return (entry.inputTokens * chatCost.input) +
               (entry.outputTokens * chatCost.output);
      case MODELS.transcription: {
        const estimatedMinutes = (entry.inputTokens * 0.75) / 150;
        return estimatedMinutes * whisperCost.perMinute;
      }
      case MODELS.tts:
        return (entry.inputTokens * ttsCost.input) +
               (entry.outputTokens * ttsCost.output);
      default:
        return 0;
    }
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
  return minutes * MODEL_COSTS[MODELS.transcription].perMinute;
}

export function estimateChatCost(inputTokens: number, outputTokens: number): number {
  const cost = MODEL_COSTS[MODELS.chat];
  return (inputTokens * cost.input) + (outputTokens * cost.output);
}

export function estimateTTSCost(inputTokens: number, outputTokens: number): number {
  const cost = MODEL_COSTS[MODELS.tts];
  return (inputTokens * cost.input) + (outputTokens * cost.output);
}
