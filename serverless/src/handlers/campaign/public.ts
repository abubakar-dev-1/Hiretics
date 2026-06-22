import type { APIGatewayProxyHandler } from 'aws-lambda';
import { ok, notFound, serverError } from '../../lib/response';
import { getCampaignByHash, toCampaignShape } from '../../models/campaign';

/**
 * GET /public/campaigns/{hash}  (public — the candidate apply page)
 * Returns the campaign in the snake_case shape the UI expects.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const hash = event.pathParameters?.hash;
    if (!hash) return notFound('Campaign not found');

    const campaign = await getCampaignByHash(hash);
    if (!campaign) return notFound('Campaign not found');

    return ok(toCampaignShape(campaign));
  } catch (e: any) {
    return serverError(e?.message || 'failed to load campaign');
  }
};
