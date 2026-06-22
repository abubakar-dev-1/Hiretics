import { authHeaders } from "@/lib/auth";
import { resilientFetch } from "@/lib/http";
import { CampaignCriteria } from "@/types/campaign";

const BASE = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

export type AssistAction = "title" | "description" | "criteria" | "all";

export interface AssistContext {
  jobRole?: string;
  jobTitle?: string;
  jobDescription?: string;
  seniority?: string;
  industry?: string;
  notes?: string;
}

export interface AssistResult {
  title?: string;
  job_role?: string;
  job_description?: string;
  criteria?: CampaignCriteria;
}

export interface AssistResponse {
  result: AssistResult;
  entitlement: { plan: "free" | "pro"; remaining: number | null; unlimited: boolean };
}

/** Thrown when the free AI-authoring quota is exhausted (HTTP 402). */
export class UpgradeRequiredError extends Error {
  code = "UPGRADE_REQUIRED" as const;
  constructor(message: string) {
    super(message);
    this.name = "UpgradeRequiredError";
  }
}

/** Call the entitlement-gated AI authoring assist. */
export async function assistCampaign(
  action: AssistAction,
  ctx: AssistContext,
): Promise<AssistResponse> {
  const res = await resilientFetch(`${BASE}/ai/author`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ action, ...ctx }),
  });

  if (res.status === 402) {
    const body = await res.json().catch(() => ({}));
    throw new UpgradeRequiredError(body.error || "Upgrade to Pro for unlimited AI authoring.");
  }
  if (!res.ok) {
    throw new Error((await res.text()) || "AI authoring failed");
  }
  return res.json();
}
