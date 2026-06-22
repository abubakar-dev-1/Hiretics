import { chatJSON, safeParseJSON, isMockAi } from './chat';
import { mockTailor } from './mock';
import type { TailorResult } from './types';

const SYSTEM_PROMPT = `You are an expert résumé coach. Given a candidate's résumé and a specific job's requirements, you tailor the résumé to that job: predict a match score, identify strengths and gaps, and rewrite specific bullets. Return ONLY valid JSON.`;

export interface TailorInput {
  resumeText: string;
  jobRole: string;
  jobDescription: string;
  criteria?: unknown;
}

function buildPrompt(input: TailorInput): string {
  return `Tailor this résumé to the target job.

TARGET JOB ROLE: ${input.jobRole}

JOB DESCRIPTION:
${input.jobDescription}

${input.criteria ? `SCORING CRITERIA:\n${JSON.stringify(input.criteria, null, 2)}` : ''}

RÉSUMÉ TEXT:
"""
${input.resumeText.slice(0, 15000)}
"""

INSTRUCTIONS:
1. "predictedMatchScore" (0-100): how well this résumé matches the job today.
2. "fitSummary": one or two sentences.
3. "matchedStrengths": up to 6 strengths aligned to the job.
4. "gaps": up to 6 missing/weak areas vs the job.
5. "tailoredBullets": 4-8 rewritten résumé bullets — each { "original" (optional), "improved", "rationale" } targeted to this job.
6. "keywordsToAdd": ATS keywords from the job missing in the résumé.

OUTPUT STRICTLY THIS JSON:
{
  "predictedMatchScore": 0,
  "fitSummary": "",
  "matchedStrengths": [""],
  "gaps": [""],
  "tailoredBullets": [{ "original": "", "improved": "", "rationale": "" }],
  "keywordsToAdd": [""]
}

Return ONLY the JSON object. No prose. No markdown. No code fences.`;
}

export async function generateTailor(input: TailorInput): Promise<TailorResult> {
  if (isMockAi()) return mockTailor(input.resumeText, input.criteria);

  const raw = await chatJSON({ system: SYSTEM_PROMPT, user: buildPrompt(input), temperature: 0.4 });
  const parsed = safeParseJSON<Partial<TailorResult>>(raw);
  if (!parsed) throw new Error('AI returned an unexpected response while tailoring.');

  const clamp = (n: unknown) => {
    const v = Number(n);
    return isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;
  };
  const strArr = (v: unknown) => (Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 8) : []);

  return {
    predictedMatchScore: clamp(parsed.predictedMatchScore),
    fitSummary: parsed.fitSummary || '',
    matchedStrengths: strArr(parsed.matchedStrengths),
    gaps: strArr(parsed.gaps),
    tailoredBullets: (parsed.tailoredBullets ?? []).slice(0, 10).map((b: any) => ({
      original: b.original || undefined,
      improved: b.improved || '',
      rationale: b.rationale || '',
    })),
    keywordsToAdd: strArr(parsed.keywordsToAdd),
  };
}
