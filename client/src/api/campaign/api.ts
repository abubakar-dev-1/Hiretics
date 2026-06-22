import { apiRequest } from "@/lib/api";
import { authHeaders } from "@/lib/auth";
import { resilientFetch } from "@/lib/http";
import { Campaign } from "@/types/campaign";

const BASE = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

function authedFetch(path: string, options?: RequestInit) {
  return resilientFetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options?.headers || {}) },
  });
}

export async function createCampaign(data: Campaign) {
  return apiRequest<Campaign>("/campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const getCampaigns = async (isArchived?: boolean): Promise<Campaign[]> => {
  const qs = isArchived !== undefined ? `?is_archived=${isArchived}` : "";
  return apiRequest<Campaign[]>(`/campaigns${qs}`);
};

// Backend has no dedicated favourites route — filter client-side.
export const getFavouriteCampaigns = async (): Promise<Campaign[]> => {
  const all = await getCampaigns();
  return all.filter((c) => c.is_favorite);
};

export const getCampaign = async (id: string): Promise<Campaign> => {
  const res = await authedFetch(`/campaigns/${id}`);
  if (!res.ok) throw new Error("Failed to fetch campaign");
  return res.json();
};

// Public apply page fetches a campaign by its secure hash (no auth).
export const getPublicCampaign = async (hash: string): Promise<Campaign> => {
  const res = await resilientFetch(`${BASE}/public/campaigns/${hash}`);
  if (!res.ok) throw new Error("Failed to fetch campaign");
  return res.json();
};

const update = async (id: string, body: Record<string, unknown>): Promise<Campaign> => {
  const res = await authedFetch(`/campaigns/${id}`, { method: "PUT", body: JSON.stringify(body) });
  if (!res.ok) throw new Error("Failed to update campaign");
  return res.json();
};

export const archiveCampaign = (id: string) => update(id, { is_archived: true, status: "completed" });
export const favoriteCampaign = (id: string, isFavorite?: boolean) =>
  update(id, typeof isFavorite === "boolean" ? { is_favorite: isFavorite } : {});
export const updateCampaign = (id: string, data: Record<string, unknown>) => update(id, data);
export const startCampaign = (id: string) => update(id, { status: "ongoing" });
export const stopCampaign = (id: string) => update(id, { status: "completed" });
export const restoreCampaign = (id: string) => update(id, { is_archived: false });

export const deleteCampaign = async (id: string): Promise<void> => {
  const res = await authedFetch(`/campaigns/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete campaign");
};
