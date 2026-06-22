import { v4 as uuidv4 } from 'uuid';
import { chatJSON, safeParseJSON, isMockAi } from './chat';
import { mockCareerReport } from './mock';
import type { AnalysisInput, CareerAnalysisReport, CVImprovement } from './types';

const SYSTEM_PROMPT = `You are RoleNorth, an elite AI career strategist embedded in Hiretics. You analyze résumés and produce premium, executive-grade career intelligence reports.

Your reports are specific, grounded in the user's actual résumé, and never generic. You combine skill-decay analysis, automation/AI exposure assessment, personalized pivot paths (with fit scores and timelines), a prioritized 30-60-90 action plan, and CV Surgery (line-level edits).

You return ONLY valid JSON matching the requested schema. No markdown, no code fences, no commentary.`;

function buildPrompt(input: AnalysisInput): string {
  return `Analyze the following résumé and produce a complete career analysis report.

USER CONTEXT:
- Current location: ${input.currentLocation}
- Target location: ${input.targetLocation || 'Not specified — assume open'}
- Remote preference: ${input.remotePreference}
- Employment status: ${input.employmentStatus}
${input.careerAspiration ? `- Career aspiration (use this to shape advice): ${input.careerAspiration}` : ''}
${input.previousReportSummary ? `\nPREVIOUS REPORT (note progress or regression):\n${input.previousReportSummary}` : ''}

RÉSUMÉ TEXT:
"""
${input.resumeText.slice(0, 15000)}
"""

INSTRUCTIONS:
1. Extract name, current/most recent role, years of experience, top 6 skills, industry, seniority level.
2. Score overall career readiness (0-100) for the next 18 months given AI disruption.${input.careerAspiration ? ' Weight against the stated aspiration.' : ''}
3. 4-6 skills subject to decay: classify "low"/"medium"/"high", explain (specific), recommend one action.
4. 3-5 functional areas exposed to AI automation: riskScore (0-100), "low"/"moderate"/"high"/"critical", rationale, mitigation.
5. 4 pivot paths (named roles fitting this person${input.careerAspiration ? ' AND their aspiration' : ''}): title, fitScore (0-100), reason, growthOutlook, 3-5 transition steps, timeline, USD salary range.
6. 10-item action plan prioritized "high"/"medium"/"low", each specific, with timeframe and category ("learning"/"networking"/"portfolio"/"certification"/"experience").
7. CV Surgery: 6-10 line-level edits — section, issue (specific, reference real content), suggestion, optional example, severity ("critical"/"important"/"nice-to-have").
8. Market signals: location outlook, target-location outlook (if provided), remote-opportunity score (0-100), demand-trend summary.

OUTPUT STRICTLY THIS JSON SCHEMA:
{
  "snapshot": { "fullName": "", "currentRole": "", "yearsExperience": 0, "topSkills": [""], "industry": "", "seniorityLevel": "" },
  "overallReadinessScore": 0,
  "summary": "",
  "skillDecay": [{ "skill": "", "decayLevel": "low|medium|high", "reason": "", "recommendation": "" }],
  "automationExposure": [{ "area": "", "riskScore": 0, "riskLevel": "low|moderate|high|critical", "rationale": "", "mitigation": "" }],
  "pivotPaths": [{ "title": "", "fitScore": 0, "reason": "", "growthOutlook": "declining|stable|growing|high-growth", "transitionSteps": [""], "estimatedTimeline": "", "salaryRangeUSD": "" }],
  "actionPlan": [{ "priority": "high|medium|low", "title": "", "description": "", "timeframe": "", "category": "learning|networking|portfolio|certification|experience" }],
  "cvImprovements": [{ "section": "summary|experience|skills|education|projects|format|metrics|keywords", "issue": "", "suggestion": "", "example": "", "severity": "critical|important|nice-to-have" }],
  "marketSignals": { "locationOutlook": "", "targetLocationOutlook": "", "remoteOpportunityScore": 0, "demandTrend": "" }
}

Return ONLY the JSON object. No prose. No markdown. No code fences.`;
}

