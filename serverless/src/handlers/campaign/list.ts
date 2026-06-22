import { authed } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { listCampaignsByCompany, toCampaignShape } from '../../models/campaign';

/**
 * GET /campaigns?is_archived=true|false  (auth)
 * Lists the caller's company campaigns. Favourites are filtered client-side.
 */
export const handler = authed(async (event, ctx) => {
  try {
    const items = await listCampaignsByCompany(ctx.companyId);
    const isArchived = event.queryStringParameters?.is_archived;
    let filtered = items;
    if (isArchived === 'true') filtered = items.filter((c) => c.is_archived);
    else if (isArchived === 'false') filtered = items.filter((c) => !c.is_archived);
    return ok(filtered.map(toCampaignShape));
  } catch (e: any) {
    return serverError(e?.message || 'failed to list campaigns');
  }
});
