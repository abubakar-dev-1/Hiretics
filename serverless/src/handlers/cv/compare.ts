import { candidateOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, forbidden, serverError } from '../../lib/response';
import { getCV, createComparison } from '../../models/cv';
import { generateComparison } from '../../lib/ai/career';

/**
 * POST /candidate/compare  (Candidate)
 * body: { previousCvId, currentCvId } — AI comparison of two analyzed versions.
 */
export const handler = candidateOnly(async (event, ctx) => {
  try {
    const { previousCvId, currentCvId } = JSON.parse(event.body || '{}');
    if (!previousCvId || !currentCvId) {
      return badRequest('previousCvId and currentCvId are required');
    }
    if (previousCvId === currentCvId) return badRequest('Choose two different versions');

    const [prev, curr] = await Promise.all([getCV(previousCvId), getCV(currentCvId)]);
    if (!prev || !curr) return notFound('CV version not found');
    if (prev.candidateId !== ctx.userId || curr.candidateId !== ctx.userId) {
      return forbidden('Not your CV');
    }
    if (!prev.report || !curr.report) {
      return badRequest('Both versions must be analyzed before comparing');
    }

    const report = await generateComparison(previousCvId, currentCvId, prev.report, curr.report);
    const comparison = await createComparison({
      candidateId: ctx.userId,
      threadId: curr.threadId,
      previousCvId,
      currentCvId,
      report,
    });

    return ok(comparison);
  } catch (e: any) {
    return serverError(e?.message || 'comparison failed');
  }
});
