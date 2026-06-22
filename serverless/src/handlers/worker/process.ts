import type { SQSHandler, SQSRecord } from 'aws-lambda';
// pdf-parse index.js has bundler-hostile debug code; import the lib directly.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { getObjectBuffer } from '../../lib/s3';
import { getCampaign } from '../../models/campaign';
import {
  getCandidate,
  applyAnalysis,
  setCandidateStatus,
} from '../../models/candidate';
import { deductCredit, addCredits, getCompany } from '../../models/company';
import { getAiProvider } from '../../lib/ai';

/**
 * SQS-triggered worker — the heart of the event-driven pipeline.
 * Implements report Algorithm 2: parse -> atomic credit deduct -> AI score -> persist.
 * Throwing makes SQS retry; after maxReceiveCount the message goes to the DLQ.
 */
export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    await processRecord(record);
  }
};

/** Push a live "candidate scored" event to the Socket.io server. Never throws. */
async function emitScored(companyId: string, payload: Record<string, unknown>): Promise<void> {
  const url = process.env.SOCKET_SERVER_URL;
  if (!url) return;
  try {
    await fetch(`${url}/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-emit-secret': process.env.EMIT_SECRET || 'worker-emit-secret',
      },
      body: JSON.stringify({ companyId, event: 'candidate.scored', payload }),
    });
  } catch (e: any) {
    console.warn('WebSocket emit failed (non-fatal):', e?.message);
  }
}

async function processRecord(record: SQSRecord): Promise<void> {
  // The SQS body is the raw S3 event notification (or a test event we ignore).
  const s3event = JSON.parse(record.body);
  const s3 = s3event?.Records?.[0]?.s3;
  if (!s3) {
    console.log('Skipping non-S3 message (likely s3:TestEvent)');
    return;
  }

  // key = resumes/{campaignId}/{candidateId}.pdf
  const key = decodeURIComponent(String(s3.object.key).replace(/\+/g, ' '));
  const [, campaignId, file] = key.split('/');
  const candidateId = (file || '').replace(/\.pdf$/i, '');

  const [candidate, campaign] = await Promise.all([
    getCandidate(candidateId),
    getCampaign(campaignId),
  ]);
  if (!candidate || !campaign) {
    console.error('Missing records', { candidateId, campaignId });
    return; // nothing to retry against
  }
  if (candidate.status === 'Scored') {
    console.log(`Candidate ${candidateId} already scored — idempotent skip`);
    return;
  }

  // 0) Suspended-tenant gate (Platform-Owner action) — hold, don't consume credit.
  const company = await getCompany(campaign.companyId);
  if (company?.suspended) {
    await setCandidateStatus(candidateId, 'Manual Review');
    console.warn(`Company ${campaign.companyId} suspended — holding candidate ${candidateId}`);
    return;
  }

  // 1) Atomic credit gate — no credits => no AI.
  const hasCredit = await deductCredit(campaign.companyId);
  if (!hasCredit) {
    await setCandidateStatus(candidateId, 'Pending Credits');
    console.warn(`No credits for company ${campaign.companyId}`);
    return;
  }

  // 2) Extract text. Unreadable (scanned) PDFs => manual review (not an error).
  let resumeText = '';
  try {
    const buf = await getObjectBuffer(key);
    resumeText = (await pdfParse(buf)).text || '';
  } catch (e: any) {
    await addCredits(campaign.companyId, 1); // refund — we never used the AI
    await setCandidateStatus(candidateId, 'Manual Review');
    console.error('PDF parse failed:', e?.message);
    return;
  }
  if (!resumeText.trim()) {
    await addCredits(campaign.companyId, 1);
    await setCandidateStatus(candidateId, 'Manual Review');
    return;
  }

  // 3) AI scoring. On transient failure, refund + rethrow so SQS retries.
  try {
    const ai = getAiProvider();
    const analysis = await ai.analyze({
      resumeText,
      jobDescription: campaign.job_description,
      jobRole: campaign.job_role,
      criteria: campaign.criteria,
    });
    await applyAnalysis(candidateId, analysis);
    console.log(
      `Scored ${candidate.fullName} (${candidateId}) = ${analysis.score} [${analysis.relevance}] via ${ai.name}`,
    );
    await emitScored(campaign.companyId, {
      campaignId,
      candidateId,
      name: analysis.name,
      score: analysis.score,
      relevance: analysis.relevance,
    });
  } catch (e: any) {
    await addCredits(campaign.companyId, 1);
    console.error('AI scoring failed, will retry:', e?.message);
    throw e; // -> SQS retry -> DLQ after maxReceiveCount
  }
}
