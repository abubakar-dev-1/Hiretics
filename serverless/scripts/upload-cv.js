/**
 * Test helper: simulate a candidate applying.
 *   node scripts/upload-cv.js <campaignId> <pdfPath>
 * Does the real browser flow: POST /presign -> PUT file to the presigned S3 URL.
 */
const fs = require('fs');
const { getApiBaseUrl } = require('./api-url');

const [campaignId, pdfPath] = process.argv.slice(2);
if (!campaignId || !pdfPath) {
  console.error('usage: node scripts/upload-cv.js <campaignId> <pdfPath>');
  process.exit(1);
}

(async () => {
  const API = await getApiBaseUrl();
  const presignRes = await fetch(`${API}/candidates/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaignId }),
  });
  const { candidateId, uploadUrl } = await presignRes.json();

  const body = fs.readFileSync(pdfPath);
  const putRes = await fetch(uploadUrl, { method: 'PUT', body });
  console.log(`${putRes.status === 200 ? '✅' : '❌'} ${pdfPath} -> ${candidateId} (PUT ${putRes.status})`);
})().catch((e) => {
  console.error('upload failed:', e.message);
  process.exit(1);
});
