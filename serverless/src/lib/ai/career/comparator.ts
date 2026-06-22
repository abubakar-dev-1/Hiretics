import { chatJSON, safeParseJSON, isMockAi } from './chat';
import { mockComparison } from './mock';
import type { CareerAnalysisReport, ComparisonAdherenceItem, ComparisonReport } from './types';

const SYSTEM_PROMPT = `You are a career progress coach. You compare two career analysis reports for the same person — an older one and a newer one — and produce a structured comparison.

You are direct, specific, and warm but honest. You praise real improvement and call out where the user did not follow through. You always return ONLY valid JSON matching the requested schema.`;

function buildPrompt(prev: CareerAnalysisReport, curr: CareerAnalysisReport): string {
  return `Compare these two reports for the same person. The older report's action plan and CV improvements were guidance to act on. The newer report is from a revised résumé.

PREVIOUS REPORT (older):
${JSON.stringify(prev, null, 2)}

CURRENT REPORT (newer):
${JSON.stringify(curr, null, 2)}

INSTRUCTIONS:
1. "scoreDelta" = currentScore - previousScore.
2. "adherenceScore" (0-100): of the previous action plan + CV improvements, what % have observable evidence now? Be honest.
3. "coachNote": 3-4 sentences addressing the user by first name. One specific win, one regression/skipped item, one next priority.
4. up to 5 "wins"; 5 "stillOpen"; 5 "newStrengths".
5. "adherence": for each previous action plan item (up to 10): "addressed"/"partially-addressed"/"not-addressed" + one evidence sentence.
6. "skillProgress": for each skill in either skillDecay list (union, up to 10): previousDecayLevel, currentDecayLevel ("absent" if missing), direction ("improved"/"worsened"/"unchanged").

OUTPUT STRICTLY THIS JSON:
{
  "scoreDelta": 0, "adherenceScore": 0, "coachNote": "",
  "wins": [""], "stillOpen": [""], "newStrengths": [""],
  "adherence": [{ "previousActionTitle": "", "status": "addressed|partially-addressed|not-addressed", "evidence": "" }],
  "skillProgress": [{ "skill": "", "previousDecayLevel": "low|medium|high|absent", "currentDecayLevel": "low|medium|high|absent", "direction": "improved|worsened|unchanged" }]
}

Return ONLY the JSON object. No prose. No markdown. No code fences.`;
}

export async function generateComparison(
  previousReportId: string,
  currentReportId: string,
  previous: CareerAnalysisReport,
  current: CareerAnalysisReport,
): Promise<ComparisonReport> {
  if (isMockAi()) return mockComparison(previousReportId, currentReportId, previous, current);

  const raw = await chatJSON({ system: SYSTEM_PROMPT, user: buildPrompt(previous, current), temperature: 0.3 });
  const parsed = safeParseJSON<Partial<ComparisonReport>>(raw);
  if (!parsed) throw new Error('AI returned an unexpected response while comparing reports.');

  const validStatus = (s: unknown): ComparisonAdherenceItem['status'] => {
    const v = String(s || '').toLowerCase();
    return v === 'addressed' || v === 'partially-addressed' || v === 'not-addressed' ? (v as any) : 'not-addressed';
  };
  const validDecay = (s: unknown) => {
    const v = String(s || '').toLowerCase();
    return ['low', 'medium', 'high', 'absent'].includes(v) ? (v as any) : 'absent';
  };
  const validDirection = (s: unknown) => {
    const v = String(s || '').toLowerCase();
    return v === 'improved' || v === 'worsened' ? (v as any) : 'unchanged';
  };
  const clamp = (n: unknown) => {
    const v = Number(n);
    return isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;
  };

  return {
    generatedAt: new Date().toISOString(),
    previousReportId,
    currentReportId,
    scoreDelta: Math.round(
      Number(parsed.scoreDelta ?? current.overallReadinessScore - previous.overallReadinessScore),
    ),
    adherenceScore: clamp(parsed.adherenceScore),
    coachNote: parsed.coachNote || '',
    wins: (parsed.wins ?? []).slice(0, 6).filter(Boolean),
    stillOpen: (parsed.stillOpen ?? []).slice(0, 6).filter(Boolean),
    newStrengths: (parsed.newStrengths ?? []).slice(0, 6).filter(Boolean),
    adherence: (parsed.adherence ?? []).slice(0, 12).map((a: any) => ({
      previousActionTitle: a.previousActionTitle || '—',
      status: validStatus(a.status),
      evidence: a.evidence || '',
    })),
    skillProgress: (parsed.skillProgress ?? []).slice(0, 12).map((s: any) => ({
      skill: s.skill || '—',
      previousDecayLevel: validDecay(s.previousDecayLevel),
      currentDecayLevel: validDecay(s.currentDecayLevel),
      direction: validDirection(s.direction),
    })),
  };
}
