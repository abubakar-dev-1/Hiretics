/**
 * Phase 0 health check — verifies the LocalStack stack is provisioned.
 * Cross-platform (plain Node, no bash). Run: `npm run health`.
 *
 * Prints ✅/❌ for: LocalStack reachable, the 4 DynamoDB tables, the S3 bucket,
 * and the SQS queue. Run this before any demo (see docs/06-demo-runbook.md).
 */
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { SQSClient, ListQueuesCommand } = require('@aws-sdk/client-sqs');

const ENDPOINT = process.env.AWS_ENDPOINT || 'http://localhost:4566';
const REGION = process.env.AWS_REGION || 'us-east-1';
const STAGE = process.env.STAGE || 'local';
const SERVICE = 'hiretics-serverless';

const cfg = {
  region: REGION,
  endpoint: ENDPOINT,
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
};

const expectedTables = [
  `${SERVICE}-companies-${STAGE}`,
  `${SERVICE}-users-${STAGE}`,
  `${SERVICE}-campaigns-${STAGE}`,
  `${SERVICE}-candidates-${STAGE}`,
];
const expectedBucket = `${SERVICE}-resumes-${STAGE}`;
const expectedQueue = `${SERVICE}-resume-queue-${STAGE}`;

const pass = (m) => console.log(`  ✅ ${m}`);
const fail = (m) => console.log(`  ❌ ${m}`);

(async () => {
  let allGood = true;
  console.log(`\nHiretics health check  (endpoint: ${ENDPOINT}, stage: ${STAGE})\n`);

  // DynamoDB
  try {
    const ddb = new DynamoDBClient(cfg);
    const { TableNames = [] } = await ddb.send(new ListTablesCommand({}));
    console.log('DynamoDB tables:');
    for (const t of expectedTables) {
      if (TableNames.includes(t)) pass(t);
      else { fail(`${t} (missing)`); allGood = false; }
    }
  } catch (e) {
    fail(`DynamoDB unreachable — is LocalStack up? (${e.message})`);
    allGood = false;
  }

  // S3
  try {
    const s3 = new S3Client({ ...cfg, forcePathStyle: true });
    const { Buckets = [] } = await s3.send(new ListBucketsCommand({}));
    console.log('S3 bucket:');
    if (Buckets.some((b) => b.Name === expectedBucket)) pass(expectedBucket);
    else { fail(`${expectedBucket} (missing)`); allGood = false; }
  } catch (e) {
    fail(`S3 unreachable (${e.message})`);
    allGood = false;
  }

  // SQS
  try {
    const sqs = new SQSClient(cfg);
    const { QueueUrls = [] } = await sqs.send(new ListQueuesCommand({}));
    console.log('SQS queue:');
    if (QueueUrls.some((u) => u.endsWith(expectedQueue))) pass(expectedQueue);
    else { fail(`${expectedQueue} (missing)`); allGood = false; }
  } catch (e) {
    fail(`SQS unreachable (${e.message})`);
    allGood = false;
  }

  console.log('');
  if (allGood) {
    console.log('✅ All systems healthy.\n');
    process.exit(0);
  } else {
    console.log('❌ Something is missing. Try: npm run ls:up && npm run bootstrap\n');
    process.exit(1);
  }
})();
