import { candidateOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, forbidden, serverError } from '../../lib/response';
import { getThread, listCVsByThread } from '../../models/cv';

/** GET /candidate/threads/{id} (Candidate) — a thread plus its CV versions. */
export const handler = candidateOnly(async (event, ctx) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('thread id required');

    const thread = await getThread(id);
    if (!thread) return notFound('Thread not found');
    if (thread.candidateId !== ctx.userId) return forbidden('Not your thread');

    const versions = await listCVsByThread(id);
    return ok({ thread, versions });
  } catch (e: any) {
    return serverError(e?.message || 'failed to load thread');
  }
});
