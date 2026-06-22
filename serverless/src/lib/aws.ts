/**
 * Centralized AWS/LocalStack endpoint logic.
 *
 * Two different endpoints matter on LocalStack:
 *  - INTERNAL: how a Lambda (running in a child container) reaches LocalStack.
 *    LocalStack injects LOCALSTACK_HOSTNAME into the Lambda runtime for this.
 *  - PUBLIC_S3: the host the *browser* will use for a presigned upload URL.
 *    Must be localhost:4566 so the candidate's browser can PUT the file.
 */
export const REGION = process.env.AWS_REGION || 'us-east-1';
export const IS_LOCAL = (process.env.STAGE ?? 'local') === 'local';

export const INTERNAL_ENDPOINT = IS_LOCAL
  ? process.env.AWS_ENDPOINT_URL ||
    (process.env.LOCALSTACK_HOSTNAME
      ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
      : 'http://host.docker.internal:4566')
  : undefined;

/** Browser-facing S3 endpoint used only for presigning upload URLs. */
export const PUBLIC_S3_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:4566';

export const LOCAL_CREDS = IS_LOCAL
  ? { credentials: { accessKeyId: 'test', secretAccessKey: 'test' } }
  : {};
