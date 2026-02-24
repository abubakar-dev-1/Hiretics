import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { v4 as uuidv4 } from 'uuid';
import * as pdfParse from 'pdf-parse';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {
  CVAnalysisResult,
  ApplicantData,
  ScoringBreakdown,
} from './interfaces/cv-analysis.interface';

dotenv.config();

@Injectable()
export class CvService {
  private async getCvLink(
    file: Express.Multer.File,
    campaignId: string,
  ): Promise<string> {
    const bucketName = 'resumes';
    const filename = `${uuidv4()}.pdf`;
    const filePath = `${campaignId}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  private buildEnhancedPrompt(
    resumeText: string,
    jobDescription: string,
    jobRole: string,
    criteria: any,
  ): string {
    const skillsList = criteria.required_skills
      ?.map((s: any) => `${s.name} (weight: ${s.weight}/5)`)
      .join(', ') || 'None specified';

    const keywordsList = criteria.required_keywords?.join(', ') || 'None specified';
    const universitiesList = criteria.preferred_universities?.join(', ') || 'Any';
    const citiesList = criteria.preferred_cities?.join(', ') || 'Any';
    const minExp = criteria.minimum_experience_years || 0;
    const minCgpa = criteria.minimum_cgpa || 0;

    return `You are an expert HR recruiter AI. Analyze the following resume against the job description and scoring criteria.

JOB ROLE: ${jobRole}

JOB DESCRIPTION:
${jobDescription}

SCORING CRITERIA:
- Required Skills (with weights): ${skillsList}
- Required Keywords: ${keywordsList}
- Preferred Universities: ${universitiesList}
- Preferred Cities: ${citiesList}
- Minimum Experience: ${minExp} years
- Minimum CGPA: ${minCgpa}

RESUME:
${resumeText}

INSTRUCTIONS:
1. Extract basic info: name, email, city, university, age
2. Score each category from 0-100:
   - skill_match_score: How well the candidate's skills match required skills (consider weights)
   - experience_score: How relevant and sufficient the experience is
   - education_score: University match, CGPA, relevant education
   - location_score: City preference match (100 if matches, 50 if nearby, 30 otherwise)
   - keyword_score: How many required keywords appear in the resume
3. Calculate overall_score as weighted average: skills(35%) + experience(25%) + education(15%) + location(10%) + keywords(15%)
4. List matched_skills: skills from required_skills found in resume
5. List matched_keywords: keywords from required_keywords found in resume
6. Classify relevance: "high" (score>=70), "medium" (score 40-69), "low" (score 20-39), "irrelevant" (score<20)
7. Write a ranking_reason: One concise sentence (max 20 words) explaining WHY this candidate got this score. Be SPECIFIC to this person — mention their actual skills, experience years, role, or gaps. Examples: "5 years React experience and strong Node.js skills match core requirements." or "Marketing background with no relevant technical skills for this developer role."

Return ONLY valid JSON:
{
  "name": "",
  "email": "",
  "city": "",
  "university": "",
  "age": 0,
  "score": 0,
  "scoring_breakdown": {
    "skill_match_score": 0,
    "experience_score": 0,
    "education_score": 0,
    "location_score": 0,
    "keyword_score": 0,
    "overall_score": 0
  },
  "matched_skills": [],
  "matched_keywords": [],
  "relevance": "medium",
  "ranking_reason": ""
}`;
  }

  private buildBasicPrompt(
    resumeText: string,
    jobDescription: string,
    jobRole: string,
  ): string {
    return `Given the following resume and job description, extract the following:
- name
- email
- city
- university
- age
Also, give a score from 1 to 100 based on how well the resume fits the job description.
Provide a scoring breakdown estimating each category 0-100.
List any skills and keywords from the job description that match the resume.
Classify relevance: "high" (score>=70), "medium" (score 40-69), "low" (score 20-39), "irrelevant" (score<20).
Write a ranking_reason: One concise sentence (max 20 words) explaining WHY this candidate got this score. Be SPECIFIC — mention their actual skills, years of experience, role, or gaps.

Return ONLY valid JSON:
{
  "name": "",
  "email": "",
  "city": "",
  "university": "",
  "age": 0,
  "score": 0,
  "scoring_breakdown": {
    "skill_match_score": 0,
    "experience_score": 0,
    "education_score": 0,
    "location_score": 0,
    "keyword_score": 0,
    "overall_score": 0
  },
  "matched_skills": [],
  "matched_keywords": [],
  "relevance": "medium",
  "ranking_reason": ""
}

Job Role: ${jobRole}

Job Description:
${jobDescription}

Resume:
${resumeText}`;
  }

  private async getCvInfoAndScore(
    file: Express.Multer.File,
    campaignId: string,
    userId: string,
  ): Promise<CVAnalysisResult> {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('job_description, job_role, criteria')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (error || !campaign?.job_description) {
      throw new InternalServerErrorException('Could not fetch job description');
    }

    const jobDescription = campaign.job_description as string;
    const jobRole = (campaign.job_role as string) || '';
    const criteria = campaign.criteria;

    const parsed = await pdfParse(file.buffer);
    const resumeText = parsed.text;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = criteria
      ? this.buildEnhancedPrompt(resumeText, jobDescription, jobRole, criteria)
      : this.buildBasicPrompt(resumeText, jobDescription, jobRole);

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

      const parsedData: Partial<CVAnalysisResult> = JSON.parse(
        cleanedText,
      ) as Partial<CVAnalysisResult>;

      const score = parseInt(String(parsedData.score)) || 0;

      // Determine relevance from score if not provided
      let relevance = parsedData.relevance || 'medium';
      if (!parsedData.relevance) {
        if (score >= 70) relevance = 'high';
        else if (score >= 40) relevance = 'medium';
        else if (score >= 20) relevance = 'low';
        else relevance = 'irrelevant';
      }

      // Build scoring breakdown with safe defaults
      const breakdown = parsedData.scoring_breakdown;
      const scoringBreakdown: ScoringBreakdown = {
        skill_match_score: breakdown?.skill_match_score ?? 0,
        experience_score: breakdown?.experience_score ?? 0,
        education_score: breakdown?.education_score ?? 0,
        location_score: breakdown?.location_score ?? 0,
        keyword_score: breakdown?.keyword_score ?? 0,
        overall_score: breakdown?.overall_score ?? score,
      };

      return {
        name: parsedData.name || 'Unknown',
        email: parsedData.email || '',
        city: parsedData.city || '',
        age: parseInt(String(parsedData.age)) || 0,
        university: parsedData.university || '',
        score,
        scoring_breakdown: scoringBreakdown,
        matched_skills: Array.isArray(parsedData.matched_skills) ? parsedData.matched_skills : [],
        matched_keywords: Array.isArray(parsedData.matched_keywords) ? parsedData.matched_keywords : [],
        relevance,
        ranking_reason: parsedData.ranking_reason || '',
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new InternalServerErrorException('Failed to parse CV information');
    }
  }

  private async postApplicantData(applicant: ApplicantData): Promise<void> {
    const { error } = await supabase.from('applicants').insert(applicant);
    if (error) {
      throw new InternalServerErrorException(
        'Failed to insert applicant data: ' + error.message,
      );
    }
  }

  async processCv(
    file: Express.Multer.File,
    campaignId: string,
    userId: string,
  ): Promise<{
    message: string;
    data: CVAnalysisResult & { cv_link: string; campaign_id: string };
  }> {
    try {
      const cvLink = await this.getCvLink(file, campaignId);
      const info = await this.getCvInfoAndScore(file, campaignId, userId);

      await this.postApplicantData({
        name: info.name,
        email: info.email,
        cv_link: cvLink,
        age: info.age,
        campaign_id: campaignId,
        user_id: userId,
        city: info.city,
        university: info.university,
        score: info.score,
        scoring_breakdown: info.scoring_breakdown,
        matched_skills: info.matched_skills,
        matched_keywords: info.matched_keywords,
        relevance: info.relevance,
        ranking_reason: info.ranking_reason,
      });

      return {
        message: 'CV processed successfully',
        data: {
          ...info,
          cv_link: cvLink,
          campaign_id: campaignId,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        'Failed to process CV: ' + errorMessage,
      );
    }
  }

  async getRankedCvs(campaignId: string, userId: string): Promise<
    Array<{
      name: string;
      email: string;
      cv_link: string;
      score: number;
      city: string;
      university: string;
      scoring_breakdown: ScoringBreakdown | null;
      matched_skills: string[];
      matched_keywords: string[];
      relevance: string;
      ranking_reason: string;
    }>
  > {
    console.log('Searching for applicants with campaign_id:', campaignId);

    const { data, error } = await supabase
      .from('applicants')
      .select('name, email, cv_link, score, city, university, scoring_breakdown, matched_skills, matched_keywords, relevance, ranking_reason, campaign_id')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .order('score', { ascending: false });

    console.log('Filtered applicants for campaign:', data?.length || 0);

    if (error) {
      console.error('Database error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch applicants: ' + error.message,
      );
    }

    return (data || []).map((applicant: any) => ({
      name: applicant.name,
      email: applicant.email,
      cv_link: applicant.cv_link,
      score: applicant.score ?? 0,
      city: applicant.city ?? '',
      university: applicant.university ?? '',
      scoring_breakdown: applicant.scoring_breakdown ?? null,
      matched_skills: applicant.matched_skills ?? [],
      matched_keywords: applicant.matched_keywords ?? [],
      relevance: applicant.relevance ?? 'medium',
      ranking_reason: applicant.ranking_reason ?? '',
    }));
  }
}
