import type {
  AiProvider,
  AnalyzeInput,
  AssistInput,
  AssistResult,
  CvAnalysis,
  Relevance,
} from './types';

/**
 * Offline provider — NO network, NO API key. Lets the ENTIRE event-driven
 * pipeline run end to end (S3 -> SQS -> Lambda -> DynamoDB -> WebSocket) with no
 * internet. Critical demo fallback (see docs/06-demo-runbook.md).
 *
 * Produces a deterministic, plausible result: extracts an email/name heuristically
 * and derives a score from keyword overlap between the resume and job description.
 */
export const mockProvider: AiProvider = {
  name: 'mock',
  async analyze(input: AnalyzeInput): Promise<CvAnalysis> {
    const { resumeText, jobDescription } = input;

    const email = resumeText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? 'candidate@example.com';
    const name = guessName(resumeText, email);

    const jobWords = tokenize(jobDescription);
    const resumeWords = new Set(tokenize(resumeText));
    const matched = [...jobWords].filter((w) => resumeWords.has(w));
    const overlap = jobWords.size ? matched.length / jobWords.size : 0;

    const score = clamp(Math.round(30 + overlap * 65), 1, 100);
    const relevance: Relevance =
      score >= 70 ? 'high' : score >= 40 ? 'medium' : score >= 20 ? 'low' : 'irrelevant';

    return {
      name,
      email,
      city: '',
      university: '',
      age: 0,
      score,
      scoring_breakdown: {
        skill_match_score: score,
        experience_score: clamp(score - 5, 0, 100),
        education_score: clamp(score - 10, 0, 100),
        location_score: 50,
        keyword_score: clamp(Math.round(overlap * 100), 0, 100),
        overall_score: score,
      },
      matched_skills: matched.slice(0, 8),
      matched_keywords: matched.slice(0, 8),
      relevance,
      ranking_reason: `[MOCK] ${matched.length} job keywords matched in resume (offline scoring).`,
    };
  },

  async assist(input: AssistInput): Promise<AssistResult> {
    const role = (input.jobRole || input.jobTitle || 'Software Engineer').trim();
    const sen = input.seniority ? `${input.seniority} ` : '';
    const out: AssistResult = {};

    if (input.action === 'title' || input.action === 'all') {
      out.title = `${sen}${role}`.trim();
    }
    if (input.action === 'all') out.job_role = role;
    if (input.action === 'description' || input.action === 'all') {
      out.job_description =
        `[MOCK] We are hiring a ${sen}${role}. You will design, build and ship high-quality ` +
        `software, collaborate across teams, and own features end to end. ` +
        `Requirements: strong fundamentals, relevant experience, and excellent communication.` +
        (input.notes ? ` Notes considered: ${input.notes}.` : '');
    }
    if (input.action === 'criteria' || input.action === 'all') {
      const skills = deriveSkills(role, input.notes);
      out.criteria = {
        required_skills: skills.map((name, i) => ({ name, weight: i === 0 ? 5 : 3 })),
        required_keywords: skills.map((s) => s.toLowerCase()),
        preferred_universities: [],
        preferred_cities: [],
        minimum_experience_years: /senior|lead/i.test(sen) ? 5 : 2,
        minimum_cgpa: 0,
      };
    }
    return out;
  },
};

function deriveSkills(role: string, notes?: string): string[] {
  const base = `${role} ${notes || ''}`.toLowerCase();
  const known = ['React', 'TypeScript', 'Node.js', 'AWS', 'Python', 'SQL', 'Docker', 'Communication'];
  const picked = known.filter((k) => base.includes(k.toLowerCase().split('.')[0]));
  return (picked.length ? picked : ['Communication', 'Problem Solving', 'Teamwork']).slice(0, 6);
}

function tokenize(text: string): Set<string> {
  return new Set(
    (text.toLowerCase().match(/[a-z][a-z+#.]{2,}/g) ?? []).filter((w) => !STOP.has(w)),
  );
}
function guessName(text: string, email: string): string {
  const firstLine = text.trim().split('\n')[0]?.trim();
  if (firstLine && firstLine.length <= 40 && /^[A-Za-z .'-]+$/.test(firstLine)) return firstLine;
  return email.split('@')[0].replace(/[._]/g, ' ');
}
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const STOP = new Set(['the', 'and', 'for', 'with', 'you', 'are', 'will', 'our', 'this', 'that', 'have', 'from', 'who', 'role']);
