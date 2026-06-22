/**
 * Central place for plan limits / entitlement rules (Phase 8).
 * Keep all "what does each tier allow" knowledge here so handlers stay thin.
 */

/** Free tier gets this many AI campaign-authoring generations, then Pro is required. */
export const FREE_AI_AUTHOR_LIMIT = 3;

export type Plan = 'free' | 'pro';

/** Human-readable entitlement summary for the client (badges, upsell copy). */
export function entitlementSummary(plan: Plan, aiAuthorCount: number) {
  const aiAuthorRemaining =
    plan === 'pro' ? null : Math.max(0, FREE_AI_AUTHOR_LIMIT - (aiAuthorCount ?? 0));
  return {
    plan,
    aiAuthor: {
      limit: plan === 'pro' ? null : FREE_AI_AUTHOR_LIMIT,
      used: aiAuthorCount ?? 0,
      remaining: aiAuthorRemaining, // null = unlimited
      unlimited: plan === 'pro',
    },
  };
}
