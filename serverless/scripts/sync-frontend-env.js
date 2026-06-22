/**
 * Writes the current API Gateway URL into client/.env.local so the frontend
 * always points at the live deployment. Run after `npm run bootstrap`.
 */
const fs = require('fs');
const path = require('path');
const { getApiBaseUrl } = require('./api-url');

(async () => {
  const url = await getApiBaseUrl();
  const envPath = path.join(__dirname, '..', '..', 'client', '.env.local');
  let txt = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  const upsert = (key, value) => {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(txt)) txt = txt.replace(re, line);
    else txt += (txt.endsWith('\n') || txt === '' ? '' : '\n') + line + '\n';
  };

  // Browser uses the same-origin proxy path; Next rewrites it to the full target.
  upsert('NEXT_PUBLIC_SERVERLESS_API', '/sl-api');
  upsert('SERVERLESS_API_TARGET', url);
  fs.writeFileSync(envPath, txt);
  console.log('✅ client/.env.local synced — proxy /sl-api ->', url);
})().catch((e) => {
  console.error('sync-frontend-env failed:', e.message);
  process.exit(1);
});
