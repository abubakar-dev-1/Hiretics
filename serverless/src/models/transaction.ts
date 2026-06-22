import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ddb, TABLES } from '../lib/dynamo';

export type TxnKind = 'credits' | 'pro';
export type TxnStatus = 'pending' | 'paid' | 'failed';

export interface Transaction {
  txnId: string;
  companyId: string;
  kind: TxnKind;
  packId?: string;
  credits?: number; // credits granted (kind === 'credits')
  amountCents: number;
  currency: string;
  status: TxnStatus;
  provider: 'stripe' | 'mock';
  sessionId?: string;
  createdAt: string;
  paidAt?: string;
}

export async function createTransaction(
  input: Omit<Transaction, 'txnId' | 'status' | 'createdAt'>,
): Promise<Transaction> {
  const txn: Transaction = {
    txnId: uuidv4(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...input,
  };
  await ddb.send(new PutCommand({ TableName: TABLES.transactions, Item: txn }));
  return txn;
}

export async function getTransaction(txnId: string): Promise<Transaction | null> {
  const res = await ddb.send(
    new GetCommand({ TableName: TABLES.transactions, Key: { txnId } }),
  );
  return (res.Item as Transaction) ?? null;
}

export async function setSessionId(txnId: string, sessionId: string): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLES.transactions,
      Key: { txnId },
      UpdateExpression: 'SET sessionId = :s',
      ExpressionAttributeValues: { ':s': sessionId },
    }),
  );
}

/**
 * Atomically mark a transaction paid. Returns true only on the FIRST transition
 * (so fulfillment runs exactly once — idempotent across webhook retries).
 */
export async function markPaid(txnId: string): Promise<boolean> {
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLES.transactions,
        Key: { txnId },
        UpdateExpression: 'SET #s = :paid, paidAt = :t',
        ConditionExpression: '#s <> :paid',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':paid': 'paid', ':t': new Date().toISOString() },
      }),
    );
    return true;
  } catch (e: any) {
    if (e?.name === 'ConditionalCheckFailedException') return false;
    throw e;
  }
}

/** Scan all transactions (Platform-Owner revenue aggregation — small N here). */
export async function listAllTransactions(): Promise<Transaction[]> {
  const res = await ddb.send(new ScanCommand({ TableName: TABLES.transactions }));
  return (res.Items as Transaction[]) ?? [];
}

export async function listByCompany(companyId: string): Promise<Transaction[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLES.transactions,
      IndexName: 'CompanyIndex',
      KeyConditionExpression: 'companyId = :c',
      ExpressionAttributeValues: { ':c': companyId },
      ScanIndexForward: false, // newest first
    }),
  );
  return (res.Items as Transaction[]) ?? [];
}
