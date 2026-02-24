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

function qs(campaignId?: string) {
  return campaignId ? `?campaign_id=${campaignId}` : "";
}

// ---------- API functions ----------

export async function fetchOverview(campaignId?: string): Promise<OverviewStats> {
  const { data } = await axios.get(`${BASE}/analytics/overview${qs(campaignId)}`);
  return data;
}

export async function fetchScoreDistribution(campaignId?: string): Promise<ScoreBucket[]> {
  const { data } = await axios.get(`${BASE}/analytics/scores${qs(campaignId)}`);
  return data;
}

export async function fetchCampaignsSummary(): Promise<CampaignSummary[]> {
  const { data } = await axios.get(`${BASE}/analytics/campaigns-summary`);
  return data;
}

export async function fetchAgeStats(campaignId?: string): Promise<AgeDataItem[]> {
  const { data } = await axios.get(`${BASE}/analytics/age${qs(campaignId)}`);
  return data;
}

export async function fetchUniversityStats(campaignId?: string): Promise<UniversityDataItem[]> {
  const { data } = await axios.get(`${BASE}/analytics/university${qs(campaignId)}`);
  return data;
}

export async function fetchCityStats(campaignId?: string): Promise<CityDataItem[]> {
  const { data } = await axios.get(`${BASE}/analytics/city${qs(campaignId)}`);
  return data;
}
