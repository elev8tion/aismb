/**
 * Shared ROI Types & Constants
 *
 * Single source of truth for ROI calculator types and tier configuration.
 * Used by both client (React) and server code.
 */

export interface TierConfig {
  id: string;
  name: string;
  setupFee: number;
  monthlyFee: number;
  months: number;
  cost: number;          // total minimum commitment: setupFee + (monthlyFee × months)
  components: number;    // number of infrastructure components deployed
}

export const TIER_DATA: Record<string, TierConfig> = {
  discovery:  { id: 'discovery',  name: 'The Revenue Guard',        setupFee: 2500,  monthlyFee: 750,  months: 2, cost: 4000,  components: 2 },
  foundation: { id: 'foundation', name: 'The Operations Sovereign',  setupFee: 5000,  monthlyFee: 1500, months: 3, cost: 9500,  components: 5 },
  architect:  { id: 'architect',  name: 'The Enterprise Fortress',   setupFee: 12000, monthlyFee: 3000, months: 6, cost: 30000, components: 8 },
};
