import { ok, badRequest, notFound, serverError } from '../../lib/response';
import { authed } from '../../lib/rbac';
import { getCandidate } from '../../models/candidate';
import { toApplicantShape } from './list';

/** GET /candidates/{id} (auth required) — single candidate, company-scoped. */
export const handler = authed(async (event, ctx) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('candidate id required');

    const candidate = await getCandidate(id);
    if (!candidate || candidate.companyId !== ctx.companyId) {
      return notFound('Candidate not found');
    }
    return ok(await toApplicantShape(candidate));
  } catch (e: any) {
    return serverError(e?.message || 'failed to get candidate');
  }
});
