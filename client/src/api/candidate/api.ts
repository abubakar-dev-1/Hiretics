import { authHeaders } from "@/lib/auth";
import { resilientFetch } from "@/lib/http";

const BASE = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

/* ── Types (mirror serverless lib/ai/career) ──────────────────────────────── */
export interface CareerAnalysisReport {
  generatedAt: string;
  snapshot: {
    fullName: string;
    currentRole: string;
    yearsExperience: number;
    topSkills: string[];
    industry: string;
    seniorityLevel: string;
  };
  overallReadinessScore: number;
  summary: string;
  skillDecay: { skill: string; decayLevel: "low" | "medium" | "high"; reason: string; recommendation: string }[];
  automationExposure: {
    area: string;
    riskScore: number;
    riskLevel: "low" | "moderate" | "high" | "critical";
    rationale: string;
    mitigation: string;
  }[];
  pivotPaths: {
    title: string;
    fitScore: number;
    reason: string;
    growthOutlook: string;
    transitionSteps: string[];
    estimatedTimeline: string;
    salaryRangeUSD: string;
  }[];
  actionPlan: { priority: "high" | "medium" | "low"; title: string; description: string; timeframe: string; category: string }[];
  cvImprovements: { id: string; section: string; issue: string; suggestion: string; example?: string; severity: "critical" | "important" | "nice-to-have" }[];
  marketSignals: { locationOutlook: string; targetLocationOutlook?: string; remoteOpportunityScore: number; demandTrend: string };
}

export interface CVThread {
  threadId: string;
  candidateId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  versionCount: number;
  latestCvId?: string;
  latestScore?: number;
}

export interface CVVersion {
  cvId: string;
  threadId: string;
  candidateId: string;
  label: string;
  status: "pending" | "analyzing" | "analyzed" | "failed";
  createdAt: string;
  readinessScore?: number;
  report?: CareerAnalysisReport;
  error?: string;
}

export interface ComparisonReport {
  generatedAt: string;
  scoreDelta: number;
  adherenceScore: number;
  coachNote: string;
  wins: string[];
  stillOpen: string[];
  newStrengths: string[];
  adherence: { previousActionTitle: string; status: string; evidence: string }[];
  skillProgress: { skill: string; previousDecayLevel: string; currentDecayLevel: string; direction: string }[];
}

export interface Job {
  id: string;
  name: string;
  company_name: string;
  job_role: string;
  job_description: string;
  status: string;
  criteria?: unknown;
}

export interface TailorResult {
  predictedMatchScore: number;
  fitSummary: string;
  matchedStrengths: string[];
  gaps: string[];
  tailoredBullets: { original?: string; improved: string; rationale: string }[];
  keywordsToAdd: string[];
}

export interface PresignBody {
  threadId?: string;
  title?: string;
  label?: string;
  currentLocation: string;
  targetLocation?: string;
  remotePreference: "remote" | "hybrid" | "onsite" | "any";
  employmentStatus: "employed" | "unemployed" | "freelancing" | "student" | "career-break";
  careerAspiration?: string;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await resilientFetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options?.headers || {}) },
  });
  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${path}`);
  return res.json();
}

export const getThreads = () => req<CVThread[]>("/candidate/threads");
export const getThread = (id: string) =>
  req<{ thread: CVThread; versions: CVVersion[] }>(`/candidate/threads/${id}`);
export const getCV = (id: string) => req<CVVersion>(`/candidate/cv/${id}`);
export const getComparisons = () => req<any[]>("/candidate/comparisons");
export const getJobs = () => req<Job[]>("/jobs");
export const getJob = (id: string) => req<Job>(`/jobs/${id}`);

export const compareVersions = (previousCvId: string, currentCvId: string) =>
  req<{ report: ComparisonReport }>("/candidate/compare", {
    method: "POST",
    body: JSON.stringify({ previousCvId, currentCvId }),
  });

export const tailorToJob = (cvId: string, campaignId: string) =>
  req<TailorResult & { cvId: string; campaignId: string }>("/candidate/tailor", {
    method: "POST",
    body: JSON.stringify({ cvId, campaignId }),
  });

export const applyToJob = (campaignId: string, cvId: string) =>
  req<{ applied: boolean; candidateId: string; status: string }>("/candidate/apply", {
    method: "POST",
    body: JSON.stringify({ campaignId, cvId }),
  });

/** Presign + direct PUT the CV to S3 (fires the analysis pipeline). */
export async function uploadCV(file: File, body: PresignBody): Promise<{ cvId: string; threadId: string }> {
  const { cvId, threadId, uploadUrl } = await req<{ cvId: string; threadId: string; uploadUrl: string }>(
    "/candidate/cv/presign",
    { method: "POST", body: JSON.stringify(body) },
  );
  const put = await fetch(uploadUrl, { method: "PUT", body: file });
  if (!put.ok) throw new Error("Upload failed");
  return { cvId, threadId };
}
