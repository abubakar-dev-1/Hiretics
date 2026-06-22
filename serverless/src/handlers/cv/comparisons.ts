import { candidateOnly } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { listComparisonsByCandidate } from '../../models/cv';

/** GET /candidate/comparisons (Candidate) — saved version comparisons. */
export const handler = candidateOnly(async (_event, ctx) => {
  try {
    return ok(await listComparisonsByCandidate(ctx.userId));
  } catch (e: any) {
    return serverError(e?.message || 'failed to list comparisons');
  }
});
