import { describe, it, expect } from 'vitest';
import { translations } from '../translations';

const en = translations.en;
const es = translations.es;

describe('translations', () => {
  it('has EN and ES languages', () => {
    expect(translations).toHaveProperty('en');
    expect(translations).toHaveProperty('es');
  });

  it('EN and ES have matching top-level keys', () => {
    const enKeys = Object.keys(en).sort();
    const esKeys = Object.keys(es).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('footer has aiDisclosure key in EN', () => {
    expect(en.footer.aiDisclosure).toBe('AI Disclosure');
  });

  it('footer has refundPolicy key in EN', () => {
    expect(en.footer.refundPolicy).toBe('Refund Policy');
  });

  it('footer has aiDisclosure key in ES', () => {
    expect(es.footer.aiDisclosure).toBeDefined();
    expect(typeof es.footer.aiDisclosure).toBe('string');
  });

  it('footer has refundPolicy key in ES', () => {
    expect(es.footer.refundPolicy).toBeDefined();
    expect(typeof es.footer.refundPolicy).toBe('string');
  });

  it('booking form has termsAgreement key in EN', () => {
    expect(en.booking.form.termsAgreement).toContain('<terms>');
    expect(en.booking.form.termsAgreement).toContain('<refund>');
  });

  it('booking form has termsRequired key in EN', () => {
    expect(en.booking.form.termsRequired).toBeDefined();
    expect(typeof en.booking.form.termsRequired).toBe('string');
  });

  it('booking form has termsAgreement key in ES', () => {
    expect(es.booking.form.termsAgreement).toContain('<terms>');
    expect(es.booking.form.termsAgreement).toContain('<refund>');
  });

  it('booking form has termsRequired key in ES', () => {
    expect(es.booking.form.termsRequired).toBeDefined();
    expect(typeof es.booking.form.termsRequired).toBe('string');
  });
});
