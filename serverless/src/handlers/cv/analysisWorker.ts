import type { SQSHandler, SQSRecord } from 'aws-lambda';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { getAnalysisObjectBuffer } from '../../lib/s3';
import {
  getCV,
  setCVStatus,
  applyCVReport,
  listCVsByThread,
} from '../../models/cv';
import { generateCareerAnalysis, summarizeReportForContext } from '../../lib/ai/career';
import type { AnalysisInput } from '../../lib/ai/career';

/**
 * SQS-triggered analysis worker — the candidate-side event-driven pipeline
 * (mirrors the recruiter ranking worker). S3 upload -> SQS -> here -> AI career
 * report -> DynamoDB -> WebSocket. DLQ after maxReceiveCount on repeated failure.
 */
export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    await processRecord(record);
  }
};

async function emitAnalyzed(candidateId: string, payload: Record<string, unknown>): Promise<void> {
  const url = process.env.SOCKET_SERVER_URL;
  if (!url) return;
  try {
    await fetch(`${url}/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-emit-secret': process.env.EMIT_SECRET || 'worker-emit-secret',
      },
      // Candidates are self-scoped (companyId === userId), so the socket room is company:{candidateId}.
      body: JSON.stringify({ companyId: candidateId, event: 'cv.analyzed', payload }),
    });
  } catch (e: any) {
    console.warn('WebSocket emit failed (non-fatal):', e?.message);
  }
}

async function processRecord(record: SQSRecord): Promise<void> {
  const s3event = JSON.parse(record.body);
  const s3 = s3event?.Records?.[0]?.s3;
  if (!s3) {
    console.log('Skipping non-S3 message (likely s3:TestEvent)');
    return;
  }

  // key = analysis/{candidateId}/{cvId}.pdf
  const key = decodeURIComponent(String(s3.object.key).replace(/\+/g, ' '));
  const [, candidateId, file] = key.split('/');
  const cvId = (file || '').replace(/\.pdf$/i, '');

  const cv = await getCV(cvId);
  if (!cv) {
    console.error('Missing CV version', { cvId, candidateId });
    return;
  }
  if (cv.status === 'analyzed') {
    console.log(`CV ${cvId} already analyzed — idempotent skip`);
    return;
  }

  await setCVStatus(cvId, 'analyzing');

  // Extract text. Unreadable PDF => failed (manual retry), not an infinite retry.
  let resumeText = '';
  try {
    const buf = await getAnalysisObjectBuffer(key);
    resumeText = (await pdfParse(buf)).text || '';
  } catch (e: any) {
    await setCVStatus(cvId, 'failed', 'Could not read PDF');
    console.error('PDF parse failed:', e?.message);
    return;
  }
  if (!resumeText.trim()) {
    await setCVStatus(cvId, 'failed', 'No extractable text (scanned PDF?)');
    return;
  }

  // Provide the prior version's report as context so the AI can note progress.
  let previousReportSummary: string | undefined;
  try {
    const versions = await listCVsByThread(cv.threadId);
    const prior = versions
      .filter((v) => v.cvId !== cvId && v.report)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    if (prior?.report) previousReportSummary = summarizeReportForContext(prior.report);
  } catch {
    /* non-fatal */
  }

  try {
    const input: AnalysisInput = { ...cv.meta, resumeText, previousReportSummary };
    const report = await generateCareerAnalysis(input);
    await applyCVReport(cvId, report);
    console.log(`Analyzed CV ${cvId} for ${candidateId} = ${report.overallReadinessScore}/100`);
    await emitAnalyzed(candidateId, {
      cvId,
      threadId: cv.threadId,
      readinessScore: report.overallReadinessScore,
    });
  } catch (e: any) {
    await setCVStatus(cvId, 'failed', e?.message || 'analysis failed');
    console.error('Career analysis failed, will retry:', e?.message);
    throw e; // -> SQS retry -> DLQ after maxReceiveCount
  }
}
