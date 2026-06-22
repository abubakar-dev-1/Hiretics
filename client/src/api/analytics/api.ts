import { authHeaders } from "@/lib/auth";
import { resilientFetch } from "@/lib/http";

const BASE = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

// ---------- Types ----------
export interface OverviewStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalApplicants: number;
  averageScore: number;
}
export interface ScoreBucket { range: string; count: number; }
export interface CampaignSummary {
  id: string;
  name: string;
  status: string;
  applicantCount: number;
  avgScore: number;
}
export interface AgeDataItem { age: number; count: number; }
export interface UniversityDataItem { university: string; count: number; }
export interface CityDataItem { city: string; count: number; percentage: number; }

// ---------- Helper ----------
// userId is ignored now (the backend scopes by the JWT); kept for signature compat.
async function get<T>(path: string, campaignId?: string): Promise<T> {
  const qs = campaignId ? `?campaign_id=${encodeURIComponent(campaignId)}` : "";
  const res = await resilientFetch(`${BASE}${path}${qs}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

// ---------- API functions ----------
export const fetchOverview = (_userId: string, campaignId?: string) =>
  get<OverviewStats>("/analytics/overview", campaignId);
export const fetchScoreDistribution = (_userId: string, campaignId?: string) =>
  get<ScoreBucket[]>("/analytics/scores", campaignId);
export const fetchCampaignsSummary = (_userId: string) =>
  get<CampaignSummary[]>("/analytics/campaigns-summary");
export const fetchAgeStats = (_userId: string, campaignId?: string) =>
  get<AgeDataItem[]>("/analytics/age", campaignId);
export const fetchUniversityStats = (_userId: string, campaignId?: string) =>
  get<UniversityDataItem[]>("/analytics/university", campaignId);
export const fetchCityStats = (_userId: string, campaignId?: string) =>
  get<CityDataItem[]>("/analytics/city", campaignId);
