import type { APIGatewayProxyHandler } from 'aws-lambda';
import { json, ok } from '../../lib/response';
import { verifyStripeWebhook } from '../../lib/billing/stripe';
import { fulfillTransaction } from '../../lib/billing/fulfill';

/**
 * POST /billing/webhook  (public, Stripe-signature-verified)
 * Fulfils a purchase ONLY on the server-verified webhook (never on client
 * redirect). Idempotent — Stripe retries are safe.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json(500, { error: 'Webhook secret not configured' });

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const sig = event.headers?.['Stripe-Signature'] || event.headers?.['stripe-signature'];

  let evt;
  try {
    evt = verifyStripeWebhook(raw, sig, secret);
  } catch (e: any) {
    return json(400, { error: e?.message || 'signature verification failed' });
  }

  if (evt.type === 'checkout.session.completed' && evt.txnId) {
    try {
      await fulfillTransaction(evt.txnId);
    } catch (e: any) {
      // 500 lets Stripe retry; fulfillment is idempotent so retries are safe.
      return json(500, { error: e?.message || 'fulfillment failed' });
    }
  }

  return ok({ received: true });
};
