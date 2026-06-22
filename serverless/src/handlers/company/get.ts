import { authed } from '../../lib/rbac';
import { ok, notFound, serverError } from '../../lib/response';
import { getCompany } from '../../models/company';
import { entitlementSummary } from '../../lib/entitlements';

/** GET /company (auth) — company info + credit balance + plan entitlements. */
export const handler = authed(async (_event, ctx) => {
  try {
    const company = await getCompany(ctx.companyId);
    if (!company) return notFound('Company not found');
    return ok({ ...company, entitlement: entitlementSummary(company.plan, company.aiAuthorCount) });
  } catch (e: any) {
    return serverError(e?.message || 'failed to get company');
  }
});
