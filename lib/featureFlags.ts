/**
 * Feature Flags for Voice Agent Capabilities
 *
 * These flags control gradual rollout of voice agent features.
 * All flags default to false for safety - enable in Cloudflare Pages env vars.
 *
 * @example
 * // In Cloudflare Pages Environment Variables:
 * FF_VOICE_LEAD_EXTRACTION=true
 * FF_VOICE_LEAD_SCORING=true
 * FF_VOICE_CRM_SYNC=true
 * FF_VOICE_ANALYTICS=true
 * FF_VOICE_ADMIN_ALERTS=true
 */

export interface FeatureFlags {
  /** Extract lead info (email, industry, pain points) from conversations */
  VOICE_LEAD_EXTRACTION: boolean;

  /** Score leads based on industry fit, size, and intent signals */
  VOICE_LEAD_SCORING: boolean;

  /** Sync qualified leads to CRM via NCB OpenAPI */
  VOICE_CRM_SYNC: boolean;

  /** Track analytics (sentiment, topics, conversion funnel) */
  VOICE_ANALYTICS: boolean;

  /** Send email alerts to admin for high-value leads */
  VOICE_ADMIN_ALERTS: boolean;
}

/**
 * Get feature flags from Cloudflare environment variables
 * All flags default to false if not explicitly set to 'true'
 */
export function getFeatureFlags(env: Record<string, string | undefined>): FeatureFlags {
  return {
    VOICE_LEAD_EXTRACTION: env.FF_VOICE_LEAD_EXTRACTION === 'true',
    VOICE_LEAD_SCORING: env.FF_VOICE_LEAD_SCORING === 'true',
    VOICE_CRM_SYNC: env.FF_VOICE_CRM_SYNC === 'true',
    VOICE_ANALYTICS: env.FF_VOICE_ANALYTICS === 'true',
    VOICE_ADMIN_ALERTS: env.FF_VOICE_ADMIN_ALERTS === 'true',
  };
}

/**
 * Log feature flag status for debugging
 */
export function logFeatureFlags(flags: FeatureFlags): void {
  console.log('Voice Agent Feature Flags:', {
    extraction: flags.VOICE_LEAD_EXTRACTION ? '✅' : '❌',
    scoring: flags.VOICE_LEAD_SCORING ? '✅' : '❌',
    crmSync: flags.VOICE_CRM_SYNC ? '✅' : '❌',
    analytics: flags.VOICE_ANALYTICS ? '✅' : '❌',
    adminAlerts: flags.VOICE_ADMIN_ALERTS ? '✅' : '❌',
  });
}
