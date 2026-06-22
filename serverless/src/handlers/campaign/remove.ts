import { authed } from '../../lib/rbac';
import { ok, badRequest, notFound, serverError } from '../../lib/response';
import { getCampaign, deleteCampaign } from '../../models/campaign';

/** DELETE /campaigns/{id} (auth) — delete a campaign, company-scoped. */
export const handler = authed(async (event, ctx) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('campaign id required');
    const existing = await getCampaign(id);
    if (!existing || existing.companyId !== ctx.companyId) {
      return notFound('Campaign not found');
    }
    await deleteCampaign(id);
    return ok({ message: 'Campaign deleted' });
  } catch (e: any) {
    return serverError(e?.message || 'failed to delete campaign');
  }
});
