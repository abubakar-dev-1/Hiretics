import { SQSClient, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import { REGION, INTERNAL_ENDPOINT, LOCAL_CREDS } from './aws';

/** Shared SQS client (LocalStack-internal endpoint), used by the admin console. */
export const sqs = new SQSClient({
  region: REGION,
  ...(INTERNAL_ENDPOINT ? { endpoint: INTERNAL_ENDPOINT } : {}),
  ...LOCAL_CREDS,
});

export interface QueueDepth {
  available: number; // messages waiting to be processed
  inFlight: number; // messages being processed (not visible)
  delayed: number;
}

/** Live queue depth — the core metric for the event-driven infra monitor. */
export async function getQueueDepth(queueUrl: string): Promise<QueueDepth> {
  const res = await sqs.send(
    new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: [
        'ApproximateNumberOfMessages',
        'ApproximateNumberOfMessagesNotVisible',
        'ApproximateNumberOfMessagesDelayed',
      ],
    }),
  );
  const a = res.Attributes ?? {};
  return {
    available: Number(a.ApproximateNumberOfMessages ?? 0),
    inFlight: Number(a.ApproximateNumberOfMessagesNotVisible ?? 0),
    delayed: Number(a.ApproximateNumberOfMessagesDelayed ?? 0),
  };
}
