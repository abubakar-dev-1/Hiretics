/* Live integration check for the extended features (Phases 8-11). */
const fs = require('fs');

const API = process.argv[2] || readApi();
function readApi() {
  // pull the proxy target from client/.env.local
  try {
    const env = fs.readFileSync(require('path').join(__dirname, '../../client/.env.local'), 'utf8');
    const m = env.match(/SERVERLESS_API_TARGET=(.*)/);
    if (m) return m[1].trim();
  } catch {}
  throw new Error('Pass API base as arg');
}

let token, ownerToken, candToken, pass = 0, fail = 0;

async function call(method, path, { body, auth, tries = 6 } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${auth}`;
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${API}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = text; }
      return { status: res.status, json };
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 3000)); // cold-start retry
    }
  }
  throw lastErr;
}

function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}  ${detail}`); }
}

(async () => {
  console.log('API:', API, '\n');

  console.log('— Core —');
  let r = await call('GET', '/health');
  check('GET /health 200', r.status === 200, JSON.stringify(r.json).slice(0, 120));

  console.log('\n— Auth (recruiter) —');
  r = await call('POST', '/auth/signin', { body: { email: 'demo@hiretics.test', password: 'demo12345' } });
  token = r.json && r.json.token;
  check('recruiter signin', r.status === 200 && !!token);

  console.log('\n— Phase 8: entitlement + AI authoring —');
  r = await call('GET', '/company', { auth: token });
  check('GET /company has entitlement', r.status === 200 && r.json.entitlement, JSON.stringify(r.json).slice(0, 150));
  const remaining0 = r.json && r.json.entitlement && r.json.entitlement.aiAuthor.remaining;
  r = await call('POST', '/ai/author', { auth: token, body: { action: 'title', jobRole: 'Backend Engineer', seniority: 'Senior' }, tries: 4 });
  check('POST /ai/author returns suggestion', r.status === 200 && r.json.result, JSON.stringify(r.json).slice(0, 160));

  console.log('\n— Phase 9: payments —');
  r = await call('GET', '/billing/packs');
  check('GET /billing/packs', r.status === 200 && Array.isArray(r.json.packs), `provider=${r.json && r.json.provider}`);
  r = await call('POST', '/billing/checkout', { auth: token, body: { kind: 'credits', packId: 'starter' } });
  const txnId = r.json && r.json.txnId;
  check('POST /billing/checkout (mock)', r.status === 200 && r.json.mock === true && !!txnId);
  if (txnId) {
    r = await call('POST', '/billing/mock-confirm', { auth: token, body: { txnId } });
    const credits = r.json && r.json.company && r.json.company.availableCredits;
    check('mock-confirm grants credits (>=150)', r.status === 200 && credits >= 150, `credits=${credits}`);
  }

  console.log('\n— Phase 10: platform owner —');
  r = await call('POST', '/auth/signin', { body: { email: 'owner@hiretics.test', password: 'owner12345' } });
  ownerToken = r.json && r.json.token;
  check('owner signin (SuperAdmin)', r.status === 200 && !!ownerToken && r.json.user.role === 'SuperAdmin');
  r = await call('GET', '/admin/infra', { auth: ownerToken });
  check('GET /admin/infra (queue depths)', r.status === 200 && r.json.queues, JSON.stringify(r.json.queues || r.json).slice(0, 160));
  r = await call('GET', '/admin/tenants', { auth: ownerToken });
  check('GET /admin/tenants', r.status === 200 && Array.isArray(r.json), `count=${Array.isArray(r.json) ? r.json.length : '?'}`);
  // RBAC: recruiter must NOT access admin
  r = await call('GET', '/admin/infra', { auth: token });
  check('RBAC: recruiter blocked from /admin/infra (403)', r.status === 403);

  console.log('\n— Phase 11: candidate + job board —');
  r = await call('POST', '/auth/signin', { body: { email: 'candidate@hiretics.test', password: 'candidate12345' } });
  candToken = r.json && r.json.token;
  check('candidate signin', r.status === 200 && !!candToken && r.json.user.role === 'Candidate');
  r = await call('GET', '/jobs', { auth: candToken });
  check('GET /jobs lists public campaign', r.status === 200 && Array.isArray(r.json) && r.json.length >= 1, `count=${Array.isArray(r.json) ? r.json.length : '?'}`);
  // RBAC: recruiter cannot use candidate route
  r = await call('GET', '/candidate/threads', { auth: token });
  check('RBAC: recruiter blocked from /candidate/threads (403)', r.status === 403);
  r = await call('GET', '/candidate/threads', { auth: candToken });
  check('GET /candidate/threads (empty ok)', r.status === 200 && Array.isArray(r.json));
  r = await call('POST', '/candidate/cv/presign', { auth: candToken, body: { title: 'Test CV', currentLocation: 'Lahore', remotePreference: 'remote', employmentStatus: 'employed' } });
  check('POST /candidate/cv/presign returns uploadUrl', r.status === 200 && !!r.json.uploadUrl && !!r.json.cvId);

  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('live-check crashed:', e.message); process.exit(2); });
