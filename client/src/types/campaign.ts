export interface SkillCriterion {
  name: string;
  weight: number;
}

export interface CampaignCriteria {
  required_skills: SkillCriterion[];
  preferred_universities: string[];
  minimum_cgpa: number;
  preferred_cities: string[];
  minimum_experience_years: number;
  required_keywords: string[];
}

export interface Campaign {
  id?: string;
  name: string;
  company_name: string;
  job_role: string;
  job_description: string;
  status?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
  start_date?: string;
  end_date?: string;
  criteria?: CampaignCriteria;
  publicHash?: string;
  visibility?: "private" | "public";
}
