/**
 * Warm every Lambda so the first real request doesn't hit a slow cold start
 * (LocalStack drops the connection — ECONNRESET — on long cold starts).
 * Run after `npm run bootstrap` and before a demo. Containers then stay warm
 * (LAMBDA_KEEPALIVE_MS=30min). Invokes in small batches to avoid spawning too
 * many containers at once.
 */
const { LambdaClient, ListFunctionsCommand, InvokeCommand } = require('@aws-sdk/client-lambda');

const c = new LambdaClient({
  region: 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const BATCH = 4;
const event = Buffer.from(JSON.stringify({ httpMethod: 'GET', headers: {}, requestContext: {}, body: null }));

(async () => {
  const { Functions = [] } = await c.send(new ListFunctionsCommand({}));
  const names = Functions.map((f) => f.FunctionName).filter(Boolean);
  console.log(`Warming ${names.length} functions (batches of ${BATCH})...`);

  for (let i = 0; i < names.length; i += BATCH) {
    const batch = names.slice(i, i + BATCH);
    await Promise.all(
      batch.map((name) =>
        c.send(new InvokeCommand({ FunctionName: name, Payload: event }))
          .then(() => process.stdout.write('.'))
          .catch(() => process.stdout.write('x')),
      ),
    );
  }
  console.log('\n✅ all functions warmed');
})().catch((e) => {
  console.error('warmup failed:', e.message);
  process.exit(1);
});
