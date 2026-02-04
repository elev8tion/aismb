// Response Cache for Voice Agent
// Caches common questions for instant responses

interface CacheEntry {
  textResponse: string;
  audioUint8Array?: Uint8Array;
  timestamp: number;
  hitCount: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry>;
  private readonly TTL: number = 1000 * 60 * 60 * 24; // 24 hours
  private readonly maxSize: number = 100;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Normalize question to create cache key
   * Handles variations like:
   * - "What's your pricing?" → "pricing"
   * - "How much does it cost?" → "pricing"
   * - "Do you work with restaurants?" → "industry"
   */
  private normalizeQuestion(question: string): string | null {
    const q = question.toLowerCase().trim();

    // Pricing variations
    if (
      q.includes('pricing') ||
      q.includes('how much') ||
      q.includes('what does it cost') ||
      q.includes('price') ||
      q.match(/cost\??$/)
    ) {
      return 'pricing';
    }

    // Industry/business type variations
    if (
      q.includes('do you work with') ||
      q.includes('work with my industry') ||
      q.includes('work with my business') ||
      q.match(/work with \w+\??/) ||
      q.includes('my industry')
    ) {
      return 'industry';
    }

    // ChatGPT comparison
    if (
      (q.includes('chatgpt') || q.includes('chat gpt')) &&
      (q.includes('different') || q.includes('compare') || q.includes('versus') || q.includes('vs'))
    ) {
      return 'chatgpt-comparison';
    }

    // Technical skills
    if (
      (q.includes('technical') || q.includes('coding') || q.includes('code')) &&
      (q.includes('need') || q.includes('required') || q.includes('skills'))
    ) {
      return 'technical-skills';
    }

    // Tier differences
    if (
      (q.includes('difference') || q.includes('compare')) &&
      (q.includes('tier') || q.includes('plan') || q.includes('package'))
    ) {
      return 'tier-differences';
    }

    // Results timeline
    if (
      (q.includes('how long') || q.includes('when')) &&
      (q.includes('result') || q.includes('see') || q.includes('savings') || q.includes('roi'))
    ) {
      return 'results-timeline';
    }

    // After term / independence
    if (
      (q.includes('after') && (q.includes('term') || q.includes('program'))) ||
      q.includes('what happens when') ||
      q.includes('when it ends')
    ) {
      return 'after-term';
    }

    // Upgrade path
    if (
      q.includes('upgrade') &&
      (q.includes('tier') || q.includes('plan') || q.includes('discovery') || q.includes('foundation'))
    ) {
      return 'upgrade-path';
    }

    // Error handling
    if (
      (q.includes('mistake') || q.includes('error') || q.includes('wrong')) &&
      (q.includes('ai') || q.includes('what if') || q.includes('happens'))
    ) {
      return 'error-handling';
    }

    // Data storage/privacy
    if (
      (q.includes('data') || q.includes('information')) &&
      (q.includes('stored') || q.includes('storage') || q.includes('where') || q.includes('privacy'))
    ) {
      return 'data-storage';
    }

    // No match - don't cache
    return null;
  }

  /**
   * Get cached response if available and not expired
   */
  get(question: string): { textResponse: string; audioUint8Array?: Uint8Array } | null {
    const key = this.normalizeQuestion(question);
    if (!key) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit count for analytics
    entry.hitCount++;

    console.log(`✅ Cache HIT: "${key}" (hits: ${entry.hitCount})`);

    return {
      textResponse: entry.textResponse,
      audioUint8Array: entry.audioUint8Array,
    };
  }

  /**
   * Set cached response
   */
  set(question: string, textResponse: string, audioUint8Array?: Uint8Array): void {
    const key = this.normalizeQuestion(question);
    if (!key) {
      console.log(`⚠️ Question not cacheable: "${question}"`);
      return; // Don't cache non-standard questions
    }

    // Enforce max cache size (LRU-style)
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      textResponse,
      audioUint8Array,
      timestamp: Date.now(),
      hitCount: 0,
    });

    console.log(`💾 Cached response for: "${key}"`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        hitCount: entry.hitCount,
        age: Date.now() - entry.timestamp,
      })),
    };

    return stats;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`🗑️ Cleared ${cleared} expired cache entries`);
    }
  }
}

// Singleton instance
export const responseCache = new ResponseCache();

// Clear expired entries every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    responseCache.clearExpired();
  }, 1000 * 60 * 60); // 1 hour
}
