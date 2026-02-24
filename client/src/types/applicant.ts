export interface ScoringBreakdown {
  skill_match_score: number;
  experience_score: number;
  education_score: number;
  location_score: number;
  keyword_score: number;
  overall_score: number;
}

export interface EnhancedCandidate {
  id?: string;
  name: string;
  email: string;
  cv_link?: string;
  avatar?: string;
  score: number;
  city: string;
  university: string;
  scoring_breakdown: ScoringBreakdown | null;
  matched_skills: string[];
  matched_keywords: string[];
  relevance: string;
  ranking_reason: string;
}
