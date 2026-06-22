import { superAdminOnly } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { getQueueDepth } from '../../lib/sqs';
import { listAllCompanies } from '../../models/company';
import { countAllByStatus } from '../../models/candidate';
import { billingProviderName } from '../../lib/billing';

/**
 * GET /admin/infra  (SuperAdmin)
 * The event-driven infrastructure monitor: live SQS / DLQ depth plus pipeline
 * and tenant rollups. This is the most architecture-aligned view in the product.
 */
export const handler = superAdminOnly(async () => {
  try {
    const queueUrl = process.env.RESUME_QUEUE_URL!;
    const dlqUrl = process.env.RESUME_DLQ_URL!;

    const [queue, dlq, companies, byStatus] = await Promise.all([
      getQueueDepth(queueUrl).catch(() => null),
      dlqUrl ? getQueueDepth(dlqUrl).catch(() => null) : Promise.resolve(null),
      listAllCompanies(),
      countAllByStatus().catch(() => ({} as Record<string, number>)),
    ]);

    const totalCandidates = Object.values(byStatus).reduce((a, b) => a + b, 0);

    return ok({
      provider: { ai: process.env.AI_PROVIDER || 'openai', billing: billingProviderName() },
      queues: {
        resume: queue ?? { available: 0, inFlight: 0, delayed: 0 },
        dlq: dlq ?? { available: 0, inFlight: 0, delayed: 0 },
      },
      pipeline: {
        totalCandidates,
        scored: byStatus['Scored'] ?? 0,
        pending: byStatus['Pending'] ?? 0,
        pendingCredits: byStatus['Pending Credits'] ?? 0,
        manualReview: byStatus['Manual Review'] ?? 0,
        rejected: byStatus['Rejected'] ?? 0,
        byStatus,
      },
      tenants: {
        total: companies.length,
        pro: companies.filter((c) => c.plan === 'pro').length,
        suspended: companies.filter((c) => c.suspended).length,
      },
    });
  } catch (e: any) {
    return serverError(e?.message || 'failed to load infra metrics');
  }
});
