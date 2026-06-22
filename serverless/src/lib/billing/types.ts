export interface CheckoutInput {
  txnId: string;
  kind: 'credits' | 'pro';
  itemName: string;
  amountCents: number;
  currency: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  provider: 'stripe' | 'mock';
  sessionId: string;
  /** Hosted checkout URL to redirect to (Stripe). Absent for the mock provider. */
  url?: string;
  /** True when the caller should confirm via /billing/mock-confirm (offline mode). */
  mock?: boolean;
}

export interface BillingProvider {
  readonly name: 'stripe' | 'mock';
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
}

/** Result of parsing a provider webhook into a normalized fulfillment intent. */
export interface WebhookEvent {
  type: string;
  /** Our transaction id, carried in session metadata. */
  txnId?: string;
}
