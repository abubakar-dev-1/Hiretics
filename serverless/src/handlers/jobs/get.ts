import { candidateOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, serverError } from '../../lib/response';
import { getCampaign, toJobShape } from '../../models/campaign';

/** GET /jobs/{id} (Candidate) — a single public job. Private jobs are hidden. */
export const handler = candidateOnly(async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('job id required');

    const campaign = await getCampaign(id);
    if (!campaign || campaign.visibility !== 'public' || campaign.is_archived) {
      return notFound('Job not found');
    }
    return ok(toJobShape(campaign));
  } catch (e: any) {
    return serverError(e?.message || 'failed to load job');
  }
});
