import { PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ddb, TABLES } from '../lib/dynamo';
import { analysisKey } from '../lib/s3';
import type {
  CareerAnalysisReport,
  ComparisonReport,
  RemotePreference,
  EmploymentStatus,
} from '../lib/ai/career';

export type CVStatus = 'pending' | 'analyzing' | 'analyzed' | 'failed';

/** Context the candidate supplies at upload; the worker passes it to the AI. */
export interface CVMeta {
  currentLocation: string;
  targetLocation?: string;
  remotePreference: RemotePreference;
  employmentStatus: EmploymentStatus;
  careerAspiration?: string;
}

export interface CVThread {
  threadId: string;
  candidateId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  versionCount: number;
  latestCvId?: string;
  latestScore?: number;
}

export interface CVVersion {
  cvId: string;
  threadId: string;
  candidateId: string;
  label: string;
  s3Key: string;
  status: CVStatus;
  meta: CVMeta;
  createdAt: string;
  readinessScore?: number;
  report?: CareerAnalysisReport;
  error?: string;
}

export interface CVComparison {
  comparisonId: string;
  candidateId: string;
  threadId: string;
  previousCvId: string;
  currentCvId: string;
  report: ComparisonReport;
  createdAt: string;
}

/* ── Threads ─────────────────────────────────────────────────────────────── */

export async function createThread(candidateId: string, title: string): Promise<CVThread> {
  const now = new Date().toISOString();
  const thread: CVThread = {
    threadId: uuidv4(),
    candidateId,
    title: title || 'My CV',
    createdAt: now,
    updatedAt: now,
    versionCount: 0,
  };
  await ddb.send(new PutCommand({ TableName: TABLES.cvThreads, Item: thread }));
  return thread;
}

export async function getThread(threadId: string): Promise<CVThread | null> {
  const res = await ddb.send(new GetCommand({ TableName: TABLES.cvThreads, Key: { threadId } }));
  return (res.Item as CVThread) ?? null;
}

export async function listThreadsByCandidate(candidateId: string): Promise<CVThread[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.cvThreads,
      IndexName: 'CandidateIndex',
      KeyConditionExpression: 'candidateId = :c',
      ExpressionAttributeValues: { ':c': candidateId },
      ScanIndexForward: false,
    }),
  );
  return (res.Items as CVThread[]) ?? [];
}

/* ── CV versions ─────────────────────────────────────────────────────────── */

export async function createCVVersion(input: {
  candidateId: string;
  threadId: string;
  label: string;
  meta: CVMeta;
}): Promise<CVVersion> {
  const cvId = uuidv4();
  const version: CVVersion = {
    cvId,
    threadId: input.threadId,
    candidateId: input.candidateId,
    label: input.label || 'Version',
    s3Key: analysisKey(input.candidateId, cvId),
    status: 'pending',
    meta: input.meta,
    createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLES.cvVersions, Item: version }));
  return version;
}

export async function getCV(cvId: string): Promise<CVVersion | null> {
  const res = await ddb.send(new GetCommand({ TableName: TABLES.cvVersions, Key: { cvId } }));
  return (res.Item as CVVersion) ?? null;
}

export async function listCVsByThread(threadId: string): Promise<CVVersion[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.cvVersions,
      IndexName: 'ThreadIndex',
      KeyConditionExpression: 'threadId = :t',
      ExpressionAttributeValues: { ':t': threadId },
      ScanIndexForward: true, // oldest first (version order)
    }),
  );
  return (res.Items as CVVersion[]) ?? [];
}

export async function setCVStatus(cvId: string, status: CVStatus, error?: string): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.cvVersions,
      Key: { cvId },
      UpdateExpression: 'SET #s = :s' + (error ? ', #e = :e' : ''),
      ExpressionAttributeNames: { '#s': 'status', ...(error ? { '#e': 'error' } : {}) },
      ExpressionAttributeValues: { ':s': status, ...(error ? { ':e': error } : {}) },
    }),
  );
}

/** Persist the AI report on a version and roll the thread's latest pointers forward. */
export async function applyCVReport(cvId: string, report: CareerAnalysisReport): Promise<void> {
  const cv = await getCV(cvId);
  if (!cv) return;
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.cvVersions,
      Key: { cvId },
      UpdateExpression:
        'SET #s = :analyzed, report = :r, readinessScore = :score',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':analyzed': 'analyzed',
        ':r': report,
        ':score': report.overallReadinessScore,
      },
    }),
  );
  const versions = await listCVsByThread(cv.threadId);
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.cvThreads,
      Key: { threadId: cv.threadId },
      UpdateExpression:
        'SET versionCount = :n, latestCvId = :cv, latestScore = :score, updatedAt = :now',
      ExpressionAttributeValues: {
        ':n': versions.length,
        ':cv': cvId,
        ':score': report.overallReadinessScore,
        ':now': new Date().toISOString(),
      },
    }),
  );
}

/* ── Comparisons ─────────────────────────────────────────────────────────── */

export async function createComparison(input: {
  candidateId: string;
  threadId: string;
  previousCvId: string;
  currentCvId: string;
  report: ComparisonReport;
}): Promise<CVComparison> {
  const comparison: CVComparison = {
    comparisonId: uuidv4(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLES.cvComparisons, Item: comparison }));
  return comparison;
}

export async function listComparisonsByCandidate(candidateId: string): Promise<CVComparison[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.cvComparisons,
      IndexName: 'CandidateIndex',
      KeyConditionExpression: 'candidateId = :c',
      ExpressionAttributeValues: { ':c': candidateId },
      ScanIndexForward: false,
    }),
  );
  return (res.Items as CVComparison[]) ?? [];
}
