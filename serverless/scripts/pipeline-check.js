/* End-to-end test of BOTH event-driven pipelines (S3 -> SQS -> worker -> AI). */
const fs = require('fs');
const path = require('path');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const c = new LambdaClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});
const PFX = 'hiretics-serverless-local-';
const CV = path.join(__dirname, '..', '..', 'test-cvs', 'CV_Ahmed_Khan_Senior_React.pdf');

async function inv(fn, { body, auth, path: pp } = {}, tries = 5) {
  const event = { body: body ? JSON.stringify(body) : null, headers: auth ? { Authorization: 'Bearer ' + auth } : {}, pathParameters: pp || null };
  for (let i = 0; i < tries; i++) {
    try {
      const r = await c.send(new InvokeCommand({ FunctionName: PFX + fn, Payload: Buffer.from(JSON.stringify(event)) }));
      const p = JSON.parse(Buffer.from(r.Payload || []).toString());
      if (p.errorMessage) { if (/timed out/.test(p.errorMessage) && i < tries - 1) continue; return { _err: p.errorMessage }; }
      return { status: p.statusCode, json: p.body ? JSON.parse(p.body) : undefined };
    } catch (e) { if (i === tries - 1) return { _err: e.name }; }
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const file = fs.readFileSync(CV);
  let ok = true;

  // ---- Pipeline 1: recruiter ranking ----
  console.log('-- Pipeline 1: recruiter CV ranking --');
  const si = await inv('authSignin', { body: { email: 'demo@hiretics.test', password: 'demo12345' } });
  const token = si.json && si.json.token;
  const pre = await inv('candidatePresign', { body: { campaignId: 'demo-campaign' } });
  const candidateId = pre.json && pre.json.candidateId;
  const url = pre.json && pre.json.uploadUrl;
  console.log('  presign:', pre.status, 'candidateId:', candidateId);
  const put = await fetch(url, { method: 'PUT', body: file });
  console.log('  S3 PUT:', put.status);

  let scored = null;
  for (let i = 0; i < 30; i++) {
    await sleep(4000);
    const list = await inv('candidateList', { auth: token, path: { id: 'demo-campaign' } });
    const arr = Array.isArray(list.json) ? list.json : [];
    const me = arr.find((x) => x.id === candidateId || x.candidateId === candidateId);
    if (me && (me.status === 'Scored' || (me.score || me.aiScore) > 0)) { scored = me; break; }
    if (i % 3 === 0) process.stdout.write(`  …waiting for score (${(i + 1) * 4}s, status=${me ? me.status : 'n/a'})\n`);
  }
  if (scored) console.log('  ✅ RANKED:', JSON.stringify({ name: scored.name || scored.full_name, score: scored.score || scored.aiScore, status: scored.status }).slice(0, 160));
  else { console.log('  ❌ not scored within ~120s'); ok = false; }

  // ---- Pipeline 2: candidate career analysis ----
  console.log('-- Pipeline 2: candidate CV analysis --');
  const cs = await inv('authSignin', { body: { email: 'candidate@hiretics.test', password: 'candidate12345' } });
  const ctok = cs.json && cs.json.token;
  const cpre = await inv('cvPresign', { auth: ctok, body: { title: 'My CV', currentLocation: 'Lahore', remotePreference: 'remote', employmentStatus: 'employed' } });
  const cvId = cpre.json && cpre.json.cvId;
  console.log('  presign:', cpre.status, 'cvId:', cvId);
  const put2 = await fetch(cpre.json.uploadUrl, { method: 'PUT', body: file });
  console.log('  S3 PUT:', put2.status);

  let report = null;
  for (let i = 0; i < 30; i++) {
    await sleep(4000);
    const g = await inv('cvGet', { auth: ctok, path: { id: cvId } });
    const st = g.json && g.json.status;
    if (st === 'analyzed' && g.json.report) { report = g.json.report; break; }
    if (st === 'failed') { console.log('  ❌ analysis failed:', g.json.error); ok = false; break; }
    if (i % 3 === 0) process.stdout.write(`  …waiting for analysis (${(i + 1) * 4}s, status=${st})\n`);
  }
  if (report) console.log('  ✅ ANALYZED: readiness=' + report.overallReadinessScore + ', pivots=' + report.pivotPaths.length + ', cvSurgery=' + report.cvImprovements.length);
  else if (ok) { console.log('  ❌ not analyzed within ~120s'); ok = false; }

  console.log('\n=== PIPELINES ' + (ok ? 'PASS' : 'FAIL') + ' ===');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('crash', e.message); process.exit(2); });
