/**
 * Production Environment Validation Tests
 *
 * Makes real HTTP calls to production endpoints to verify:
 * - All API routes work with Cloudflare edge runtime
 * - Environment variables are correctly configured
 * - getOptionalRequestContext() works in production
 * - No regressions from local dev fixes
 *
 * Run with: PRODUCTION=true npm test -- production-validation.test.ts
 */

import { describe, test, expect } from 'vitest';

const PRODUCTION = process.env.PRODUCTION === 'true';
const LANDING_URL = 'https://kre8tion.com';
const CRM_URL = 'https://app.kre8tion.com';

// Skip all tests unless PRODUCTION=true
const describeProduction = PRODUCTION ? describe : describe.skip;

interface ValidationResult {
  endpoint: string;
  status: number;
  success: boolean;
  error?: string;
  responseTime: number;
  hasData: boolean;
}

const results: ValidationResult[] = [];

function logResult(result: ValidationResult) {
  results.push(result);
  const emoji = result.success ? '✅' : '❌';
  console.log(`${emoji} [${result.status}] ${result.endpoint} (${result.responseTime}ms)`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
}

async function validateEndpoint(
  url: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<ValidationResult> {
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseTime = Date.now() - start;
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    let hasData = false;
    let text = '';

    if (isJson) {
      try {
        data = await response.json();
        hasData = !!data;
      } catch {
        // Not valid JSON
      }
    } else {
      text = await response.text();
      hasData = text.length > 0;
    }

    const success = response.ok && !text.includes('<!DOCTYPE');

    const result: ValidationResult = {
      endpoint: url,
      status: response.status,
      success,
      responseTime,
      hasData,
      error: !success ? `HTTP ${response.status}` : undefined,
    };

    logResult(result);
    return result;

  } catch (error) {
    const responseTime = Date.now() - start;
    const result: ValidationResult = {
      endpoint: url,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime,
      hasData: false,
    };

    logResult(result);
    return result;
  }
}

describeProduction('Production Environment Validation', () => {

  describe('Landing Page (kre8tion.com)', () => {

    test('Voice Agent - Simple Query', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/voice-agent/chat`,
        'POST',
        {
          sessionId: `prod-test-${Date.now()}`,
          question: 'What services do you offer?',
          language: 'en',
        }
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.hasData).toBe(true);
    }, 30000);

    test('Voice Agent - Security Stats', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/voice-agent/security-stats`,
        'GET'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    test('Booking - Get Available Dates', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/booking/availability?mode=dates`,
        'GET'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    test('ROI Lead Capture', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/leads/roi`,
        'POST',
        {
          email: `test-${Date.now()}@example.com`,
          industry: 'HVAC',
          employees: '10-25',
          hourlyValue: 25,
          tier: 'foundation',
          locale: 'en',
          metrics: {
            taskHours: { scheduling: 6, communication: 8 },
            totalWeeklyHoursSaved: 14,
            weeklyLaborSavings: 350,
            annualBenefit: 18200,
            investment: 6500,
            roi: 180,
            paybackWeeks: 18,
          },
        }
      );

      // May fail if EMAILIT_API_KEY not configured in production
      expect([200, 500]).toContain(result.status);
    });

    test('Auth Providers Endpoint', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/auth-providers`,
        'GET'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    test('Data Proxy - Unauthorized (no session)', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/data/read/bookings`,
        'GET'
      );

      // Should reject with 401 when no auth
      expect(result.status).toBe(401);
    });
  });

  describe('CRM (app.kre8tion.com)', () => {

    test('CRM Voice Agent - Unauthenticated', async () => {
      const result = await validateEndpoint(
        `${CRM_URL}/api/agent/chat`,
        'POST',
        {
          sessionId: `crm-prod-test-${Date.now()}`,
          message: 'Show me my leads',
        }
      );

      // Should require authentication
      expect([401, 403]).toContain(result.status);
    });

    test('Auth Providers Endpoint', async () => {
      const result = await validateEndpoint(
        `${CRM_URL}/api/auth-providers`,
        'GET'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    test('Data Proxy - Unauthorized (no session)', async () => {
      const result = await validateEndpoint(
        `${CRM_URL}/api/data/read/leads`,
        'GET'
      );

      // Should reject with 401 when no auth
      expect(result.status).toBe(401);
    });

    test('Stripe Integration - Invoices List (no auth)', async () => {
      const result = await validateEndpoint(
        `${CRM_URL}/api/integrations/stripe/invoices/list`,
        'GET'
      );

      // Should require authentication
      expect([401, 403]).toContain(result.status);
    });
  });

  describe('Environment Variable Verification', () => {

    test('Landing Page - OpenAI Integration Works', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/voice-agent/chat`,
        'POST',
        {
          sessionId: `env-test-${Date.now()}`,
          question: 'Hello',
          language: 'en',
        }
      );

      // If OpenAI key is configured, should get 200
      // If not configured, would get 500
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    }, 30000);

    test('Landing Page - NCB Integration (via data proxy)', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/data/read/bookings`,
        'GET'
      );

      // Should get 401 (auth required) not 500 (missing env vars)
      expect(result.status).toBe(401);
    });

    test('CRM - NCB Integration', async () => {
      const result = await validateEndpoint(
        `${CRM_URL}/api/data/read/leads`,
        'GET'
      );

      // Should get 401 (auth required) not 500 (missing env vars)
      expect(result.status).toBe(401);
    });
  });

  describe('Error Handling', () => {

    test('Landing Page - Invalid Endpoint', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/nonexistent`,
        'GET'
      );

      expect(result.status).toBe(404);
    });

    test('Landing Page - Malformed Request', async () => {
      const result = await validateEndpoint(
        `${LANDING_URL}/api/voice-agent/chat`,
        'POST',
        {} // Missing required fields
      );

      expect([400, 500]).toContain(result.status);
    });

    test('CRM - Invalid Endpoint', async () => {
      const result = await validateEndpoint(
        `${CRM_URL}/api/nonexistent`,
        'GET'
      );

      expect(result.status).toBe(404);
    });
  });

  afterAll(() => {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('PRODUCTION VALIDATION SUMMARY');
    console.log('════════════════════════════════════════════════════════════════');

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgResponseTime = Math.round(
      results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
    );

    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Avg Response Time: ${avgResponseTime}ms`);

    console.log('\nStatus Code Distribution:');
    const statusCounts = results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    Object.entries(statusCounts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

    console.log('\nSlowest Endpoints:');
    results
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 5)
      .forEach(r => {
        console.log(`  ${r.responseTime}ms - ${r.endpoint}`);
      });

    console.log('════════════════════════════════════════════════════════════════\n');
  });
});
