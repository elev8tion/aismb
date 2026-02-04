/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Workers environment with KV namespace bindings
 */
export interface CloudflareEnv {
  VOICE_SESSIONS: KVNamespace;
  ENVIRONMENT?: string;
}

/**
 * Voice session stored in KV
 */
export interface VoiceSession {
  sessionId: string;
  conversationHistory: ConversationMessage[];
  createdAt: number;
  lastAccessedAt: number;
}

/**
 * Conversation message format
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Session storage utilities
 */
export class VoiceSessionStorage {
  private kv: KVNamespace;
  private readonly SESSION_TTL = 3600; // 1 hour in seconds

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Get session from KV
   */
  async getSession(sessionId: string): Promise<VoiceSession | null> {
    try {
      const data = await this.kv.get(`session:${sessionId}`, 'json');
      if (!data) {
        return null;
      }

      const session = data as VoiceSession;

      // Update last accessed time
      session.lastAccessedAt = Date.now();
      await this.saveSession(session);

      return session;
    } catch (error) {
      console.error('Failed to get session from KV:', error);
      return null;
    }
  }

  /**
   * Save session to KV with TTL
   */
  async saveSession(session: VoiceSession): Promise<void> {
    try {
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

  /**
   * Create new session
   */
  async createSession(sessionId: string): Promise<VoiceSession> {
    const session: VoiceSession = {
      sessionId,
      conversationHistory: [],
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };

    await this.saveSession(session);
    return session;
  }

  /**
   * Add message to session
   */
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
    }

    await this.saveSession(session);
    return session;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.kv.delete(`session:${sessionId}`);
    } catch (error) {
      console.error('Failed to delete session from KV:', error);
    }
  }

  /**
   * Get conversation history for session
   */
  async getConversationHistory(sessionId: string): Promise<ConversationMessage[]> {
    const session = await this.getSession(sessionId);
    return session?.conversationHistory || [];
  }
}
