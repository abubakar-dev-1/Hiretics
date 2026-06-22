import { authed } from '../../lib/rbac';
import { ok, badRequest, notFound, serverError } from '../../lib/response';
import { getCampaign, updateCampaign, toCampaignShape } from '../../models/campaign';

/** PUT /campaigns/{id} (auth) — update fields (edit, favorite, archive, status). */
export const handler = authed(async (event, ctx) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('campaign id required');
    const existing = await getCampaign(id);
    if (!existing || existing.companyId !== ctx.companyId) {
      return notFound('Campaign not found');
    }
    const patch = JSON.parse(event.body || '{}');
    const updated = await updateCampaign(id, patch);
    return ok(toCampaignShape(updated!));
  } catch (e: any) {
    return serverError(e?.message || 'failed to update campaign');
  }
});
