import { adminOnly } from '../../lib/rbac';
import { ok, badRequest, serverError } from '../../lib/response';
import { addCredits, getCompany } from '../../models/company';

/** POST /credits/add (Admin) — top up the company's shared credit pool. */
export const handler = adminOnly(async (event, ctx) => {
  try {
    const { amount } = JSON.parse(event.body || '{}');
    const n = parseInt(String(amount), 10);
    if (!Number.isFinite(n) || n <= 0) return badRequest('amount must be a positive number');
    await addCredits(ctx.companyId, n);
    const company = await getCompany(ctx.companyId);
    return ok({ message: `Added ${n} credits`, availableCredits: company?.availableCredits ?? 0 });
  } catch (e: any) {
    return serverError(e?.message || 'failed to add credits');
  }
});
