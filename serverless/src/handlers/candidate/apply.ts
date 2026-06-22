import { candidateOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, forbidden, serverError } from '../../lib/response';
import { getCV } from '../../models/cv';
import { getCampaign } from '../../models/campaign';
import { getUser } from '../../models/user';
import { createCandidate } from '../../models/candidate';
import { copyAnalysisToResume } from '../../lib/s3';

/**
 * POST /candidate/apply  (Candidate)
 * body: { campaignId, cvId } — one-click apply. Creates an applicant record in
 * the campaign and copies the candidate's CV into the recruiter resumes bucket,
 * which fires the existing ranking pipeline (S3 -> SQS -> worker -> AI score).
 */
export const handler = candidateOnly(async (event, ctx) => {
  try {
    const { campaignId, cvId } = JSON.parse(event.body || '{}');
    if (!campaignId || !cvId) return badRequest('campaignId and cvId are required');

    const [campaign, cv, user] = await Promise.all([
      getCampaign(campaignId),
      getCV(cvId),
      getUser(ctx.userId),
    ]);
    if (!campaign || campaign.visibility !== 'public' || campaign.is_archived) {
      return notFound('Job not found or not accepting applications');
    }
    if (!cv) return notFound('CV not found');
    if (cv.candidateId !== ctx.userId) return forbidden('Not your CV');

    // Create the applicant in the recruiter's campaign, then drop the CV into the
    // resumes bucket at the exact key the worker routes from.
    const applicant = await createCandidate({
      campaignId,
      companyId: campaign.companyId,
      fullName: user?.fullName || ctx.email,
      email: ctx.email,
    });
    await copyAnalysisToResume(cv.s3Key, campaignId, applicant.candidateId);

    return ok({
      applied: true,
      campaignId,
      candidateId: applicant.candidateId,
      status: 'Pending', // ranking pipeline will score it asynchronously
    });
  } catch (e: any) {
    return serverError(e?.message || 'apply failed');
  }
});
