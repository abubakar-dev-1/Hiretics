import type { APIGatewayProxyHandler } from 'aws-lambda';
import { ok } from '../lib/response';

/**
 * Phase 0 health endpoint. Its real job is to prove the whole deploy toolchain
 * works: esbuild bundles TS -> serverless-localstack deploys -> API Gateway on
 * LocalStack routes to a live Lambda. If `GET /health` returns 200, the pipeline
 * we'll build the rest of the system on is sound.
 */
export const handler: APIGatewayProxyHandler = async () => {
  return ok({
    status: 'ok',
    service: 'hiretics-serverless',
    stage: process.env.STAGE ?? 'unknown',
    time: new Date().toISOString(),
  });
};
