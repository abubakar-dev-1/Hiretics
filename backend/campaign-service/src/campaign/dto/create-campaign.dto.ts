import { IsString, IsOptional, IsBoolean, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum CampaignStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  NOT_STARTED = 'not-started',
  ARCHIVED = 'archived',
}

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

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsString()
  company_name: string;

  @IsString()
  job_role: string;

  @IsString()
  job_description: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @IsOptional()
  @IsBoolean()
  is_archived?: boolean;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  criteria?: CampaignCriteria;
}
