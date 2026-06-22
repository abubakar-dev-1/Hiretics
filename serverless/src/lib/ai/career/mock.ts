import type {
  AnalysisInput,
  CareerAnalysisReport,
  ComparisonReport,
  TailorResult,
} from './types';

/**
 * Deterministic, offline career reports — NO network, NO API key. Keeps the
 * candidate analysis pipeline fully runnable for development/demos (mirrors the
 * mock CV scorer on the recruiter side).
 */
function guessName(text: string): string {
  const first = text.trim().split('\n')[0]?.trim();
  if (first && first.length <= 40 && /^[A-Za-z .'-]+$/.test(first)) return first;
  return 'Candidate';
}
function topSkills(text: string): string[] {
  const known = ['React', 'TypeScript', 'Node.js', 'AWS', 'Python', 'SQL', 'Docker', 'Figma', 'Java', 'Go'];
  const lower = text.toLowerCase();
  const found = known.filter((k) => lower.includes(k.toLowerCase().split('.')[0]));
  return (found.length ? found : ['Communication', 'Project Management', 'Excel']).slice(0, 6);
}

export function mockCareerReport(input: AnalysisInput): CareerAnalysisReport {
  const skills = topSkills(input.resumeText);
  const score = Math.min(95, 45 + skills.length * 7);
  return {
    generatedAt: new Date().toISOString(),
    snapshot: {
      fullName: guessName(input.resumeText),
      currentRole: 'Professional',
      yearsExperience: 3,
      topSkills: skills,
      industry: 'Technology',
      seniorityLevel: 'Mid-level',
    },
    overallReadinessScore: score,
    summary: `[MOCK] Solid foundation across ${skills.slice(0, 3).join(', ')}. Focus on AI-adjacent skills and quantified achievements to stay ahead of automation.`,
    skillDecay: skills.slice(0, 4).map((skill, i) => ({
      skill,
      decayLevel: i === 0 ? 'low' : i < 2 ? 'medium' : 'high',
      reason: `[MOCK] Market demand for ${skill} is shifting; keep current with recent tooling.`,
      recommendation: `Complete a recent ${skill} project or course this quarter.`,
    })),
    automationExposure: [
      { area: 'Routine reporting', riskScore: 70, riskLevel: 'high', rationale: '[MOCK] Repetitive tasks are easily automated.', mitigation: 'Move toward analysis and decision-making.' },
      { area: 'Manual data entry', riskScore: 85, riskLevel: 'critical', rationale: '[MOCK] Highly automatable.', mitigation: 'Learn workflow-automation tools.' },
      { area: 'Stakeholder communication', riskScore: 25, riskLevel: 'low', rationale: '[MOCK] Human judgement still essential.', mitigation: 'Strengthen leadership presence.' },
    ],
    pivotPaths: [
      { title: 'Senior ' + skills[0], fitScore: 82, reason: '[MOCK] Natural progression from current skills.', growthOutlook: 'growing', transitionSteps: ['Deepen specialization', 'Lead a project', 'Mentor juniors'], estimatedTimeline: '6-12 months', salaryRangeUSD: '$90k-$130k' },
      { title: 'Solutions / Technical Lead', fitScore: 71, reason: '[MOCK] Blends technical depth with leadership.', growthOutlook: 'high-growth', transitionSteps: ['Build architecture skills', 'Own delivery', 'Improve communication'], estimatedTimeline: '12-18 months', salaryRangeUSD: '$120k-$160k' },
    ],
    actionPlan: [
      { priority: 'high', title: 'Quantify your résumé', description: '[MOCK] Add metrics to every role (%, $, scale).', timeframe: 'Next 30 days', category: 'portfolio' },
      { priority: 'high', title: 'Ship an AI-adjacent project', description: '[MOCK] Demonstrate modern tooling.', timeframe: '60-90 days', category: 'learning' },
      { priority: 'medium', title: 'Grow your network', description: '[MOCK] Connect with 10 peers in target roles.', timeframe: 'Next 30 days', category: 'networking' },
    ],
    cvImprovements: [
      { id: 'mock-1', section: 'metrics', issue: '[MOCK] Bullets lack measurable impact.', suggestion: 'Add quantified outcomes.', example: 'Cut processing time 40% by automating reports.', severity: 'critical' },
      { id: 'mock-2', section: 'summary', issue: '[MOCK] Summary is generic.', suggestion: 'Tailor to target role with specifics.', severity: 'important' },
      { id: 'mock-3', section: 'keywords', issue: '[MOCK] Missing ATS keywords.', suggestion: `Add: ${skills.join(', ')}.`, severity: 'important' },
    ],
    marketSignals: {
      locationOutlook: `[MOCK] ${input.currentLocation || 'Your region'} has steady demand.`,
      targetLocationOutlook: input.targetLocation ? `[MOCK] ${input.targetLocation} is competitive but growing.` : undefined,
      remoteOpportunityScore: input.remotePreference === 'remote' ? 75 : 55,
      demandTrend: '[MOCK] Demand trending up for AI-literate professionals.',
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

export function mockComparison(
  previousReportId: string,
  currentReportId: string,
  prev: CareerAnalysisReport,
  curr: CareerAnalysisReport,
): ComparisonReport {
  return {
    generatedAt: new Date().toISOString(),
    previousReportId,
    currentReportId,
    scoreDelta: curr.overallReadinessScore - prev.overallReadinessScore,
    adherenceScore: 60,
    coachNote: `[MOCK] ${curr.snapshot.fullName.split(' ')[0]}, your readiness moved from ${prev.overallReadinessScore} to ${curr.overallReadinessScore}. Keep quantifying achievements and close the remaining skill gaps.`,
    wins: ['[MOCK] Added measurable impact to recent roles.'],
    stillOpen: ['[MOCK] AI-adjacent project not yet visible.'],
    newStrengths: curr.snapshot.topSkills.filter((s) => !prev.snapshot.topSkills.includes(s)).slice(0, 5),
    adherence: prev.actionPlan.slice(0, 5).map((a) => ({
      previousActionTitle: a.title,
      status: 'partially-addressed' as const,
      evidence: '[MOCK] Some progress detected in the revised résumé.',
    })),
    skillProgress: curr.snapshot.topSkills.slice(0, 6).map((skill) => ({
      skill,
      previousDecayLevel: 'medium' as const,
      currentDecayLevel: 'low' as const,
      direction: 'improved' as const,
    })),
  };
}

export function mockTailor(resumeText: string, criteria: unknown): TailorResult {
  const skills = topSkills(resumeText);
  return {
    predictedMatchScore: Math.min(92, 50 + skills.length * 6),
    fitSummary: '[MOCK] Strong overlap with the role; sharpen a few keywords and quantify outcomes.',
    matchedStrengths: skills.slice(0, 4),
    gaps: ['[MOCK] Add explicit mention of the role’s core tools', '[MOCK] Quantify leadership scope'],
    tailoredBullets: [
      { improved: '[MOCK] Delivered X improving Y by 30% using ' + skills[0], rationale: 'Aligns with the job criteria and adds a metric.' },
    ],
    keywordsToAdd: skills.map((s) => s.toLowerCase()),
  };
}
