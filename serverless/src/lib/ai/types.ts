/** Shared AI types. Mirrors the proven shape from the old pdf-ranking-service. */

export interface ScoringBreakdown {
  skill_match_score: number;
  experience_score: number;
  education_score: number;
  location_score: number;
  keyword_score: number;
  overall_score: number;
}

export type Relevance = 'high' | 'medium' | 'low' | 'irrelevant';

export interface CvAnalysis {
  name: string;
  email: string;
  city: string;
  university: string;
  age: number;
  score: number;
  scoring_breakdown: ScoringBreakdown;
  matched_skills: string[];
  matched_keywords: string[];
  relevance: Relevance;
  ranking_reason: string;
}

export interface AnalyzeInput {
  resumeText: string;
  jobDescription: string;
  jobRole: string;
  /** Optional structured scoring criteria (skills/weights/keywords/etc.). */
  criteria?: unknown;
}

/* ── AI campaign-authoring assist (Phase 8) ─────────────────────────────── */

export type AssistAction = 'title' | 'description' | 'criteria' | 'all';

export interface AssistInput {
  action: AssistAction;
  /** What the recruiter has typed so far — any subset may be present. */
  jobRole?: string;
  jobTitle?: string;
  jobDescription?: string;
  seniority?: string;
  industry?: string;
  /** Free-text hints ("remote, fintech, must know AWS"). */
  notes?: string;
}

export interface AssistCriteria {
  required_skills: { name: string; weight: number }[];
  required_keywords: string[];
  preferred_universities: string[];
  preferred_cities: string[];
  minimum_experience_years: number;
  minimum_cgpa: number;
}

/** Only the fields relevant to the requested action are populated. */
export interface AssistResult {
  title?: string;
  job_role?: string;
  job_description?: string;
  criteria?: AssistCriteria;
}

export interface AiProvider {
  readonly name: string;
  analyze(input: AnalyzeInput): Promise<CvAnalysis>;
  /** Generate campaign authoring suggestions (title/description/criteria). */
  assist(input: AssistInput): Promise<AssistResult>;
}
