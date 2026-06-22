import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { REGION, INTERNAL_ENDPOINT, LOCAL_CREDS } from './aws';

/** Shared DynamoDB DocumentClient (uses the LocalStack-internal endpoint). */
const client = new DynamoDBClient({
  region: REGION,
  ...(INTERNAL_ENDPOINT ? { endpoint: INTERNAL_ENDPOINT } : {}),
  ...LOCAL_CREDS,
});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLES = {
  companies: process.env.COMPANIES_TABLE!,
  users: process.env.USERS_TABLE!,
  campaigns: process.env.CAMPAIGNS_TABLE!,
  candidates: process.env.CANDIDATES_TABLE!,
  transactions: process.env.TRANSACTIONS_TABLE!,
  cvThreads: process.env.CV_THREADS_TABLE!,
  cvVersions: process.env.CV_VERSIONS_TABLE!,
  cvComparisons: process.env.CV_COMPARISONS_TABLE!,
};
