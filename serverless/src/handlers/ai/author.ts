import { authed } from '../../lib/rbac';
import { ok, badRequest, serverError, json } from '../../lib/response';
import { getAiProvider, type AssistAction } from '../../lib/ai';
import { tryConsumeAiAuthor, addAiAuthorRefund } from '../../models/company';
import { FREE_AI_AUTHOR_LIMIT } from '../../lib/entitlements';

const ACTIONS: AssistAction[] = ['title', 'description', 'criteria', 'all'];

/**
 * POST /ai/author  (auth)
 * Synchronous AI authoring assist for the campaign-creation dialog.
 * Entitlement-gated server-side: the free tier gets FREE_AI_AUTHOR_LIMIT
 * generations, after which a 402 prompts an upgrade to Pro.
 */
export const handler = authed(async (event, ctx) => {
  try {
    const b = JSON.parse(event.body || '{}');
    const action = (b.action || 'all') as AssistAction;
    if (!ACTIONS.includes(action)) {
      return badRequest(`action must be one of: ${ACTIONS.join(', ')}`);
    }

    // Entitlement gate (atomic): consume one free generation unless Pro.
    const gate = await tryConsumeAiAuthor(ctx.companyId, FREE_AI_AUTHOR_LIMIT);
    if (!gate.allowed) {
      return json(402, {
        error: 'AI authoring limit reached on the Free plan. Upgrade to Pro for unlimited use.',
        code: 'UPGRADE_REQUIRED',
        plan: gate.plan,
        limit: FREE_AI_AUTHOR_LIMIT,
      });
    }

    let result;
    try {
      result = await getAiProvider().assist({
        action,
        jobRole: b.jobRole || b.job_role,
        jobTitle: b.jobTitle || b.title || b.name,
        jobDescription: b.jobDescription || b.job_description,
        seniority: b.seniority,
        industry: b.industry,
        notes: b.notes,
      });
    } catch (aiErr: any) {
      // Don't burn the user's free generation on a provider failure — refund it.
      if (gate.plan === 'free') await addAiAuthorRefund(ctx.companyId).catch(() => {});
      return serverError(aiErr?.message || 'AI authoring failed');
    }

    return ok({
      result,
      entitlement: {
        plan: gate.plan,
        remaining: gate.plan === 'pro' ? null : gate.remaining,
        unlimited: gate.plan === 'pro',
      },
    });
  } catch (e: any) {
    return serverError(e?.message || 'ai author failed');
  }
});
