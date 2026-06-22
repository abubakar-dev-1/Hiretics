import { ok, badRequest, notFound, serverError } from '../../lib/response';
import { authed } from '../../lib/rbac';
import { listRankedByCampaign, type Candidate } from '../../models/candidate';
import { getCampaign } from '../../models/campaign';
import { presignResumeGet } from '../../lib/s3';

/**
 * GET /campaigns/{id}/candidates  (auth required)
 * Ranked candidate list, scoped to the caller's company (multi-tenancy).
 */
export const handler = authed(async (event, ctx) => {
  try {
    const campaignId = event.pathParameters?.id;
    if (!campaignId) return badRequest('campaign id required');

    const campaign = await getCampaign(campaignId);
    if (!campaign || campaign.companyId !== ctx.companyId) {
      return notFound('Campaign not found');
    }

    const candidates = await listRankedByCampaign(campaignId);
    const data = await Promise.all(candidates.map(toApplicantShape));
    return ok(data);
  } catch (e: any) {
    return serverError(e?.message || 'failed to list candidates');
  }
});

export async function toApplicantShape(c: Candidate) {
  return {
    id: c.candidateId,
    name: c.fullName,
    email: c.email,
    cv_link: await presignResumeGet(c.s3ResumeKey),
    score: c.aiScore ?? 0,
    city: c.city ?? '',
    university: c.university ?? '',
    age: c.age ?? 0,
    scoring_breakdown: c.scoringBreakdown ?? null,
    matched_skills: c.matchedSkills ?? [],
    matched_keywords: c.matchedKeywords ?? [],
    relevance: c.relevance ?? 'medium',
    ranking_reason: c.aiReasoning ?? '',
    status: c.status,
  };
}
