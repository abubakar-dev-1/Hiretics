import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL_ANALYTICS;

// ---------- Types ----------

export interface OverviewStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalApplicants: number;
  averageScore: number;
}

export interface ScoreBucket {
  range: string;
  count: number;
}

export interface CampaignSummary {
  id: string;
  name: string;
  status: string;
  applicantCount: number;
  avgScore: number;
}

export interface AgeDataItem {
  age: number;
  count: number;
}

export interface UniversityDataItem {
  university: string;
  count: number;
}

export interface CityDataItem {
  city: string;
  count: number;
  percentage: string;
}

// ---------- Helpers ----------

function qs(userId: string, campaignId?: string) {
  const params = new URLSearchParams();
  params.append("user_id", userId);
  if (campaignId) params.append("campaign_id", campaignId);
  return `?${params.toString()}`;
}

// ---------- API functions ----------

export async function fetchOverview(userId: string, campaignId?: string): Promise<OverviewStats> {
  const { data } = await axios.get(`${BASE}/analytics/overview${qs(userId, campaignId)}`);
  return data;
}

export async function fetchScoreDistribution(userId: string, campaignId?: string): Promise<ScoreBucket[]> {
  const { data } = await axios.get(`${BASE}/analytics/scores${qs(userId, campaignId)}`);
  return data;
}

export async function fetchCampaignsSummary(userId: string): Promise<CampaignSummary[]> {
  const { data } = await axios.get(`${BASE}/analytics/campaigns-summary?user_id=${userId}`);
  return data;
}

export async function fetchAgeStats(userId: string, campaignId?: string): Promise<AgeDataItem[]> {
  const { data } = await axios.get(`${BASE}/analytics/age${qs(userId, campaignId)}`);
  return data;
}

export async function fetchUniversityStats(userId: string, campaignId?: string): Promise<UniversityDataItem[]> {
  const { data } = await axios.get(`${BASE}/analytics/university${qs(userId, campaignId)}`);
  return data;
}

export async function fetchCityStats(userId: string, campaignId?: string): Promise<CityDataItem[]> {
  const { data } = await axios.get(`${BASE}/analytics/city${qs(userId, campaignId)}`);
  return data;
}
