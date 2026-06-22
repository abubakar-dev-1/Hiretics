import { candidateOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, forbidden, serverError } from '../../lib/response';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { getCV } from '../../models/cv';
import { getCampaign } from '../../models/campaign';
import { getAnalysisObjectBuffer } from '../../lib/s3';
import { generateTailor } from '../../lib/ai/career';

/**
 * POST /candidate/tailor  (Candidate)
 * body: { cvId, campaignId } — tailor the candidate's CV to a specific job using
 * that campaign's criteria, returning a predicted match score + targeted edits.
 * This is the intellectual justification for the RoleNorth↔Hiretics merge.
 */
export const handler = candidateOnly(async (event, ctx) => {
  try {
    const { cvId, campaignId } = JSON.parse(event.body || '{}');
    if (!cvId || !campaignId) return badRequest('cvId and campaignId are required');

    const [cv, campaign] = await Promise.all([getCV(cvId), getCampaign(campaignId)]);
    if (!cv) return notFound('CV not found');
    if (cv.candidateId !== ctx.userId) return forbidden('Not your CV');
    if (!campaign || campaign.visibility !== 'public') return notFound('Job not found');

    // Re-extract the CV text from S3 (we don't store the raw text).
    let resumeText = '';
    try {
      const buf = await getAnalysisObjectBuffer(cv.s3Key);
      resumeText = (await pdfParse(buf)).text || '';
    } catch {
      return badRequest('Could not read the CV file');
    }
    if (!resumeText.trim()) return badRequest('CV has no extractable text');

    const result = await generateTailor({
      resumeText,
      jobRole: campaign.job_role,
      jobDescription: campaign.job_description,
      criteria: campaign.criteria,
    });

    return ok({ campaignId, cvId, ...result });
  } catch (e: any) {
    return serverError(e?.message || 'tailor failed');
  }
});
