/**
 * End-to-end smoke test — auth, multi-tenancy/RBAC, and the full CV pipeline.
 * Reusable regression + demo check. Run: `npm run smoke` (after bootstrap/wire/seed).
 */
const fs = require('fs');
const path = require('path');
const { getApiBaseUrl } = require('./api-url');

let failed = false;
const pass = (m) => console.log('  ✅', m);
const fail = (m) => { console.log('  ❌', m); failed = true; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (url, body, token) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
const get = (url, token) => fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);

(async () => {
  const API = await getApiBaseUrl();
  console.log('API:', API, '\n');

  console.log('AUTH');
  let r = await post(`${API}/auth/signin`, { email: 'demo@hiretics.test', password: 'demo12345' });
  const demo = await r.json();
  r.status === 200 && demo.token ? pass('signin demo@hiretics.test') : fail(`signin failed (${r.status})`);
  const demoToken = demo.token;

  r = await post(`${API}/auth/signin`, { email: 'demo@hiretics.test', password: 'nope' });
  r.status === 401 ? pass('wrong password -> 401') : fail(`wrong password gave ${r.status}`);

  r = await get(`${API}/auth/session`, demoToken);
  const sess = await r.json();
  r.status === 200 && sess.user?.email === 'demo@hiretics.test'
    ? pass('session returns current user')
    : fail(`session failed (${r.status})`);

  const acmeEmail = `acme${Date.now()}@test.com`;
  r = await post(`${API}/auth/signup`, { companyName: 'Acme', fullName: 'Acme Admin', email: acmeEmail, password: 'password123' });
  const acme = await r.json();
  r.status === 201 && acme.token
    ? pass(`signup new company (${acme.company?.availableCredits} free credits)`)
    : fail(`signup failed (${r.status})`);
  const acmeToken = acme.token;

  r = await post(`${API}/auth/signup`, { fullName: 'x', email: acmeEmail, password: 'password123' });
  r.status === 409 ? pass('duplicate email -> 409') : fail(`dup gave ${r.status}`);

  console.log('\nMULTI-TENANCY & RBAC');
  r = await get(`${API}/campaigns/demo-campaign/candidates`);
  r.status === 401 ? pass('protected route without token -> 401') : fail(`no-token gave ${r.status}`);

  r = await get(`${API}/campaigns/demo-campaign/candidates`, acmeToken);
  r.status === 404 ? pass('cross-company access blocked -> 404') : fail(`cross-company gave ${r.status}`);

  console.log('\nPIPELINE (public upload -> AI score)');
  const pr = await post(`${API}/candidates/presign`, { campaignId: 'demo-campaign' });
  const { candidateId, uploadUrl } = await pr.json();
  const cv = fs.readFileSync(path.join(__dirname, '..', '..', 'test-cvs', 'CV_Ahmed_Khan_Senior_React.pdf'));
  const put = await fetch(uploadUrl, { method: 'PUT', body: cv });
  put.status === 200 ? pass('public presign + direct-to-S3 upload') : fail(`upload gave ${put.status}`);

  let scored = null;
  for (let i = 0; i < 25 && !scored; i++) {
    const lr = await get(`${API}/candidates/${candidateId}`, demoToken);
    if (lr.status === 200) {
      const c = await lr.json();
      if (c.status === 'Scored') scored = c;
    }
    if (!scored) await sleep(4000);
  }
  scored
    ? pass(`candidate scored ${scored.score} [${scored.relevance}] — "${(scored.ranking_reason || '').slice(0, 55)}..."`)
    : fail('candidate not scored within ~100s');

  r = await get(`${API}/campaigns/demo-campaign/candidates`, demoToken);
  const list = await r.json();
  r.status === 200 && Array.isArray(list) ? pass(`owner ranked list (${list.length} candidates)`) : fail(`ranked list failed (${r.status})`);

  console.log('\n' + (failed ? '❌ SMOKE TEST FAILED' : '✅ ALL SMOKE TESTS PASSED'));
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('smoke crashed:', e.message);
  process.exit(1);
});
