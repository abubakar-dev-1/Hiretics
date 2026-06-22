import { authHeaders } from "./auth";
import { resilientFetch } from "./http";

// All dashboard API calls go to the serverless API Gateway (LocalStack).
export const BASE_URL = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await resilientFetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}
