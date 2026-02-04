/**
 * Session ID management utilities
 * Uses sessionStorage for client-side session persistence
 */

const SESSION_STORAGE_KEY = 'voice_agent_session_id';

/**
 * Generate a cryptographically secure random session ID
 */
export function generateSessionId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Generate random hex string
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create session ID from sessionStorage
 * Session persists until browser tab is closed
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return placeholder
    return 'ssr-placeholder';
  }

  try {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      console.log('📝 Created new session:', sessionId);
    } else {
      console.log('📝 Using existing session:', sessionId);
    }

    return sessionId;
  } catch (error) {
    // Fallback if sessionStorage is unavailable (private browsing, etc.)
    console.warn('sessionStorage unavailable, using temporary session ID');
    return generateSessionId();
  }
}

/**
 * Clear session ID from sessionStorage
 * Call this when user explicitly closes the voice agent
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    console.log('🗑️ Cleared session ID');
  } catch (error) {
    console.warn('Failed to clear session ID:', error);
  }
}

/**
 * Check if session ID exists
 */
export function hasSessionId(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}
