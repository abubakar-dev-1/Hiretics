import { candidateOnly } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { listPublicCampaigns, toJobShape } from '../../models/campaign';

/** GET /jobs (Candidate) — the opt-in public job board. */
export const handler = candidateOnly(async () => {
  try {
    const campaigns = await listPublicCampaigns();
    return ok(campaigns.map(toJobShape));
  } catch (e: any) {
    return serverError(e?.message || 'failed to list jobs');
  }
});
