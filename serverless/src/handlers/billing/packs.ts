import type { APIGatewayProxyHandler } from 'aws-lambda';
import { ok } from '../../lib/response';
import { CREDIT_PACKS, PRO_PLAN, billingProviderName } from '../../lib/billing';

/** GET /billing/packs (public) — credit packs + Pro price + active provider. */
export const handler: APIGatewayProxyHandler = async () =>
  ok({ packs: CREDIT_PACKS, pro: PRO_PLAN, provider: billingProviderName() });
