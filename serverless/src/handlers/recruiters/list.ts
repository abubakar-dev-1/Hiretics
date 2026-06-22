import { adminOnly } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { listUsersByCompany, publicUser } from '../../models/user';

/** GET /recruiters (Admin) — list users in the company. */
export const handler = adminOnly(async (_event, ctx) => {
  try {
    const users = await listUsersByCompany(ctx.companyId);
    return ok(users.map(publicUser));
  } catch (e: any) {
    return serverError(e?.message || 'failed to list recruiters');
  }
});
