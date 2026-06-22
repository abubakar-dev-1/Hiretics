import type {
  AnalyzeInput,
  AssistCriteria,
  AssistInput,
  AssistResult,
  CvAnalysis,
  Relevance,
  ScoringBreakdown,
} from './types';

/**
 * Prompt building + response normalization, ported from the proven
 * pdf-ranking-service (backend/pdf-ranking-service/src/cv/cv.service.ts).
 * Provider-agnostic: every provider builds the same prompt and parses the same
 * way, so OpenAI / Gemini / mock all return an identical CvAnalysis shape.
 */

export function buildPrompt(input: AnalyzeInput): string {
  const { resumeText, jobDescription, jobRole, criteria } = input;
  const c = criteria as Record<string, any> | undefined;

  if (c) {
    const skillsList =
      c.required_skills?.map((s: any) => `${s.name} (weight: ${s.weight}/5)`).join(', ') ||
      'None specified';
    const keywordsList = c.required_keywords?.join(', ') || 'None specified';
    const universitiesList = c.preferred_universities?.join(', ') || 'Any';
    const citiesList = c.preferred_cities?.join(', ') || 'Any';
    const minExp = c.minimum_experience_years || 0;
    const minCgpa = c.minimum_cgpa || 0;

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
   - skill_match_score, experience_score, education_score, location_score, keyword_score
3. Calculate overall_score as weighted average: skills(35%) + experience(25%) + education(15%) + location(10%) + keywords(15%)
4. List matched_skills and matched_keywords found in the resume
5. Classify relevance: "high" (>=70), "medium" (40-69), "low" (20-39), "irrelevant" (<20)
6. Write a ranking_reason: one concise sentence (max 20 words), specific to this person.

${jsonInstruction()}`;
  }

  return `Given the following resume and job description, extract name, email, city, university, age, and give a score (1-100) for how well the resume fits the job. Provide a scoring breakdown (each category 0-100), list matched skills and keywords, classify relevance ("high">=70, "medium" 40-69, "low" 20-39, "irrelevant"<20), and write a one-sentence ranking_reason specific to this candidate.

Job Role: ${jobRole}

Job Description:
${jobDescription}

Resume:
${resumeText}

${jsonInstruction()}`;
}

function jsonInstruction(): string {
  return `Return ONLY valid JSON (no markdown fences):
{
  "name": "", "email": "", "city": "", "university": "", "age": 0, "score": 0,
  "scoring_breakdown": { "skill_match_score": 0, "experience_score": 0, "education_score": 0, "location_score": 0, "keyword_score": 0, "overall_score": 0 },
  "matched_skills": [], "matched_keywords": [], "relevance": "medium", "ranking_reason": ""
}`;
}

/** Parse + sanitize a raw model response into a guaranteed-valid CvAnalysis. */
export function parseAnalysis(raw: string): CvAnalysis {
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  const data = JSON.parse(cleaned) as Partial<CvAnalysis>;

  const score = toInt(data.score);
  let relevance: Relevance = data.relevance ?? deriveRelevance(score);

  const b = data.scoring_breakdown ?? ({} as Partial<ScoringBreakdown>);
  const scoring_breakdown: ScoringBreakdown = {
    skill_match_score: b.skill_match_score ?? 0,
    experience_score: b.experience_score ?? 0,
    education_score: b.education_score ?? 0,
    location_score: b.location_score ?? 0,
    keyword_score: b.keyword_score ?? 0,
    overall_score: b.overall_score ?? score,
  };

  return {
    name: data.name || 'Unknown',
    email: data.email || '',
    city: data.city || '',
    university: data.university || '',
    age: toInt(data.age),
    score,
    scoring_breakdown,
    matched_skills: Array.isArray(data.matched_skills) ? data.matched_skills : [],
    matched_keywords: Array.isArray(data.matched_keywords) ? data.matched_keywords : [],
    relevance,
    ranking_reason: data.ranking_reason || '',
  };
}

/* ── AI campaign-authoring assist (Phase 8) ───────────────────────────────
 * Generates campaign title / description / scoring-criteria suggestions from
 * whatever the recruiter has typed so far. Same provider-agnostic pattern as
 * analyze(): every provider builds this prompt and parses the same JSON shape.
 */
export function buildAssistPrompt(input: AssistInput): string {
  const { action, jobRole, jobTitle, jobDescription, seniority, industry, notes } = input;

  const ctx = [
    jobTitle && `Current title: ${jobTitle}`,
    jobRole && `Role: ${jobRole}`,
    seniority && `Seniority: ${seniority}`,
    industry && `Industry: ${industry}`,
    jobDescription && `Current description: ${jobDescription}`,
    notes && `Recruiter notes: ${notes}`,
  ]
    .filter(Boolean)
    .join('\n');

  const want =
    action === 'title'
      ? 'Generate ONLY a concise, attractive job/campaign "title".'
      : action === 'description'
      ? 'Generate ONLY a professional, structured "job_description" (responsibilities + requirements, ~120-200 words).'
      : action === 'criteria'
      ? 'Generate ONLY structured scoring "criteria" for ranking candidates.'
      : 'Generate a full set: "title", "job_role", "job_description", and structured "criteria".';

  return `You are an expert technical recruiter helping author a hiring campaign.

CONTEXT (may be partial):
${ctx || '(nothing entered yet — infer sensible defaults from the role)'}

TASK: ${want}

GUIDELINES:
- Be specific and realistic for the role/seniority/industry.
- required_skills: 4-8 items, each {"name", "weight"} where weight is 1-5 (5 = critical).
- required_keywords: 5-10 ATS keywords a strong CV would contain.
- preferred_universities / preferred_cities: [] if not implied by the notes.
- minimum_experience_years and minimum_cgpa: numbers (0 if not applicable).

Return ONLY valid JSON (no markdown fences). Include only the keys relevant to the task:
{
  "title": "",
  "job_role": "",
  "job_description": "",
  "criteria": {
    "required_skills": [{ "name": "", "weight": 3 }],
    "required_keywords": [],
    "preferred_universities": [],
    "preferred_cities": [],
    "minimum_experience_years": 0,
    "minimum_cgpa": 0
  }
}`;
}

/** Parse + sanitize a raw model response into an AssistResult. */
export function parseAssist(raw: string, action: AssistInput['action']): AssistResult {
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  const data = JSON.parse(cleaned) as Partial<AssistResult> & { criteria?: Partial<AssistCriteria> };

  const out: AssistResult = {};
  if (action === 'title' || action === 'all') out.title = String(data.title || '').trim();
  if (action === 'all') out.job_role = String(data.job_role || '').trim() || undefined;
  if (action === 'description' || action === 'all') {
    out.job_description = String(data.job_description || '').trim();
  }
  if (action === 'criteria' || action === 'all') {
    out.criteria = normalizeCriteria(data.criteria);
  }
  return out;
}

function normalizeCriteria(c?: Partial<AssistCriteria>): AssistCriteria {
  const skills = Array.isArray(c?.required_skills) ? c!.required_skills : [];
  return {
    required_skills: skills
      .filter((s) => s && s.name)
      .map((s) => ({ name: String(s.name), weight: clampInt(s.weight, 1, 5, 3) })),
    required_keywords: strArray(c?.required_keywords),
    preferred_universities: strArray(c?.preferred_universities),
    preferred_cities: strArray(c?.preferred_cities),
    minimum_experience_years: clampInt(c?.minimum_experience_years, 0, 50, 0),
    minimum_cgpa: Number.isFinite(Number(c?.minimum_cgpa)) ? Number(c?.minimum_cgpa) : 0,
  };
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];
}
function clampInt(v: unknown, lo: number, hi: number, dflt: number): number {
  const n = parseInt(String(v ?? ''), 10);
  if (!Number.isFinite(n)) return dflt;
  return Math.max(lo, Math.min(hi, n));
}

function toInt(v: unknown): number {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function deriveRelevance(score: number): Relevance {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'irrelevant';
}