export async function generateCareerAnalysis(input: AnalysisInput): Promise<CareerAnalysisReport> {
  if (isMockAi()) return mockCareerReport(input);

  const raw = await chatJSON({ system: SYSTEM_PROMPT, user: buildPrompt(input), temperature: 0.4 });
  const parsed = safeParseJSON<Omit<CareerAnalysisReport, 'generatedAt' | 'input'>>(raw);
  if (!parsed || !parsed.snapshot || !Array.isArray(parsed.pivotPaths)) {
    throw new Error('AI returned an unexpected response. Please retry.');
  }

  return {
    generatedAt: new Date().toISOString(),
    snapshot: {
      fullName: parsed.snapshot.fullName || 'Unknown',
      currentRole: parsed.snapshot.currentRole || '—',
      yearsExperience: Number(parsed.snapshot.yearsExperience) || 0,
      topSkills: Array.isArray(parsed.snapshot.topSkills) ? parsed.snapshot.topSkills.slice(0, 8) : [],
      industry: parsed.snapshot.industry || '—',
      seniorityLevel: parsed.snapshot.seniorityLevel || '—',
    },
    overallReadinessScore: clampScore(parsed.overallReadinessScore),
    summary: parsed.summary || '',
    skillDecay: (parsed.skillDecay ?? []).slice(0, 8).map((s) => ({
      skill: s.skill || '—',
      decayLevel: normalizeDecay(s.decayLevel),
      reason: s.reason || '',
      recommendation: s.recommendation || '',
    })),
    automationExposure: (parsed.automationExposure ?? []).slice(0, 6).map((a) => ({
      area: a.area || '—',
      riskScore: clampScore(a.riskScore),
      riskLevel: normalizeRisk(a.riskLevel),
      rationale: a.rationale || '',
      mitigation: a.mitigation || '',
    })),
    pivotPaths: (parsed.pivotPaths ?? []).slice(0, 6).map((p) => ({
      title: p.title || '—',
      fitScore: clampScore(p.fitScore),
      reason: p.reason || '',
      growthOutlook: normalizeGrowth(p.growthOutlook),
      transitionSteps: Array.isArray(p.transitionSteps) ? p.transitionSteps.slice(0, 6) : [],
      estimatedTimeline: p.estimatedTimeline || '6-12 months',
      salaryRangeUSD: p.salaryRangeUSD || '—',
    })),
    actionPlan: (parsed.actionPlan ?? []).slice(0, 12).map((a) => ({
      priority: normalizePriority(a.priority),
      title: a.title || '—',
      description: a.description || '',
      timeframe: a.timeframe || '—',
      category: normalizeCategory(a.category),
    })),
    cvImprovements: ((parsed as any).cvImprovements ?? []).slice(0, 12).map(
      (c: Partial<CVImprovement>): CVImprovement => ({
        id: uuidv4(),
        section: normalizeSection(c.section),
        issue: c.issue || '—',
        suggestion: c.suggestion || '',
        example: c.example || undefined,
        severity: normalizeSeverity(c.severity),
      }),
    ),
    marketSignals: {
      locationOutlook: parsed.marketSignals?.locationOutlook || '—',
      targetLocationOutlook: parsed.marketSignals?.targetLocationOutlook || undefined,
      remoteOpportunityScore: clampScore(parsed.marketSignals?.remoteOpportunityScore),
      demandTrend: parsed.marketSignals?.demandTrend || '—',
    },
    input: {
      currentLocation: input.currentLocation,
      targetLocation: input.targetLocation || undefined,
      remotePreference: input.remotePreference,
      employmentStatus: input.employmentStatus,
      careerAspiration: input.careerAspiration || undefined,
    },
  };
}

/** Compact prior-report context so a follow-up analysis can comment on progress. */
export function summarizeReportForContext(report: CareerAnalysisReport): string {
  const actions = report.actionPlan
    .slice(0, 8)
    .map((a, i) => `${i + 1}. [${a.priority}] ${a.title}: ${a.description}`)
    .join('\n');
  const cvFixes = report.cvImprovements
    .slice(0, 8)
    .map((c, i) => `${i + 1}. [${c.severity}] (${c.section}) ${c.issue} -> ${c.suggestion}`)
    .join('\n');
  return `Previous overall readiness: ${report.overallReadinessScore}/100
Previous summary: ${report.summary}
Previous action plan:
${actions}
Previous CV improvements requested:
${cvFixes}`;
}

const clampScore = (v: unknown): number => {
  const n = Number(v);
  return isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
};
const normalizeDecay = (v: unknown) => {
  const s = String(v || '').toLowerCase();
  return s === 'high' || s === 'medium' || s === 'low' ? s : 'medium';
};
const normalizeRisk = (v: unknown) => {
  const s = String(v || '').toLowerCase();
  return ['low', 'moderate', 'high', 'critical'].includes(s) ? (s as any) : 'moderate';
};
const normalizeGrowth = (v: unknown) => {
  const s = String(v || '').toLowerCase().replace(/_/g, '-');
  return ['declining', 'stable', 'growing', 'high-growth'].includes(s) ? (s as any) : 'growing';
};
const normalizePriority = (v: unknown) => {
  const s = String(v || '').toLowerCase();
  return s === 'high' || s === 'medium' || s === 'low' ? s : 'medium';
};
const normalizeCategory = (v: unknown) => {
  const s = String(v || '').toLowerCase();
  return ['learning', 'networking', 'portfolio', 'certification', 'experience'].includes(s)
    ? (s as any)
    : 'learning';
};
const normalizeSection = (v: unknown): CVImprovement['section'] => {
  const s = String(v || '').toLowerCase();
  const allowed = ['summary', 'experience', 'skills', 'education', 'projects', 'format', 'metrics', 'keywords'];
  return (allowed.includes(s) ? s : 'experience') as CVImprovement['section'];
};
const normalizeSeverity = (v: unknown): CVImprovement['severity'] => {
  const s = String(v || '').toLowerCase();
  return s === 'critical' || s === 'important' || s === 'nice-to-have' ? (s as any) : 'important';
};
