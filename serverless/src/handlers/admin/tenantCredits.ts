import { superAdminOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, serverError } from '../../lib/response';
import { getCompany, addCredits } from '../../models/company';

/**
 * POST /admin/tenants/{id}/credits  (SuperAdmin)
 * body: { amount: number }  — grant complimentary credits to a tenant.
 */
export const handler = superAdminOnly(async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('tenant id required');
    const { amount } = JSON.parse(event.body || '{}');
    const n = parseInt(String(amount), 10);
    if (!Number.isFinite(n) || n <= 0) return badRequest('amount must be a positive number');

    const company = await getCompany(id);
    if (!company) return notFound('Tenant not found');

    await addCredits(id, n);
    const updated = await getCompany(id);
    return ok({ companyId: id, availableCredits: updated?.availableCredits ?? 0, granted: n });
  } catch (e: any) {
    return serverError(e?.message || 'failed to grant credits');
  }
});
