import { adminOnly } from '../../lib/rbac';
import { ok, badRequest, serverError } from '../../lib/response';
import { createTransaction, setSessionId } from '../../models/transaction';
import { getBillingProvider, getPack, PRO_PLAN } from '../../lib/billing';

/**
 * POST /billing/checkout  (Admin)
 * body: { kind: 'credits' | 'pro', packId?: string }
 * Creates a pending Transaction and a provider checkout session. With the mock
 * provider it returns { mock: true } so the client confirms via /billing/mock-confirm.
 */
export const handler = adminOnly(async (event, ctx) => {
  try {
    const { kind, packId } = JSON.parse(event.body || '{}');

    let itemName: string;
    let amountCents: number;
    let currency: string;
    let credits: number | undefined;

    if (kind === 'credits') {
      const pack = getPack(packId);
      if (!pack) return badRequest('Unknown credit pack');
      itemName = `${pack.name} — ${pack.credits} credits`;
      amountCents = pack.amountCents;
      currency = pack.currency;
      credits = pack.credits;
    } else if (kind === 'pro') {
      itemName = 'Hiretics Pro';
      amountCents = PRO_PLAN.amountCents;
      currency = PRO_PLAN.currency;
    } else {
      return badRequest("kind must be 'credits' or 'pro'");
    }

    const provider = getBillingProvider();
    const txn = await createTransaction({
      companyId: ctx.companyId,
      kind,
      packId: kind === 'credits' ? packId : undefined,
      credits,
      amountCents,
      currency,
      provider: provider.name,
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const session = await provider.createCheckout({
      txnId: txn.txnId,
      kind,
      itemName,
      amountCents,
      currency,
      email: ctx.email,
      successUrl: `${appUrl}/pricing?status=success&txn=${txn.txnId}`,
      cancelUrl: `${appUrl}/pricing?status=cancel`,
    });

    await setSessionId(txn.txnId, session.sessionId);

    return ok({
      txnId: txn.txnId,
      provider: session.provider,
      url: session.url,
      mock: session.mock ?? false,
    });
  } catch (e: any) {
    return serverError(e?.message || 'checkout failed');
  }
});
