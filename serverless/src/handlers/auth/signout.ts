import type { APIGatewayProxyHandler } from 'aws-lambda';
import { ok } from '../../lib/response';

/**
 * POST /auth/signout — JWTs are stateless, so the client just discards the
 * token. This endpoint exists for a clean API surface and future token
 * blacklisting if needed.
 */
export const handler: APIGatewayProxyHandler = async () => ok({ message: 'Signed out' });
