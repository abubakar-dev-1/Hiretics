import { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ddb, TABLES } from '../lib/dynamo';
import { resumeKey } from '../lib/s3';
import type { CvAnalysis } from '../lib/ai';

export type CandidateStatus =
  | 'Pending'
  | 'Scored'
  | 'Manual Review'
  | 'Pending Credits'
  | 'Rejected';

export interface Candidate {
  candidateId: string;
  campaignId: string;
  companyId: string;
  fullName: string;
  email: string;
  s3ResumeKey: string;
  aiScore: number; // 0 until scored (so it's indexed in CampaignScoreIndex)
  status: CandidateStatus;
  appliedAt: string;
  // populated after scoring:
  scoringBreakdown?: CvAnalysis['scoring_breakdown'];
  matchedSkills?: string[];
  matchedKeywords?: string[];
  relevance?: string;
  aiReasoning?: string;
  city?: string;
  university?: string;
  age?: number;
  scoredAt?: string;
}

export async function createCandidate(input: {
  campaignId: string;
  companyId: string;
  fullName: string;
  email: string;
}): Promise<Candidate> {
  const candidateId = uuidv4();
  const candidate: Candidate = {
    candidateId,
    campaignId: input.campaignId,
    companyId: input.companyId,
    fullName: input.fullName,
    email: input.email,
    s3ResumeKey: resumeKey(input.campaignId, candidateId),
    aiScore: 0,
    status: 'Pending',
    appliedAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLES.candidates, Item: candidate }));
  return candidate;
}

export async function getCandidate(candidateId: string): Promise<Candidate | null> {
  const res = await ddb.send(
    new GetCommand({ TableName: TABLES.candidates, Key: { candidateId } }),
  );
  return (res.Item as Candidate) ?? null;
}

export async function setCandidateStatus(
  candidateId: string,
  status: CandidateStatus,
): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.candidates,
      Key: { candidateId },
      UpdateExpression: 'SET #s = :s',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': status },
    }),
  );
}

/** Write the AI result and flip status to Scored. */
export async function applyAnalysis(
  candidateId: string,
  a: CvAnalysis,
): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.candidates,
      Key: { candidateId },
      UpdateExpression:
        'SET aiScore = :score, scoringBreakdown = :b, matchedSkills = :ms, matchedKeywords = :mk, relevance = :rel, aiReasoning = :reason, city = :city, university = :uni, age = :age, fullName = :name, email = :email, #s = :scored, scoredAt = :now',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':score': a.score,
        ':b': a.scoring_breakdown,
        ':ms': a.matched_skills,
        ':mk': a.matched_keywords,
        ':rel': a.relevance,
        ':reason': a.ranking_reason,
        ':city': a.city,
        ':uni': a.university,
        ':age': a.age,
        ':name': a.name && a.name !== 'Unknown' ? a.name : 'Applicant',
        ':email': a.email || '',
        ':scored': 'Scored',
        ':now': new Date().toISOString(),
      },
    }),
  );
}

/** All scored candidates for a company (for analytics). Scan is fine at demo scale. */
export async function scanScoredByCompany(companyId: string): Promise<Candidate[]> {
  const res = await ddb.send(
    new ScanCommand({
      TableName: TABLES.candidates,
      FilterExpression: 'companyId = :c AND #s = :scored',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':c': companyId, ':scored': 'Scored' },
    }),
  );
  return (res.Items as Candidate[]) ?? [];
}

/** All candidates for a company (any status) — for counts/overview. */
export async function scanAllByCompany(companyId: string): Promise<Candidate[]> {
  const res = await ddb.send(
    new ScanCommand({
      TableName: TABLES.candidates,
      FilterExpression: 'companyId = :c',
      ExpressionAttributeValues: { ':c': companyId },
    }),
  );
  return (res.Items as Candidate[]) ?? [];
}

/** Platform-wide candidate counts by status (Platform-Owner pipeline metrics). */
export async function countAllByStatus(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  let ExclusiveStartKey: Record<string, any> | undefined;
  do {
    const res = await ddb.send(
      new ScanCommand({
        TableName: TABLES.candidates,
        ProjectionExpression: '#s',
        ExpressionAttributeNames: { '#s': 'status' },
        ExclusiveStartKey,
      }),
    );
    for (const item of (res.Items as { status: string }[]) ?? []) {
      counts[item.status] = (counts[item.status] ?? 0) + 1;
    }
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return counts;
}

/** Ranked candidate list for a campaign (highest score first). */
export async function listRankedByCampaign(campaignId: string): Promise<Candidate[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.candidates,
      IndexName: 'CampaignScoreIndex',
      KeyConditionExpression: 'campaignId = :c',
      ExpressionAttributeValues: { ':c': campaignId },
      ScanIndexForward: false, // descending by aiScore
    }),
  );
  return (res.Items as Candidate[]) ?? [];
}
