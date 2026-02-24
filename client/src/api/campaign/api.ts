import { apiRequest } from "@/lib/api";
import { Campaign } from "@/types/campaign";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getUserId(): string {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || "";
}

function buildUrl(path: string): string {
  const userId = getUserId();
  const url = new URL(`${BASE_URL}${path}`);
  if (userId) url.searchParams.append("user_id", userId);
  return url.toString();
}

export async function createCampaign(data: Campaign) {
  return apiRequest<Campaign>("/campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const getCampaigns = async (isArchived?: boolean): Promise<Campaign[]> => {
  const userId = getUserId();
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  if (isArchived !== undefined) params.append("is_archived", String(isArchived));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<Campaign[]>(`/campaigns${qs}`);
};

export const getFavouriteCampaigns = async (): Promise<Campaign[]> => {
  const userId = getUserId();
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<Campaign[]>(`/campaigns/favourite${qs}`);
};

export const getCampaign = async (id: string): Promise<Campaign> => {
  const response = await fetch(buildUrl(`/campaigns/${id}`));
  if (!response.ok) {
    throw new Error('Failed to fetch campaign');
  }
  return response.json();
};

export const archiveCampaign = async (id: string): Promise<Campaign> => {
  const response = await fetch(buildUrl(`/campaigns/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_archived: true, status: 'completed' }),
  });
  if (!response.ok) {
    throw new Error('Failed to archive campaign');
  }
  return response.json();
};

export const favoriteCampaign = async (id: string, isFavorite?: boolean): Promise<Campaign> => {
  const body: any = {};
  if (typeof isFavorite === "boolean") body.is_favorite = isFavorite;

  const response = await fetch(buildUrl(`/campaigns/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Failed to favorite campaign');
  }
  return response.json();
};

export const updateCampaign = async (id: string, data: any): Promise<Campaign> => {
  const response = await fetch(buildUrl(`/campaigns/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update campaign');
  }
  return response.json();
};

export const startCampaign = async (id: string): Promise<Campaign> => {
  const response = await fetch(buildUrl(`/campaigns/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ongoing' }),
  });
  if (!response.ok) {
    throw new Error('Failed to start campaign');
  }
  return response.json();
};

export const stopCampaign = async (id: string): Promise<Campaign> => {
  const response = await fetch(buildUrl(`/campaigns/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' }),
  });
  if (!response.ok) {
    throw new Error('Failed to end campaign');
  }
  return response.json();
};

export const deleteCampaign = async (id: string): Promise<void> => {
  const response = await fetch(buildUrl(`/campaigns/${id}`), {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete campaign');
  }
};

export const restoreCampaign = async (id: string): Promise<Campaign> => {
  const response = await fetch(buildUrl(`/campaigns/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_archived: false }),
  });
  if (!response.ok) {
    throw new Error('Failed to restore campaign');
  }
  return response.json();
};
