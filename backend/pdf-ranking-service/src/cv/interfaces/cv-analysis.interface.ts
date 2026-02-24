export interface ScoringBreakdown {
  skill_match_score: number;
  experience_score: number;
  education_score: number;
  location_score: number;
  keyword_score: number;
  overall_score: number;
}

export interface CVAnalysisResult {
  name: string;
  email: string;
  city: string;
  age: number;
  university: string;
  score: number;
  scoring_breakdown?: ScoringBreakdown;
  matched_skills?: string[];
  matched_keywords?: string[];
  relevance?: string;
  ranking_reason?: string;
}

export interface ApplicantData {
  name: string;
  email: string;
  cv_link: string;
  age: number;
  campaign_id: string;
  user_id: string;
  city: string;
  university: string;
  score: number;
  scoring_breakdown?: ScoringBreakdown;
  matched_skills?: string[];
  matched_keywords?: string[];
  relevance?: string;
  ranking_reason?: string;
}
