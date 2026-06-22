import { candidateOnly } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { listThreadsByCandidate } from '../../models/cv';

/** GET /candidate/threads (Candidate) — all of the candidate's CV threads. */
export const handler = candidateOnly(async (_event, ctx) => {
  try {
    return ok(await listThreadsByCandidate(ctx.userId));
  } catch (e: any) {
    return serverError(e?.message || 'failed to list threads');
  }
});
