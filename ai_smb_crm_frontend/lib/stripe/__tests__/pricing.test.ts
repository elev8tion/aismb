import { describe, it, expect } from 'vitest';
import { TIER_PRICING, getTierPricing, getPriceEnvVar } from '../pricing';

describe('TIER_PRICING', () => {
  it('has exactly 3 tiers', () => {
    expect(Object.keys(TIER_PRICING)).toHaveLength(3);
  });

  it('has discovery tier with correct values', () => {
    expect(TIER_PRICING.discovery).toEqual({
      name: 'The Revenue Guard',
      setup: 250000,
      monthly: 75000,
      minMonths: 2,
      costModel: 'bundled',
      includedInteractions: 500,
      overageRateCents: 8,
    });
  });

  it('has foundation tier with correct values', () => {
    expect(TIER_PRICING.foundation).toEqual({
      name: 'The Operations Sovereign',
      setup: 500000,
      monthly: 150000,
      minMonths: 3,
      costModel: 'bundled',
      includedInteractions: 1500,
      overageRateCents: 8,
    });
  });

  it('has architect tier with correct values', () => {
    expect(TIER_PRICING.architect).toEqual({
      name: 'The Enterprise Fortress',
      setup: 1200000,
      monthly: 300000,
      minMonths: 6,
      costModel: 'pass_through',
      includedInteractions: null,
      overageRateCents: null,
    });
  });
});

describe('getTierPricing', () => {
  it('returns pricing for valid tier', () => {
    const result = getTierPricing('discovery');
    expect(result).not.toBeNull();
    expect(result!.setup).toBe(250000);
  });

  it('returns null for invalid tier', () => {
    expect(getTierPricing('nonexistent')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getTierPricing('')).toBeNull();
  });
});

describe('getPriceEnvVar', () => {
  it('returns correct env var for discovery', () => {
    expect(getPriceEnvVar('discovery')).toBe('STRIPE_PRICE_DISCOVERY_MONTHLY');
  });

  it('returns correct env var for foundation', () => {
    expect(getPriceEnvVar('foundation')).toBe('STRIPE_PRICE_FOUNDATION_MONTHLY');
  });

  it('returns correct env var for architect', () => {
    expect(getPriceEnvVar('architect')).toBe('STRIPE_PRICE_ARCHITECT_MONTHLY');
  });
});
