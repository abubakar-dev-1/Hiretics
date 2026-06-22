import { authHeaders } from "@/lib/auth";
import { resilientFetch } from "@/lib/http";

const BASE = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

export interface QueueDepth {
  available: number;
  inFlight: number;
  delayed: number;
}

export interface InfraMetrics {
  provider: { ai: string; billing: string };
  queues: { resume: QueueDepth; dlq: QueueDepth };
  pipeline: {
    totalCandidates: number;
    scored: number;
    pending: number;
    pendingCredits: number;
    manualReview: number;
    rejected: number;
    byStatus: Record<string, number>;
  };
  tenants: { total: number; pro: number; suspended: number };
}

export interface Tenant {
  companyId: string;
  name: string;
  plan: "free" | "pro";
  availableCredits: number;
  aiAuthorCount: number;
  suspended: boolean;
  createdAt: string;
  userCount: number;
}

export interface RevenueSummary {
  currency: string;
  totalCents: number;
  creditsRevenueCents: number;
  proRevenueCents: number;
  paidCount: number;
  pendingCount: number;
  byDay: Record<string, number>;
  recent: {
    txnId: string;
    companyId: string;
    kind: "credits" | "pro";
    credits?: number;
    amountCents: number;
    currency: string;
    provider: string;
    paidAt: string;
  }[];
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await resilientFetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options?.headers || {}) },
  });
  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${path}`);
  return res.json();
}

export const getInfra = () => req<InfraMetrics>("/admin/infra");
export const getTenants = () => req<Tenant[]>("/admin/tenants");
export const getRevenue = () => req<RevenueSummary>("/admin/revenue");

export const suspendTenant = (id: string, suspended: boolean) =>
  req<{ companyId: string; suspended: boolean }>(`/admin/tenants/${id}/suspend`, {
    method: "POST",
    body: JSON.stringify({ suspended }),
  });

export const grantCredits = (id: string, amount: number) =>
  req<{ companyId: string; availableCredits: number; granted: number }>(
    `/admin/tenants/${id}/credits`,
    { method: "POST", body: JSON.stringify({ amount }) },
  );
