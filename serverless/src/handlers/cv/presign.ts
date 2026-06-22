import { candidateOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, forbidden, serverError } from '../../lib/response';
import { createThread, getThread, createCVVersion, listCVsByThread } from '../../models/cv';
import { presignAnalysisPut } from '../../lib/s3';
import type { CVMeta } from '../../models/cv';
import type { RemotePreference, EmploymentStatus } from '../../lib/ai/career';

const REMOTE: RemotePreference[] = ['remote', 'hybrid', 'onsite', 'any'];
const EMPLOYMENT: EmploymentStatus[] = ['employed', 'unemployed', 'freelancing', 'student', 'career-break'];

/**
 * POST /candidate/cv/presign  (Candidate)
 * Creates a CV version (and a thread if none given), returns a presigned PUT URL.
 * Uploading the PDF fires the analysis pipeline (S3 -> SQS -> analysis worker).
 */
export const handler = candidateOnly(async (event, ctx) => {
  try {
    const b = JSON.parse(event.body || '{}');

    const meta: CVMeta = {
      currentLocation: String(b.currentLocation || '').trim() || 'Not specified',
      targetLocation: b.targetLocation ? String(b.targetLocation) : undefined,
      remotePreference: REMOTE.includes(b.remotePreference) ? b.remotePreference : 'any',
      employmentStatus: EMPLOYMENT.includes(b.employmentStatus) ? b.employmentStatus : 'employed',
      careerAspiration: b.careerAspiration ? String(b.careerAspiration) : undefined,
    };

    // Resolve or create the thread (a thread groups CV versions over time).
    let threadId = b.threadId as string | undefined;
    if (threadId) {
      const thread = await getThread(threadId);
      if (!thread) return notFound('Thread not found');
      if (thread.candidateId !== ctx.userId) return forbidden('Not your thread');
    } else {
      const thread = await createThread(ctx.userId, b.title || 'My CV');
      threadId = thread.threadId;
    }

    const existing = threadId ? await listCVsByThread(threadId) : [];
    const label = b.label || `Version ${existing.length + 1}`;

    const version = await createCVVersion({
      candidateId: ctx.userId,
      threadId,
      label,
      meta,
    });

    const { uploadUrl, key } = await presignAnalysisPut(ctx.userId, version.cvId);
    return ok({ cvId: version.cvId, threadId, uploadUrl, key });
  } catch (e: any) {
    return serverError(e?.message || 'failed to presign CV upload');
  }
});
