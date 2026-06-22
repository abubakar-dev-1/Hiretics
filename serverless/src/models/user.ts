import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ddb, TABLES } from '../lib/dynamo';
import type { Role } from '../lib/jwt';

export interface User {
  userId: string;
  companyId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

/** Safe projection (never leak the password hash). */
export const publicUser = (u: User) => ({
  userId: u.userId,
  companyId: u.companyId,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
});

export async function getUserByEmail(email: string): Promise<User | null> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.users,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :e',
      ExpressionAttributeValues: { ':e': email.toLowerCase() },
      Limit: 1,
    }),
  );
  return (res.Items?.[0] as User) ?? null;
}

export async function getUser(userId: string): Promise<User | null> {
  const res = await ddb.send(
    new GetCommand({ TableName: TABLES.users, Key: { userId } }),
  );
  return (res.Item as User) ?? null;
}

export async function createUser(input: {
  companyId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
}): Promise<User> {
  const user: User = {
    userId: uuidv4(),
    companyId: input.companyId,
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLES.users, Item: user }));
  return user;
}

/**
 * Create a candidate account (Phase 11). Candidates are individuals, not tenants,
 * so we self-scope them: companyId === userId. This keeps the JWT shape uniform
 * and isolates each candidate's CV data.
 */
export async function createCandidateAccount(input: {
  fullName: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const userId = uuidv4();
  const user: User = {
    userId,
    companyId: userId,
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    role: 'Candidate',
    createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLES.users, Item: user }));
  return user;
}

export async function deleteUser(userId: string): Promise<void> {
  await ddb.send(new DeleteCommand({ TableName: TABLES.users, Key: { userId } }));
}

export async function listUsersByCompany(companyId: string): Promise<User[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.users,
      IndexName: 'CompanyIndex',
      KeyConditionExpression: 'companyId = :c',
      ExpressionAttributeValues: { ':c': companyId },
    }),
  );
  return (res.Items as User[]) ?? [];
}

/** Scan all users (Platform-Owner uses this to count members per tenant). */
export async function listAllUsers(): Promise<User[]> {
  const res = await ddb.send(
    new ScanCommand({
      TableName: TABLES.users,
      ProjectionExpression: 'userId, companyId, #r, email',
      ExpressionAttributeNames: { '#r': 'role' },
    }),
  );
  return (res.Items as User[]) ?? [];
}
