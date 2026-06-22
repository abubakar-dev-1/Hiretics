import { authed } from '../../lib/rbac';
import { created, badRequest, serverError } from '../../lib/response';
import { createCampaign, toCampaignShape } from '../../models/campaign';

/** POST /campaigns (auth) — create a campaign for the caller's company. */
export const handler = authed(async (event, ctx) => {
  try {
    const b = JSON.parse(event.body || '{}');
    if (!b.name || !b.job_role || !b.job_description) {
      return badRequest('name, job_role and job_description are required');
    }
    const campaign = await createCampaign({
      companyId: ctx.companyId,
      createdByUserId: ctx.userId,
      name: b.name,
      company_name: b.company_name || '',
      job_role: b.job_role,
      job_description: b.job_description,
      start_date: b.start_date,
      end_date: b.end_date,
      criteria: b.criteria,
      visibility: b.visibility === 'public' ? 'public' : 'private',
    });
    return created(toCampaignShape(campaign));
  } catch (e: any) {
    return serverError(e?.message || 'failed to create campaign');
  }
});
