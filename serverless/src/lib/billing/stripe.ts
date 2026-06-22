import crypto from 'crypto';
import type { BillingProvider, CheckoutInput, CheckoutResult, WebhookEvent } from './types';

/**
 * Stripe provider implemented directly against the REST API + crypto for webhook
 * signature verification — no `stripe` SDK dependency (keeps Lambda bundles small
 * and avoids a hard dep for the offline/mock default). Only used when
 * BILLING_PROVIDER=stripe and STRIPE_SECRET_KEY is set.
 */
export const stripeBillingProvider: BillingProvider = {
  name: 'stripe',
  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');

    const form = new URLSearchParams();
    form.set('mode', 'payment');
    form.set('success_url', input.successUrl);
    form.set('cancel_url', input.cancelUrl);
    form.set('customer_email', input.email);
    form.set('client_reference_id', input.txnId);
    form.set('metadata[txnId]', input.txnId);
    form.set('line_items[0][quantity]', '1');
    form.set('line_items[0][price_data][currency]', input.currency);
    form.set('line_items[0][price_data][unit_amount]', String(input.amountCents));
    form.set('line_items[0][price_data][product_data][name]', input.itemName);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'Stripe checkout failed');
    return { provider: 'stripe', sessionId: data.id, url: data.url };
  },
};

/**
 * Verify a Stripe webhook signature (scheme v1) and return a normalized event.
 * Throws if the signature is missing/invalid. `rawBody` MUST be the exact bytes.
 */
export function verifyStripeWebhook(
  rawBody: string,
  sigHeader: string | undefined,
  secret: string,
): WebhookEvent {
  if (!sigHeader) throw new Error('Missing Stripe-Signature header');
  const parts = Object.fromEntries(
    sigHeader.split(',').map((kv) => kv.split('=').map((s) => s.trim()) as [string, string]),
  );
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) throw new Error('Malformed Stripe-Signature header');

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${rawBody}`, 'utf8')
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('Stripe signature verification failed');
  }

  const event = JSON.parse(rawBody);
  const obj = event?.data?.object ?? {};
  return {
    type: event?.type ?? 'unknown',
    txnId: obj?.metadata?.txnId || obj?.client_reference_id,
  };
}
