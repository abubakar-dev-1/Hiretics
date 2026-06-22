import {
  GetCommand,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ddb, TABLES } from '../lib/dynamo';

/**
 * Campaign stored in the snake_case shape the existing Next.js dashboard uses,
 * so the frontend reuses with zero component changes. Internal-only fields
 * (campaignId, companyId, publicHash, createdAt) stay camelCase.
 */
export interface Campaign {
  campaignId: string;
  companyId: string;
  createdByUserId: string;
  name: string;
  company_name: string;
  job_role: string;
  job_description: string;
  status: string; // 'not-started' | 'ongoing' | 'completed'
  is_favorite: boolean;
  is_archived: boolean;
  start_date?: string;
  end_date?: string;
  criteria?: unknown;
  publicHash: string;
  /** Job-board opt-in: 'private' (default) hidden from candidates; 'public' listed. */
  visibility: 'private' | 'public';
  createdAt: string;
}

export type Visibility = 'private' | 'public';

const today = () => new Date().toISOString().slice(0, 10);

/** "Compute on read" status from dates (matches the old NestJS behaviour). */
export function computeStatus(c: Partial<Campaign>): string {
  if (c.status === 'completed') return 'completed';
  if (c.end_date && c.end_date < today()) return 'completed';
  if (c.start_date && c.start_date <= today()) return 'ongoing';
  if (c.start_date && c.start_date > today()) return 'not-started';
  return c.status || 'ongoing';
}

/** Response projection: includes `id` and the computed status. */
export function toCampaignShape(c: Campaign) {
  return {
    id: c.campaignId,
    name: c.name,
    company_name: c.company_name,
    job_role: c.job_role,
    job_description: c.job_description,
    status: computeStatus(c),
    is_favorite: !!c.is_favorite,
    is_archived: !!c.is_archived,
    start_date: c.start_date,
    end_date: c.end_date,
    criteria: c.criteria ?? undefined,
    publicHash: c.publicHash,
    visibility: c.visibility ?? 'private',
  };
}

/** Public job-board projection (what candidates see — no internal fields). */
export function toJobShape(c: Campaign) {
  return {
    id: c.campaignId,
    name: c.name,
    company_name: c.company_name,
    job_role: c.job_role,
    job_description: c.job_description,
    status: computeStatus(c),
    start_date: c.start_date,
    end_date: c.end_date,
    criteria: c.criteria ?? undefined,
    publicHash: c.publicHash,
  };
}

export async function createCampaign(input: {
  companyId: string;
  createdByUserId: string;
  name: string;
  company_name: string;
  job_role: string;
  job_description: string;
  start_date?: string;
  end_date?: string;
  criteria?: unknown;
  visibility?: Visibility;
}): Promise<Campaign> {
  const campaign: Campaign = {
    campaignId: uuidv4(),
    companyId: input.companyId,
    createdByUserId: input.createdByUserId,
    name: input.name,
    company_name: input.company_name,
    job_role: input.job_role,
    job_description: input.job_description,
    status: 'not-started',
    is_favorite: false,
    is_archived: false,
    start_date: input.start_date,
    end_date: input.end_date,
    criteria: input.criteria,
    publicHash: uuidv4(), // cryptographically random public link (anti-IDOR)
    visibility: input.visibility ?? 'private',
    createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLES.campaigns, Item: campaign }));
  return campaign;
}

export async function getCampaign(campaignId: string): Promise<Campaign | null> {
  const res = await ddb.send(
    new GetCommand({ TableName: TABLES.campaigns, Key: { campaignId } }),
  );
  return (res.Item as Campaign) ?? null;
}

export async function getCampaignByHash(publicHash: string): Promise<Campaign | null> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.campaigns,
      IndexName: 'PublicHashIndex',
      KeyConditionExpression: 'publicHash = :h',
      ExpressionAttributeValues: { ':h': publicHash },
      Limit: 1,
    }),
  );
  return (res.Items?.[0] as Campaign) ?? null;
}

export async function listCampaignsByCompany(companyId: string): Promise<Campaign[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.campaigns,
      IndexName: 'CompanyIndex',
      KeyConditionExpression: 'companyId = :c',
      ExpressionAttributeValues: { ':c': companyId },
      ScanIndexForward: false, // newest first
    }),
  );
  return (res.Items as Campaign[]) ?? [];
}

const UPDATABLE = [
  'name',
  'company_name',
  'job_role',
  'job_description',
  'status',
  'is_favorite',
  'is_archived',
  'start_date',
  'end_date',
  'criteria',
  'visibility',
] as const;

/** All public, non-archived campaigns for the candidate job board. */
export async function listPublicCampaigns(): Promise<Campaign[]> {
  const res = await ddb.send(
    new ScanCommand({
      TableName: TABLES.campaigns,
      FilterExpression: 'visibility = :v AND is_archived = :f',
      ExpressionAttributeValues: { ':v': 'public', ':f': false },
    }),
  );
  return ((res.Items as Campaign[]) ?? []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateCampaign(
  campaignId: string,
  patch: Record<string, unknown>,
): Promise<Campaign | null> {
  const sets: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  for (const k of UPDATABLE) {
    if (patch[k] !== undefined) {
      sets.push(`#${k} = :${k}`);
      names[`#${k}`] = k;
      values[`:${k}`] = patch[k];
    }
  }
  if (!sets.length) return getCampaign(campaignId);
  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLES.campaigns,
      Key: { campaignId },
      UpdateExpression: 'SET ' + sets.join(', '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    }),
  );
  return (res.Attributes as Campaign) ?? null;
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await ddb.send(new DeleteCommand({ TableName: TABLES.campaigns, Key: { campaignId } }));
}
