import { GetCommand, UpdateCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ddb, TABLES } from '../lib/dynamo';

export type Plan = 'free' | 'pro';

export interface Company {
  companyId: string;
  name: string;
  availableCredits: number;
  /** Subscription tier. `free` by default; `pro` unlocks unlimited AI authoring. */
  plan: Plan;
  /** Number of AI-authoring generations consumed on the free tier. */
  aiAuthorCount: number;
  /** Suspended tenants are blocked from the pipeline (Platform-Owner action). */
  suspended?: boolean;
  createdAt: string;
  planUpdatedAt?: string;
}

export async function createCompany(name: string, initialCredits = 0): Promise<Company> {
  const company: Company = {
    companyId: uuidv4(),
    name,
    availableCredits: initialCredits,
    plan: 'free',
    aiAuthorCount: 0,
    createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLES.companies, Item: company }));
  return company;
}

/** Read a company, normalizing fields added in later phases for old records. */
export async function getCompany(companyId: string): Promise<Company | null> {
  const res = await ddb.send(
    new GetCommand({ TableName: TABLES.companies, Key: { companyId } }),
  );
  if (!res.Item) return null;
  const c = res.Item as Company;
  return { ...c, plan: c.plan ?? 'free', aiAuthorCount: c.aiAuthorCount ?? 0 };
}

/** Scan every company (Platform-Owner tenant list — small N in this build). */
export async function listAllCompanies(): Promise<Company[]> {
  const res = await ddb.send(new ScanCommand({ TableName: TABLES.companies }));
  return ((res.Items as Company[]) ?? []).map((c) => ({
    ...c,
    plan: c.plan ?? 'free',
    aiAuthorCount: c.aiAuthorCount ?? 0,
  }));
}

/** Suspend / reactivate a tenant (Platform-Owner action). */
export async function setSuspended(companyId: string, suspended: boolean): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.companies,
      Key: { companyId },
      UpdateExpression: 'SET suspended = :s',
      ExpressionAttributeValues: { ':s': suspended },
    }),
  );
}

/** Set the subscription tier (used by the Stripe webhook and admin tools). */
export async function setPlan(companyId: string, plan: Plan): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.companies,
      Key: { companyId },
      UpdateExpression: 'SET #p = :p, planUpdatedAt = :t',
      ExpressionAttributeNames: { '#p': 'plan' },
      ExpressionAttributeValues: { ':p': plan, ':t': new Date().toISOString() },
    }),
  );
}

/**
 * Entitlement gate for AI authoring. Pro = unlimited (no counter change).
 * Free = atomically consume one of `limit` generations; race-safe.
 * Returns whether the call is allowed and how many free uses remain.
 */
export async function tryConsumeAiAuthor(
  companyId: string,
  limit: number,
): Promise<{ allowed: boolean; plan: Plan; remaining: number; used: number }> {
  const company = await getCompany(companyId);
  if (!company) return { allowed: false, plan: 'free', remaining: 0, used: 0 };
  if (company.plan === 'pro') {
    return { allowed: true, plan: 'pro', remaining: Infinity as number, used: company.aiAuthorCount };
  }
  try {
    const res = await ddb.send(
      new UpdateCommand({
        TableName: TABLES.companies,
        Key: { companyId },
        UpdateExpression: 'SET aiAuthorCount = if_not_exists(aiAuthorCount, :z) + :one',
        // if_not_exists() is only valid in SET, not in a ConditionExpression.
        ConditionExpression: 'attribute_not_exists(aiAuthorCount) OR aiAuthorCount < :limit',
        ExpressionAttributeValues: { ':one': 1, ':z': 0, ':limit': limit },
        ReturnValues: 'UPDATED_NEW',
      }),
    );
    const used = (res.Attributes?.aiAuthorCount as number) ?? limit;
    return { allowed: true, plan: 'free', remaining: Math.max(0, limit - used), used };
  } catch (e: any) {
    if (e?.name === 'ConditionalCheckFailedException') {
      return { allowed: false, plan: 'free', remaining: 0, used: limit };
    }
    throw e;
  }
}

/**
 * Atomically deduct 1 credit. Returns false (no throw) if the balance is 0.
 * Race-safe under concurrent Lambda workers (DynamoDB conditional update).
 */
export async function deductCredit(companyId: string): Promise<boolean> {
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLES.companies,
        Key: { companyId },
        UpdateExpression: 'SET availableCredits = availableCredits - :one',
        ConditionExpression: 'availableCredits >= :one',
        ExpressionAttributeValues: { ':one': 1 },
      }),
    );
    return true;
  } catch (e: any) {
    if (e?.name === 'ConditionalCheckFailedException') return false;
    throw e;
  }
}

/** Refund one free AI-authoring use when the provider call fails (never below 0). */
export async function addAiAuthorRefund(companyId: string): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.companies,
      Key: { companyId },
      UpdateExpression: 'SET aiAuthorCount = if_not_exists(aiAuthorCount, :z) - :one',
      ConditionExpression: 'attribute_exists(aiAuthorCount) AND aiAuthorCount >= :one',
      ExpressionAttributeValues: { ':one': 1, ':z': 0 },
    }),
  );
}

/** Add credits (admin top-up, and used to refund on transient AI failure). */
export async function addCredits(companyId: string, n = 1): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.companies,
      Key: { companyId },
      UpdateExpression: 'SET availableCredits = if_not_exists(availableCredits, :z) + :n',
      ExpressionAttributeValues: { ':n': n, ':z': 0 },
    }),
  );
}
