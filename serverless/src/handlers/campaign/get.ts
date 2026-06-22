import { authed } from '../../lib/rbac';
import { ok, badRequest, notFound, serverError } from '../../lib/response';
import { getCampaign, toCampaignShape } from '../../models/campaign';

/** GET /campaigns/{id} (auth) — single campaign, company-scoped. */
export const handler = authed(async (event, ctx) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('campaign id required');
    const campaign = await getCampaign(id);
    if (!campaign || campaign.companyId !== ctx.companyId) {
      return notFound('Campaign not found');
    }
    return ok(toCampaignShape(campaign));
  } catch (e: any) {
    return serverError(e?.message || 'failed to get campaign');
  }
});
