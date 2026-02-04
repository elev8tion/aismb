/// <reference types="@cloudflare/workers-types" />

/**
 * Session storage abstraction that works both locally and on Cloudflare
 * - Local development: In-memory storage with TTL
 * - Cloudflare: KV storage
 */

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VoiceSession {
  sessionId: string;
  conversationHistory: ConversationMessage[];
  createdAt: number;
  lastAccessedAt: number;
}

/**
 * Abstract session storage interface
 */
export interface SessionStorage {
  getSession(sessionId: string): Promise<VoiceSession | null>;
  saveSession(session: VoiceSession): Promise<void>;
  createSession(sessionId: string): Promise<VoiceSession>;
  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<VoiceSession>;
  deleteSession(sessionId: string): Promise<void>;
  getConversationHistory(sessionId: string): Promise<ConversationMessage[]>;
}

/**
 * In-memory storage for local development
 */
class InMemorySessionStorage implements SessionStorage {
  private sessions: Map<string, VoiceSession> = new Map();
  private readonly SESSION_TTL = 3600000; // 1 hour in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000); // Clean up every 5 minutes
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessedAt > this.SESSION_TTL) {
        this.sessions.delete(sessionId);
        console.log(`🗑️ Cleaned up expired session: ${sessionId}`);
      }
    }
  }

  async getSession(sessionId: string): Promise<VoiceSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check if expired
    if (Date.now() - session.lastAccessedAt > this.SESSION_TTL) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last accessed time
    session.lastAccessedAt = Date.now();
    return session;
  }

  async saveSession(session: VoiceSession): Promise<void> {
    session.lastAccessedAt = Date.now();
    this.sessions.set(session.sessionId, session);
  }

  async createSession(sessionId: string): Promise<VoiceSession> {
    const session: VoiceSession = {
      sessionId,
      conversationHistory: [],
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };

    this.sessions.set(sessionId, session);
    console.log(`📝 Created new session: ${sessionId}`);
    return session;
  }

  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<VoiceSession> {
    let session = await this.getSession(sessionId);

    if (!session) {
      session = await this.createSession(sessionId);
    }

    session.conversationHistory.push({ role, content });

    // Limit to last 10 messages to control token usage
    if (session.conversationHistory.length > 10) {
      session.conversationHistory = session.conversationHistory.slice(-10);
      console.log(`✂️ Trimmed session ${sessionId} to last 10 messages`);
    }

    await this.saveSession(session);
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    console.log(`🗑️ Deleted session: ${sessionId}`);
  }

  async getConversationHistory(sessionId: string): Promise<ConversationMessage[]> {
    const session = await this.getSession(sessionId);
    return session?.conversationHistory || [];
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Cloudflare KV storage (for production)
 */
class KVSessionStorage implements SessionStorage {
  private kv: KVNamespace;
  private readonly SESSION_TTL = 3600; // 1 hour in seconds

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async getSession(sessionId: string): Promise<VoiceSession | null> {
    try {
      const data = await this.kv.get(`session:${sessionId}`, 'json');
      if (!data) {
        return null;
      }

      const session = data as VoiceSession;
      return session;
    } catch (error) {
      console.error('Failed to get session from KV:', error);
      return null;
    }
  }

  async saveSession(session: VoiceSession): Promise<void> {
    try {
      session.lastAccessedAt = Date.now();
      await this.kv.put(
        `session:${session.sessionId}`,
        JSON.stringify(session),
        {
          expirationTtl: this.SESSION_TTL,
        }
      );
    } catch (error) {
      console.error('Failed to save session to KV:', error);
      throw error;
    }
  }

  async createSession(sessionId: string): Promise<VoiceSession> {
    const session: VoiceSession = {
      sessionId,
      conversationHistory: [],
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };

    await this.saveSession(session);
    console.log(`📝 Created new KV session: ${sessionId}`);
    return session;
  }

  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<VoiceSession> {
    let session = await this.getSession(sessionId);

    if (!session) {
      session = await this.createSession(sessionId);
    }

    session.conversationHistory.push({ role, content });

    // Limit to last 10 messages to control token usage
    if (session.conversationHistory.length > 10) {
      session.conversationHistory = session.conversationHistory.slice(-10);
      console.log(`✂️ Trimmed KV session ${sessionId} to last 10 messages`);
    }

    await this.saveSession(session);
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.kv.delete(`session:${sessionId}`);
      console.log(`🗑️ Deleted KV session: ${sessionId}`);
    } catch (error) {
      console.error('Failed to delete session from KV:', error);
    }
  }

  async getConversationHistory(sessionId: string): Promise<ConversationMessage[]> {
    const session = await this.getSession(sessionId);
    return session?.conversationHistory || [];
  }
}

/**
 * Singleton in-memory storage for local development
 */
let inMemoryStorage: InMemorySessionStorage | null = null;

/**
 * Get session storage implementation
 * - If KV is available (Cloudflare), use KV storage
 * - Otherwise, use in-memory storage (local dev)
 */
export function getSessionStorage(kv?: KVNamespace): SessionStorage {
  if (kv) {
    console.log('💾 Using Cloudflare KV for session storage');
    return new KVSessionStorage(kv);
  }

  // Use singleton in-memory storage
  if (!inMemoryStorage) {
    console.log('💾 Using in-memory storage for local development');
    inMemoryStorage = new InMemorySessionStorage();
  }

  return inMemoryStorage;
}
