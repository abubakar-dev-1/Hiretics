import { authed } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { listByCompany } from '../../models/transaction';

/** GET /billing/transactions (auth) — the company's purchase history. */
export const handler = authed(async (_event, ctx) => {
  try {
    return ok(await listByCompany(ctx.companyId));
  } catch (e: any) {
    return serverError(e?.message || 'failed to list transactions');
  }
});
