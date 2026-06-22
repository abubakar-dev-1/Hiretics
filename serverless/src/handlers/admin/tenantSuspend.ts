import { superAdminOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, serverError } from '../../lib/response';
import { getCompany, setSuspended } from '../../models/company';

/**
 * POST /admin/tenants/{id}/suspend  (SuperAdmin)
 * body: { suspended: boolean }  — suspend or reactivate a tenant.
 */
export const handler = superAdminOnly(async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('tenant id required');
    const { suspended } = JSON.parse(event.body || '{}');
    if (typeof suspended !== 'boolean') return badRequest('suspended (boolean) required');

    const company = await getCompany(id);
    if (!company) return notFound('Tenant not found');

    await setSuspended(id, suspended);
    return ok({ companyId: id, suspended });
  } catch (e: any) {
    return serverError(e?.message || 'failed to update tenant');
  }
});
