import { superAdminOnly } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { listAllTransactions } from '../../models/transaction';

/** GET /admin/revenue (SuperAdmin) — revenue rollups from paid transactions. */
export const handler = superAdminOnly(async () => {
  try {
    const txns = await listAllTransactions();
    const paid = txns.filter((t) => t.status === 'paid');

    const totalCents = paid.reduce((s, t) => s + t.amountCents, 0);
    const creditsRevenueCents = paid
      .filter((t) => t.kind === 'credits')
      .reduce((s, t) => s + t.amountCents, 0);
    const proRevenueCents = paid
      .filter((t) => t.kind === 'pro')
      .reduce((s, t) => s + t.amountCents, 0);

    // Revenue per day (for a simple chart).
    const byDay: Record<string, number> = {};
    for (const t of paid) {
      const day = (t.paidAt || t.createdAt).slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + t.amountCents;
    }

    const recent = paid
      .slice()
      .sort((a, b) => ((a.paidAt || a.createdAt) < (b.paidAt || b.createdAt) ? 1 : -1))
      .slice(0, 20)
      .map((t) => ({
        txnId: t.txnId,
        companyId: t.companyId,
        kind: t.kind,
        credits: t.credits,
        amountCents: t.amountCents,
        currency: t.currency,
        provider: t.provider,
        paidAt: t.paidAt || t.createdAt,
      }));

    return ok({
      currency: paid[0]?.currency || 'usd',
      totalCents,
      creditsRevenueCents,
      proRevenueCents,
      paidCount: paid.length,
      pendingCount: txns.filter((t) => t.status === 'pending').length,
      byDay,
      recent,
    });
  } catch (e: any) {
    return serverError(e?.message || 'failed to load revenue');
  }
});
