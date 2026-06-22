import type { BillingProvider } from './types';
import { mockBillingProvider } from './mock';
import { stripeBillingProvider } from './stripe';

export * from './types';
export * from './catalog';

/** Selects the billing provider from BILLING_PROVIDER (mock | stripe). */
export function getBillingProvider(): BillingProvider {
  return (process.env.BILLING_PROVIDER || 'mock').toLowerCase() === 'stripe'
    ? stripeBillingProvider
    : mockBillingProvider;
}

export function billingProviderName(): 'stripe' | 'mock' {
  return getBillingProvider().name;
}
