import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { REGION, INTERNAL_ENDPOINT, PUBLIC_S3_ENDPOINT, LOCAL_CREDS } from './aws';

const BUCKET = process.env.RESUMES_BUCKET!;
const ANALYSIS_BUCKET = process.env.ANALYSIS_BUCKET!;

// SDK v3 auto-adds a CRC32 checksum that a plain browser/curl PUT can't satisfy.
// WHEN_REQUIRED keeps presigned URLs clean so a simple PUT works.
const NO_AUTO_CHECKSUM = { requestChecksumCalculation: 'WHEN_REQUIRED' as const };

// For server-side reads (worker fetching the PDF): LocalStack-internal endpoint.
const internalS3 = new S3Client({
  region: REGION,
  ...(INTERNAL_ENDPOINT ? { endpoint: INTERNAL_ENDPOINT } : {}),
  forcePathStyle: true,
  ...NO_AUTO_CHECKSUM,
  ...LOCAL_CREDS,
});

// For presigning the browser upload URL: browser-facing endpoint (localhost).
const publicS3 = new S3Client({
  region: REGION,
  endpoint: PUBLIC_S3_ENDPOINT,
  forcePathStyle: true,
  ...NO_AUTO_CHECKSUM,
  ...LOCAL_CREDS,
});

/** Deterministic key encodes both IDs so the worker can route from the S3 event. */
export const resumeKey = (campaignId: string, candidateId: string) =>
  `resumes/${campaignId}/${candidateId}.pdf`;

/** Presigned PUT URL the candidate's browser uploads to directly (direct-to-S3). */
export async function presignResumePut(campaignId: string, candidateId: string) {
  const key = resumeKey(campaignId, candidateId);
  // ContentType intentionally not signed, so any client (curl/browser) can PUT.
  const uploadUrl = await getSignedUrl(
    publicS3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 900 },
  );
  return { uploadUrl, key };
}

/** Fetch an object's bytes (worker reads the uploaded PDF). */
export async function getObjectBuffer(key: string): Promise<Buffer> {
  const res = await internalS3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const bytes = await res.Body!.transformToByteArray();
  return Buffer.from(bytes);
}

/** Presigned GET URL so a recruiter's browser can download a candidate's CV. */
export async function presignResumeGet(key: string): Promise<string> {
  return getSignedUrl(publicS3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: 3600,
  });
}

/* ── Candidate-side analysis bucket (Phase 11) ────────────────────────────── */

/** Key for a candidate's uploaded CV version (drives the analysis pipeline). */
export const analysisKey = (candidateId: string, cvId: string) =>
  `analysis/${candidateId}/${cvId}.pdf`;

/** Presigned PUT URL for a candidate to upload a CV version directly to S3. */
export async function presignAnalysisPut(candidateId: string, cvId: string) {
  const key = analysisKey(candidateId, cvId);
  const uploadUrl = await getSignedUrl(
    publicS3,
    new PutObjectCommand({ Bucket: ANALYSIS_BUCKET, Key: key }),
    { expiresIn: 900 },
  );
  return { uploadUrl, key };
}

/** Fetch an analysis-bucket object's bytes (analysis worker reads the PDF). */
export async function getAnalysisObjectBuffer(key: string): Promise<Buffer> {
  const res = await internalS3.send(
    new GetObjectCommand({ Bucket: ANALYSIS_BUCKET, Key: key }),
  );
  const bytes = await res.Body!.transformToByteArray();
  return Buffer.from(bytes);
}

/**
 * Copy a candidate's analysis-bucket CV into the recruiter resumes bucket,
 * triggering the existing ranking pipeline. Powers one-click apply.
 */
export async function copyAnalysisToResume(
  analysisObjectKey: string,
  campaignId: string,
  candidateId: string,
): Promise<string> {
  const destKey = resumeKey(campaignId, candidateId);
  await internalS3.send(
    new CopyObjectCommand({
      Bucket: BUCKET,
      Key: destKey,
      CopySource: `${ANALYSIS_BUCKET}/${analysisObjectKey}`,
    }),
  );
  return destKey;
}
