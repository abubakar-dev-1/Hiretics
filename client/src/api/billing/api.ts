import { authHeaders } from "@/lib/auth";
import { resilientFetch } from "@/lib/http";

const BASE = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  amountCents: number;
  currency: string;
}

export interface PacksResponse {
  packs: CreditPack[];
  pro: { id: string; name: string; amountCents: number; currency: string };
  provider: "stripe" | "mock";
}

export interface CompanyInfo {
  companyId: string;
  name: string;
  availableCredits: number;
  plan: "free" | "pro";
  aiAuthorCount: number;
  entitlement?: {
    plan: "free" | "pro";
    aiAuthor: { limit: number | null; used: number; remaining: number | null; unlimited: boolean };
  };
}

export interface CheckoutResponse {
  txnId: string;
  provider: "stripe" | "mock";
  url?: string;
  mock: boolean;
}

export interface Transaction {
  txnId: string;
  kind: "credits" | "pro";
  credits?: number;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  provider: "stripe" | "mock";
  createdAt: string;
  paidAt?: string;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await resilientFetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options?.headers || {}) },
  });
  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${path}`);
  return res.json();
}

export const getPacks = () => req<PacksResponse>("/billing/packs");
export const getCompany = () => req<CompanyInfo>("/company");
export const getTransactions = () => req<Transaction[]>("/billing/transactions");

export const createCheckout = (kind: "credits" | "pro", packId?: string) =>
  req<CheckoutResponse>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ kind, packId }),
  });

export const mockConfirm = (txnId: string) =>
  req<{ message: string; company: CompanyInfo }>("/billing/mock-confirm", {
    method: "POST",
    body: JSON.stringify({ txnId }),
  });

/** Drives a checkout to completion: redirects for Stripe, confirms inline for mock. */
export async function purchase(
  kind: "credits" | "pro",
  packId?: string,
): Promise<{ completed: boolean }> {
  const session = await createCheckout(kind, packId);
  if (session.mock) {
    await mockConfirm(session.txnId);
    return { completed: true };
  }
  if (session.url) {
    window.location.href = session.url; // Stripe hosted checkout
    return { completed: false };
  }
  throw new Error("Checkout did not return a redirect URL");
}
