/**
 * Resolve the current LocalStack API Gateway base URL dynamically.
 * The REST API id regenerates on a full teardown, so never hard-code it —
 * import getApiBaseUrl() or run `node scripts/api-url.js` to print it.
 */
const { APIGatewayClient, GetRestApisCommand } = require('@aws-sdk/client-api-gateway');

const ENDPOINT = process.env.AWS_ENDPOINT || 'http://localhost:4566';
const STAGE = process.env.STAGE || 'local';

async function getApiBaseUrl() {
  const c = new APIGatewayClient({
    region: 'us-east-1',
    endpoint: ENDPOINT,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  });
  const r = await c.send(new GetRestApisCommand({}));
  const api = (r.items || []).find((a) => (a.name || '').includes('hiretics')) || (r.items || [])[0];
  if (!api) throw new Error('No REST API found — run `npm run bootstrap` first');
  return `${ENDPOINT}/restapis/${api.id}/${STAGE}/_user_request_`;
}

module.exports = { getApiBaseUrl };

if (require.main === module) {
  getApiBaseUrl()
    .then((u) => process.stdout.write(u + '\n'))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
