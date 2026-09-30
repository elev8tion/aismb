import { describe, expect, it } from 'vitest';
import { demoReadOnlyResponse, demoReadResponse, getDemoRows } from '../data';
import { createDemoSessionToken, hasValidDemoSession, setDemoSessionCookie } from '../token';

const env = { DEMO_SESSION_SECRET: 'test-secret-that-never-leaves-the-test' };
const now = Date.UTC(2026, 8, 30, 12, 0, 0);

describe('demo session token', () => {
  it('accepts a signed, unexpired HttpOnly cookie', async () => {
    const token = await createDemoSessionToken(env, now);
    expect(token).toBeTruthy();

    const cookie = setDemoSessionCookie(token!, true);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(await hasValidDemoSession(cookie, env, now + 1_000)).toBe(true);
  });

  it('rejects the old forgeable cookie and a modified signature', async () => {
    expect(await hasValidDemoSession('aismb-demo-session=1', env, now)).toBe(false);

    const token = await createDemoSessionToken(env, now);
    const tampered = `${token!.slice(0, -1)}${token!.endsWith('a') ? 'b' : 'a'}`;
    expect(await hasValidDemoSession(`aismb-demo-session=${tampered}`, env, now)).toBe(false);
  });

  it('rejects expired sessions', async () => {
    const token = await createDemoSessionToken(env, now);
    const nineHoursLater = now + 9 * 60 * 60 * 1_000;
    expect(await hasValidDemoSession(`aismb-demo-session=${token}`, env, nineHoursLater)).toBe(false);
  });
});

describe('demo fixtures', () => {
  it('uses the field names consumed by the lead, contact, company, and pipeline pages', () => {
    const [lead] = getDemoRows('leads');
    const [contact] = getDemoRows('contacts');
    const [company] = getDemoRows('companies');
    const [opportunity] = getDemoRows('opportunities');

    expect(lead).toMatchObject({ first_name: expect.any(String), last_name: expect.any(String), company_name: expect.any(String), lead_score: expect.any(Number) });
    expect(contact).toMatchObject({ first_name: expect.any(String), last_name: expect.any(String), company_id: expect.any(Number), decision_maker: expect.any(Number) });
    expect(company).toMatchObject({ name: expect.any(String), employee_count: expect.any(String), ai_maturity_score: expect.any(Number) });
    expect(opportunity).toMatchObject({ company_id: expect.any(Number), tier: expect.any(String), stage: expect.any(String), setup_fee: expect.any(Number), total_contract_value: expect.any(Number) });
  });

  it('returns coherent cross-linked records and never claims writes succeeded', () => {
    const companyIds = new Set(getDemoRows('companies').map((row) => row.id));
    const contactCompanyIds = getDemoRows('contacts').map((row) => row.company_id);
    const opportunityCompanyIds = getDemoRows('opportunities').map((row) => row.company_id);

    expect(contactCompanyIds.every((id) => companyIds.has(id))).toBe(true);
    expect(opportunityCompanyIds.every((id) => companyIds.has(id))).toBe(true);
    expect(demoReadResponse('leads')).toMatchObject({ demo: true, total: 4 });
    expect(demoReadOnlyResponse()).toEqual({
      error: 'The public demo is read-only. Changes are disabled.',
      code: 'DEMO_READ_ONLY',
    });
  });
});
