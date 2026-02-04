// KV-backed Response Cache for Edge Runtime

export class KVResponseCache {
  private kv: KVNamespace;
  private readonly TTL: number = 60 * 60 * 24; // 24 hours in seconds

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  private normalizeQuestion(question: string): string | null {
    const q = question.toLowerCase().trim();

    if (q.includes('pricing') || q.includes('how much') || q.includes('cost') || q.includes('price')) {
      return 'pricing';
    }
    if (q.includes('do you work with') || q.includes('work with my industry')) {
      return 'industry';
    }
    if ((q.includes('chatgpt') || q.includes('chat gpt')) && (q.includes('different') || q.includes('compare'))) {
      return 'chatgpt-comparison';
    }
    if ((q.includes('technical') || q.includes('coding')) && (q.includes('need') || q.includes('required'))) {
      return 'technical-skills';
    }
    if ((q.includes('difference') || q.includes('compare')) && (q.includes('tier') || q.includes('plan'))) {
      return 'tier-differences';
    }
    if ((q.includes('how long') || q.includes('when')) && (q.includes('result') || q.includes('see'))) {
      return 'results-timeline';
    }
    if ((q.includes('after') && q.includes('term')) || q.includes('what happens when')) {
      return 'after-term';
    }
    if (q.includes('upgrade')) {
      return 'upgrade-path';
    }
    if ((q.includes('mistake') || q.includes('error')) && q.includes('ai')) {
      return 'error-handling';
    }
    if ((q.includes('data') || q.includes('information')) && (q.includes('stored') || q.includes('privacy'))) {
      return 'data-storage';
    }

    return null;
  }

  async get(question: string): Promise<{ textResponse: string; audioBuffer?: Uint8Array } | null> {
    const key = this.normalizeQuestion(question);
    if (!key) return null;

    const cacheKey = `cache:${key}`;
    const value = await this.kv.get(cacheKey, 'json');

    if (!value) return null;

    const entry = value as { textResponse: string };
    return { textResponse: entry.textResponse };
  }

  async set(question: string, textResponse: string): Promise<void> {
    const key = this.normalizeQuestion(question);
    if (!key) return;

    const cacheKey = `cache:${key}`;
    await this.kv.put(cacheKey, JSON.stringify({ textResponse }), { expirationTtl: this.TTL });
  }
}
