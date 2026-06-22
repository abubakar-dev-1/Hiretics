import { authed } from '../../lib/rbac';
import { ok, badRequest, notFound, forbidden, serverError } from '../../lib/response';
import { getTransaction } from '../../models/transaction';
import { getCompany } from '../../models/company';
import { fulfillTransaction } from '../../lib/billing/fulfill';
import { entitlementSummary } from '../../lib/entitlements';

/**
 * POST /billing/mock-confirm  (auth)
 * Offline-mode stand-in for the Stripe webhook: simulates a successful payment so
 * the full purchase flow works with no Stripe account. Only valid for mock txns
 * owned by the caller's company.
 */
export const handler = authed(async (event, ctx) => {
  try {
    const { txnId } = JSON.parse(event.body || '{}');
    if (!txnId) return badRequest('txnId is required');

    const txn = await getTransaction(txnId);
    if (!txn) return notFound('Transaction not found');
    if (txn.companyId !== ctx.companyId) return forbidden('Not your transaction');
    if (txn.provider !== 'mock') return badRequest('Transaction is not a mock checkout');

    await fulfillTransaction(txnId);

    const company = await getCompany(ctx.companyId);
    return ok({
      message: 'Payment confirmed',
      company: company && {
        ...company,
        entitlement: entitlementSummary(company.plan, company.aiAuthorCount),
      },
    });
  } catch (e: any) {
    return serverError(e?.message || 'mock confirm failed');
  }
});
