import type { BillingProvider, CheckoutInput, CheckoutResult } from './types';

/**
 * Offline billing provider — NO Stripe account, NO network. Lets the entire
 * purchase flow (checkout -> confirm -> grant credits / set Pro) run with no keys.
 * The client confirms via POST /billing/mock-confirm to simulate a paid webhook.
 */
export const mockBillingProvider: BillingProvider = {
  name: 'mock',
  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    return { provider: 'mock', sessionId: `mock_${input.txnId}`, mock: true };
  },
};
