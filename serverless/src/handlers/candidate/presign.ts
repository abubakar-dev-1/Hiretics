import type { APIGatewayProxyHandler } from 'aws-lambda';
import { badRequest, created, notFound, serverError } from '../../lib/response';
import { getCampaign } from '../../models/campaign';
import { createCandidate } from '../../models/candidate';
import { presignResumePut } from '../../lib/s3';

/**
 * POST /candidates/presign  (public — candidates aren't authenticated)
 * Body: { campaignId, fullName, email }
 *
 * Creates a Candidate(status=Pending) and returns a presigned S3 PUT URL the
 * browser uploads the PDF to directly. The upload then triggers the pipeline.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { campaignId } = body;
    if (!campaignId) return badRequest('campaignId is required');

    const campaign = await getCampaign(campaignId);
    if (!campaign) return notFound('Campaign not found');
    if (campaign.status === 'completed' || campaign.is_archived) {
      return badRequest('This campaign is not accepting applications');
    }

    // Name/email are optional — the AI extracts them from the CV. The public
    // apply page only collects a file, so these default and get filled later.
    const candidate = await createCandidate({
      campaignId,
      companyId: campaign.companyId,
      fullName: body.fullName || 'Applicant',
      email: body.email || '',
    });

    const { uploadUrl, key } = await presignResumePut(campaignId, candidate.candidateId);

    return created({
      candidateId: candidate.candidateId,
      uploadUrl, // browser does: PUT uploadUrl with the PDF body
      key,
    });
  } catch (e: any) {
    return serverError(e?.message || 'presign failed');
  }
};
