import { superAdminOnly } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { listAllCompanies } from '../../models/company';
import { listAllUsers } from '../../models/user';

/** GET /admin/tenants (SuperAdmin) — all companies with member counts. */
export const handler = superAdminOnly(async () => {
  try {
    const [companies, users] = await Promise.all([listAllCompanies(), listAllUsers()]);
    const counts: Record<string, number> = {};
    for (const u of users) counts[u.companyId] = (counts[u.companyId] ?? 0) + 1;

    const tenants = companies
      .map((c) => ({
        companyId: c.companyId,
        name: c.name,
        plan: c.plan,
        availableCredits: c.availableCredits,
        aiAuthorCount: c.aiAuthorCount,
        suspended: !!c.suspended,
        createdAt: c.createdAt,
        userCount: counts[c.companyId] ?? 0,
      }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return ok(tenants);
  } catch (e: any) {
    return serverError(e?.message || 'failed to list tenants');
  }
});
