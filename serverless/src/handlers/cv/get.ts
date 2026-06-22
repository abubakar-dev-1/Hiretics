import { candidateOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, forbidden, serverError } from '../../lib/response';
import { getCV } from '../../models/cv';

/** GET /candidate/cv/{id} (Candidate) — one CV version incl. its analysis report. */
export const handler = candidateOnly(async (event, ctx) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('cv id required');

    const cv = await getCV(id);
    if (!cv) return notFound('CV not found');
    if (cv.candidateId !== ctx.userId) return forbidden('Not your CV');

    return ok(cv);
  } catch (e: any) {
    return serverError(e?.message || 'failed to load CV');
  }
});
