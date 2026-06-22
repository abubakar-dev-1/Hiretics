/**
 * Post-deploy fix-up: wire S3 -> SQS ObjectCreated notifications.
 *
 * LocalStack's CloudFormation does not reliably apply an S3
 * NotificationConfiguration to a bucket that already existed, so we set it
 * directly here (idempotent). Run after `npm run bootstrap`.
 */
const { S3Client, PutBucketNotificationConfigurationCommand, GetBucketNotificationConfigurationCommand } = require('@aws-sdk/client-s3');

const ENDPOINT = process.env.AWS_ENDPOINT || 'http://localhost:4566';
const STAGE = process.env.STAGE || 'local';
const SERVICE = 'hiretics-serverless';

// Both event-driven pipelines: recruiter ranking + candidate analysis.
const PIPELINES = [
  {
    bucket: `${SERVICE}-resumes-${STAGE}`,
    queueArn: `arn:aws:sqs:us-east-1:000000000000:${SERVICE}-resume-queue-${STAGE}`,
  },
  {
    bucket: `${SERVICE}-analysis-${STAGE}`,
    queueArn: `arn:aws:sqs:us-east-1:000000000000:${SERVICE}-analysis-queue-${STAGE}`,
  },
];

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

(async () => {
  let allOk = true;
  for (const { bucket, queueArn } of PIPELINES) {
    try {
      await s3.send(
        new PutBucketNotificationConfigurationCommand({
          Bucket: bucket,
          NotificationConfiguration: {
            QueueConfigurations: [{ QueueArn: queueArn, Events: ['s3:ObjectCreated:*'] }],
          },
        }),
      );
      const check = await s3.send(new GetBucketNotificationConfigurationCommand({ Bucket: bucket }));
      const n = (check.QueueConfigurations || []).length;
      console.log(n > 0
        ? `✅ S3 -> SQS notification wired (${bucket} -> ${queueArn})`
        : `❌ Notification not set for ${bucket}`);
      if (!n) allOk = false;
    } catch (e) {
      console.error(`wire-notifications failed for ${bucket}:`, e.message);
      allOk = false;
    }
  }
  process.exit(allOk ? 0 : 1);
})();
