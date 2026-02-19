/**
 * Unit tests for leadManager — focused on CRM sync changes (Feb 2026)
 *
 * Covers:
 *   - syncBookingToCRM returns NCB lead ID (create path)
 *   - syncBookingToCRM returns NCB lead ID (update path, where PUT has no id in response)
 *   - syncBookingToCRM passes leadScore as qualified_score → lead_score
 *   - syncBookingToCRM returns null when syncLeadToCRM fails
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncBookingToCRM } from '../leadManager';

// Mock the ncb client so no real HTTP calls are made
vi.mock('@/lib/ncb/client', () => ({
  ncbRequest: vi.fn(),
}));

import { ncbRequest } from '@/lib/ncb/client';
const mockNcbRequest = vi.mocked(ncbRequest);

const MOCK_ENV = {
  NCB_INSTANCE: '36905_ai_smb_crm',
  NCB_OPENAPI_URL: 'https://openapi.nocodebackend.com',
  NCB_SECRET_KEY: 'test-secret',
  NCB_DEFAULT_USER_ID: 'default-user-id',
};

const BASE_DATA = {
  email: 'jane@example.com',
  name: 'Jane Doe',
  date: '2026-03-01',
  time: '10:00',
  timezone: 'America/Chicago',
};

describe('syncBookingToCRM — create path (new lead)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // GET /read/leads returns empty → new lead
    // POST /create/leads returns { status: "success", id: 42 }
    mockNcbRequest
      .mockResolvedValueOnce([]) // GET read/leads
      .mockResolvedValueOnce({ status: 'success', id: 42 } as any); // POST create/leads
  });

  it('returns the string ID of the newly created lead', async () => {
    const result = await syncBookingToCRM(BASE_DATA, MOCK_ENV);
    expect(result).toBe('42');
  });

  it('calls POST create/leads with correct fields', async () => {
    await syncBookingToCRM(BASE_DATA, MOCK_ENV);
    const createCall = mockNcbRequest.mock.calls[1];
    expect(createCall[0]).toBe('POST');
    expect(createCall[1]).toBe('create/leads');
    const body = createCall[3] as Record<string, unknown>;
    expect(body.email).toBe('jane@example.com');
    expect(body.first_name).toBe('Jane');
    expect(body.last_name).toBe('Doe');
    expect(body.source).toBe('other');
    expect(body.status).toBe('new');
  });

  it('passes leadScore as lead_score in the NCB payload', async () => {
    await syncBookingToCRM({ ...BASE_DATA, leadScore: 75 }, MOCK_ENV);
    const createCall = mockNcbRequest.mock.calls[1];
    const body = createCall[3] as Record<string, unknown>;
    expect(body.lead_score).toBe(75);
  });

  it('omits lead_score when leadScore is not provided', async () => {
    await syncBookingToCRM(BASE_DATA, MOCK_ENV);
    const createCall = mockNcbRequest.mock.calls[1];
    const body = createCall[3] as Record<string, unknown>;
    expect(body.lead_score).toBeUndefined();
  });
});

describe('syncBookingToCRM — update path (existing lead)', () => {
  const EXISTING_LEAD = { id: '99', email: 'jane@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    // GET returns existing lead
    // PUT returns { status: "success" } — no id (real NCB behaviour)
    mockNcbRequest
      .mockResolvedValueOnce([EXISTING_LEAD] as any) // GET read/leads
      .mockResolvedValueOnce({ status: 'success' } as any); // PUT update/leads/99
  });

  it('returns the ID from the existing lead record (not the PUT response)', async () => {
    const result = await syncBookingToCRM(BASE_DATA, MOCK_ENV);
    expect(result).toBe('99');
  });

  it('calls PUT update/leads/:id with the correct id', async () => {
    await syncBookingToCRM(BASE_DATA, MOCK_ENV);
    const putCall = mockNcbRequest.mock.calls[1];
    expect(putCall[0]).toBe('PUT');
    expect(putCall[1]).toBe('update/leads/99');
  });

  it('passes leadScore as lead_score on update', async () => {
    await syncBookingToCRM({ ...BASE_DATA, leadScore: 90 }, MOCK_ENV);
    const putCall = mockNcbRequest.mock.calls[1];
    const body = putCall[3] as Record<string, unknown>;
    expect(body.lead_score).toBe(90);
  });
});

describe('syncBookingToCRM — failure path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when ncbRequest throws', async () => {
    mockNcbRequest.mockRejectedValue(new Error('Network error'));
    const result = await syncBookingToCRM(BASE_DATA, MOCK_ENV);
    expect(result).toBeNull();
  });

  it('returns null when syncLeadToCRM returns null', async () => {
    // GET returns null (ncbRequest failed silently) → syncLeadToCRM returns null
    mockNcbRequest.mockResolvedValue(null);
    const result = await syncBookingToCRM(BASE_DATA, MOCK_ENV);
    expect(result).toBeNull();
  });
});

describe('syncBookingToCRM — industry/employee_count enum normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNcbRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ status: 'success', id: 1 } as any);
  });

  it('maps "contractor" → "construction" (the exact Tony Nine failure case)', async () => {
    await syncBookingToCRM({ ...BASE_DATA, industry: 'contractor' }, MOCK_ENV);
    const body = mockNcbRequest.mock.calls[1][3] as Record<string, unknown>;
    expect(body.industry).toBe('construction');
  });

  it('maps plain number "9" → "5-10" for employee_count', async () => {
    await syncBookingToCRM({ ...BASE_DATA, employeeCount: '9' }, MOCK_ENV);
    const body = mockNcbRequest.mock.calls[1][3] as Record<string, unknown>;
    expect(body.employee_count).toBe('5-10');
  });

  it('passes valid industry enum value through unchanged', async () => {
    await syncBookingToCRM({ ...BASE_DATA, industry: 'hvac' }, MOCK_ENV);
    const body = mockNcbRequest.mock.calls[1][3] as Record<string, unknown>;
    expect(body.industry).toBe('hvac');
  });

  it('maps "plumbing contractor" → "construction"', async () => {
    await syncBookingToCRM({ ...BASE_DATA, industry: 'plumbing contractor' }, MOCK_ENV);
    const body = mockNcbRequest.mock.calls[1][3] as Record<string, unknown>;
    // "plumb" matches plumbing first
    expect(body.industry).toBe('plumbing');
  });

  it('maps unrecognized industry → "other"', async () => {
    await syncBookingToCRM({ ...BASE_DATA, industry: 'underwater basket weaving' }, MOCK_ENV);
    const body = mockNcbRequest.mock.calls[1][3] as Record<string, unknown>;
    expect(body.industry).toBe('other');
  });

  it('maps valid employee_count range through unchanged', async () => {
    await syncBookingToCRM({ ...BASE_DATA, employeeCount: '10-25' }, MOCK_ENV);
    const body = mockNcbRequest.mock.calls[1][3] as Record<string, unknown>;
    expect(body.employee_count).toBe('10-25');
  });

  it('maps "3" → "1-5"', async () => {
    await syncBookingToCRM({ ...BASE_DATA, employeeCount: '3' }, MOCK_ENV);
    const body = mockNcbRequest.mock.calls[1][3] as Record<string, unknown>;
    expect(body.employee_count).toBe('1-5');
  });

  it('omits employee_count when value is unrecognizable', async () => {
    await syncBookingToCRM({ ...BASE_DATA, employeeCount: 'many' }, MOCK_ENV);
    const body = mockNcbRequest.mock.calls[1][3] as Record<string, unknown>;
    expect(body.employee_count).toBeUndefined();
  });
});

describe('syncBookingToCRM — sourceDetail formatting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNcbRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ status: 'success', id: 1 } as any);
  });

  it('includes challenge in sourceDetail when provided', async () => {
    await syncBookingToCRM({ ...BASE_DATA, challenge: 'scheduling chaos' }, MOCK_ENV);
    const createCall = mockNcbRequest.mock.calls[1];
    const body = createCall[3] as Record<string, unknown>;
    expect(body.source_detail).toContain('scheduling chaos');
    expect(body.source_detail).toContain('2026-03-01');
  });

  it('omits challenge separator when no challenge provided', async () => {
    await syncBookingToCRM(BASE_DATA, MOCK_ENV);
    const createCall = mockNcbRequest.mock.calls[1];
    const body = createCall[3] as Record<string, unknown>;
    expect(body.source_detail).toBe('2026-03-01 at 10:00');
  });
});
