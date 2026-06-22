/**
 * Seed demo data so the pipeline (and demos) have something to work with:
 * one company with credits + one Active campaign. Idempotent (fixed IDs).
 * Run: `npm run seed`
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

const ENDPOINT = process.env.AWS_ENDPOINT || 'http://localhost:4566';
const STAGE = process.env.STAGE || 'local';
const SERVICE = 'hiretics-serverless';

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: 'us-east-1',
    endpoint: ENDPOINT,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  }),
);

const T = {
  companies: `${SERVICE}-companies-${STAGE}`,
  campaigns: `${SERVICE}-campaigns-${STAGE}`,
  users: `${SERVICE}-users-${STAGE}`,
};

// Demo login: demo@hiretics.test / demo12345 (Admin of demo-company)
const demoUser = {
  userId: 'demo-user',
  companyId: 'demo-company',
  fullName: 'Demo Admin',
  email: 'demo@hiretics.test',
  passwordHash: bcrypt.hashSync('demo12345', 10),
  role: 'Admin',
  createdAt: new Date().toISOString(),
};

const company = {
  companyId: 'demo-company',
  name: 'Demo Inc.',
  availableCredits: 100,
  plan: 'free',
  aiAuthorCount: 0,
  suspended: false,
  createdAt: new Date().toISOString(),
};

// Platform owner (Super-Admin console): owner@hiretics.test / owner12345
const platformCompany = {
  companyId: 'platform-company',
  name: 'Hiretics Platform',
  availableCredits: 0,
  plan: 'pro',
  aiAuthorCount: 0,
  createdAt: new Date().toISOString(),
};
const platformOwner = {
  userId: 'platform-owner',
  companyId: 'platform-company',
  fullName: 'Platform Owner',
  email: 'owner@hiretics.test',
  passwordHash: bcrypt.hashSync('owner12345', 10),
  role: 'SuperAdmin',
  createdAt: new Date().toISOString(),
};

// Demo candidate (job-seeker side): candidate@hiretics.test / candidate12345
// Self-scoped: companyId === userId.
const candidateUser = {
  userId: 'demo-candidate',
  companyId: 'demo-candidate',
  fullName: 'Jordan Candidate',
  email: 'candidate@hiretics.test',
  passwordHash: bcrypt.hashSync('candidate12345', 10),
  role: 'Candidate',
  createdAt: new Date().toISOString(),
};

const campaign = {
  campaignId: 'demo-campaign',
  companyId: 'demo-company',
  createdByUserId: 'demo-user',
  name: 'Senior React Hiring Drive',
  company_name: 'Demo Inc.',
  job_role: 'Senior Frontend Developer (React)',
  job_description:
    'We are hiring a Senior Frontend Developer with strong React, TypeScript, and Next.js experience. ' +
    'Responsibilities include building responsive UIs, state management, performance optimization, and ' +
    'working with REST APIs. 4+ years of professional frontend experience required. Node.js a plus.',
  status: 'ongoing',
  is_favorite: false,
  is_archived: false,
  criteria: null,
  publicHash: 'demo-hash-1234',
  visibility: 'public', // listed on the candidate job board
  createdAt: new Date().toISOString(),
};

(async () => {
  await ddb.send(new PutCommand({ TableName: T.companies, Item: company }));
  await ddb.send(new PutCommand({ TableName: T.companies, Item: platformCompany }));
  await ddb.send(new PutCommand({ TableName: T.campaigns, Item: campaign }));
  await ddb.send(new PutCommand({ TableName: T.users, Item: demoUser }));
  await ddb.send(new PutCommand({ TableName: T.users, Item: platformOwner }));
  await ddb.send(new PutCommand({ TableName: T.users, Item: candidateUser }));
  console.log('✅ Seeded:');
  console.log(`   company   : ${company.companyId} (credits: ${company.availableCredits}, plan: ${company.plan})`);
  console.log(`   campaign  : ${campaign.campaignId} — "${campaign.job_role}" (${campaign.visibility})`);
  console.log(`   publicHash: ${campaign.publicHash}`);
  console.log('   logins:');
  console.log(`     recruiter      : ${demoUser.email} / demo12345 (Admin)`);
  console.log(`     platform owner : ${platformOwner.email} / owner12345 (SuperAdmin)`);
  console.log(`     candidate      : ${candidateUser.email} / candidate12345 (Candidate)`);
})().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
