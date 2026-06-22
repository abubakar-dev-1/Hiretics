/* Robust live verification via direct Lambda invokes (cold-start tolerant). */
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const c = new LambdaClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});
const PFX = 'hiretics-serverless-local-';
let pass = 0, fail = 0;

async function inv(fn, { body, auth, path } = {}, tries = 5) {
  const event = {
    body: body ? JSON.stringify(body) : null,
    headers: auth ? { Authorization: 'Bearer ' + auth } : {},
    pathParameters: path || null,
  };
  for (let i = 0; i < tries; i++) {
    try {
      const r = await c.send(new InvokeCommand({ FunctionName: PFX + fn, Payload: Buffer.from(JSON.stringify(event)) }));
      const p = JSON.parse(Buffer.from(r.Payload || []).toString());
      if (p.errorMessage) { if (/timed out/.test(p.errorMessage) && i < tries - 1) continue; return { _err: p.errorMessage }; }
      return { status: p.statusCode, json: p.body ? JSON.parse(p.body) : undefined };
    } catch (e) { if (i === tries - 1) return { _err: e.name }; }
  }
}
function ck(name, cond, detail = '') { if (cond) { pass++; console.log('  PASS ' + name); } else { fail++; console.log('  FAIL ' + name + '  ' + detail); } }

(async () => {
  console.log('-- Auth + Phase 8 --');
  let r = await inv('authSignin', { body: { email: 'demo@hiretics.test', password: 'demo12345' } });
  const token = r.json && r.json.token;
  ck('recruiter signin', r.status === 200 && !!token, JSON.stringify(r).slice(0, 100));

  r = await inv('companyGet', { auth: token });
  ck('GET /company entitlement', r.status === 200 && r.json && r.json.entitlement, JSON.stringify(r.json).slice(0, 120));

  r = await inv('aiAuthor', { auth: token, body: { action: 'criteria', jobRole: 'Data Scientist' } });
  ck('ai/author criteria', r.status === 200 && r.json.result && r.json.result.criteria, JSON.stringify(r.json).slice(0, 120));

  console.log('-- Phase 9 payments --');
  r = await inv('billingPacks', {});
  ck('billing/packs', r.status === 200 && Array.isArray(r.json.packs), 'provider=' + (r.json && r.json.provider));
  r = await inv('billingCheckout', { auth: token, body: { kind: 'credits', packId: 'starter' } });
  const txnId = r.json && r.json.txnId;
  ck('billing/checkout (mock)', r.status === 200 && r.json.mock === true && !!txnId, JSON.stringify(r.json).slice(0, 120));
  if (txnId) {
    r = await inv('billingMockConfirm', { auth: token, body: { txnId } });
    const credits = r.json && r.json.company && r.json.company.availableCredits;
    ck('mock-confirm grants +50 credits', r.status === 200 && credits >= 150, 'credits=' + credits);
  }

  console.log('-- Phase 10 platform owner --');
  r = await inv('authSignin', { body: { email: 'owner@hiretics.test', password: 'owner12345' } });
  const owner = r.json && r.json.token;
  ck('owner signin (SuperAdmin)', r.status === 200 && r.json.user.role === 'SuperAdmin');
  r = await inv('adminInfra', { auth: owner });
  ck('admin/infra queues', r.status === 200 && r.json.queues, JSON.stringify(r.json.queues || r.json).slice(0, 120));
  r = await inv('adminTenants', { auth: owner });
  ck('admin/tenants', r.status === 200 && Array.isArray(r.json), 'count=' + (Array.isArray(r.json) ? r.json.length : '?'));
  r = await inv('adminInfra', { auth: token });
  ck('RBAC recruiter blocked from admin (403)', r.status === 403);

  console.log('-- Phase 11 candidate + jobs --');
  r = await inv('authSignin', { body: { email: 'candidate@hiretics.test', password: 'candidate12345' } });
  const cand = r.json && r.json.token;
  ck('candidate signin', r.status === 200 && r.json.user.role === 'Candidate');
  r = await inv('jobsList', { auth: cand });
  ck('GET /jobs lists public campaign', r.status === 200 && Array.isArray(r.json) && r.json.length >= 1, 'count=' + (Array.isArray(r.json) ? r.json.length : '?'));
  r = await inv('cvThreads', { auth: cand });
  ck('candidate/threads', r.status === 200 && Array.isArray(r.json));
  r = await inv('cvThreads', { auth: token });
  ck('RBAC recruiter blocked from candidate (403)', r.status === 403);
  r = await inv('cvPresign', { auth: cand, body: { title: 'My CV', currentLocation: 'Lahore', remotePreference: 'remote', employmentStatus: 'employed' } });
  ck('candidate/cv/presign returns uploadUrl', r.status === 200 && r.json && r.json.uploadUrl && r.json.cvId);

  console.log('\n=== ' + pass + ' passed, ' + fail + ' failed ===');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('crash', e.message); process.exit(2); });
