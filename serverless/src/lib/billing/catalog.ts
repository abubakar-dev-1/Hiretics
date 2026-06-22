/** Billing catalog (Phase 9) — credit packs + the Pro plan. Single source of truth. */

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  amountCents: number;
  currency: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'starter', name: 'Starter Pack', credits: 50, amountCents: 1900, currency: 'usd' },
  { id: 'growth', name: 'Growth Pack', credits: 200, amountCents: 5900, currency: 'usd' },
  { id: 'scale', name: 'Scale Pack', credits: 500, amountCents: 12900, currency: 'usd' },
];

/** Pro subscription (modelled as a one-off upgrade in this build). */
export const PRO_PLAN = { id: 'pro', name: 'Pro', amountCents: 900, currency: 'usd' };

export function getPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}
