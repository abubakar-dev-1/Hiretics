/** Career-analysis types, ported from RoleNorth (the merged candidate side). */

export type RemotePreference = 'remote' | 'hybrid' | 'onsite' | 'any';
export type EmploymentStatus =
  | 'employed'
  | 'unemployed'
  | 'freelancing'
  | 'student'
  | 'career-break';

export interface AnalysisInput {
  currentLocation: string;
  targetLocation?: string;
  remotePreference: RemotePreference;
  employmentStatus: EmploymentStatus;
  resumeText: string;
  careerAspiration?: string;
  previousReportSummary?: string;
}

export type CVImprovementSeverity = 'critical' | 'important' | 'nice-to-have';
export type CVImprovementSection =
  | 'summary' | 'experience' | 'skills' | 'education'
  | 'projects' | 'format' | 'metrics' | 'keywords';

export interface CVImprovement {
  id: string;
  section: CVImprovementSection;
  issue: string;
  suggestion: string;
  example?: string;
  severity: CVImprovementSeverity;
}

export interface SkillDecayItem {
  skill: string;
  decayLevel: 'low' | 'medium' | 'high';
  reason: string;
  recommendation: string;
}

export interface AutomationExposureItem {
  area: string;
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  rationale: string;
  mitigation: string;
}

export interface PivotPath {
  title: string;
  fitScore: number;
  reason: string;
  growthOutlook: 'declining' | 'stable' | 'growing' | 'high-growth';
  transitionSteps: string[];
  estimatedTimeline: string;
  salaryRangeUSD: string;
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timeframe: string;
  category: 'learning' | 'networking' | 'portfolio' | 'certification' | 'experience';
}

export interface CareerSnapshot {
  fullName: string;
  currentRole: string;
  yearsExperience: number;
  topSkills: string[];
  industry: string;
  seniorityLevel: string;
}

export interface CareerAnalysisReport {
  generatedAt: string;
  snapshot: CareerSnapshot;
  overallReadinessScore: number;
  summary: string;
  skillDecay: SkillDecayItem[];
  automationExposure: AutomationExposureItem[];
  pivotPaths: PivotPath[];
  actionPlan: ActionItem[];
  cvImprovements: CVImprovement[];
  marketSignals: {
    locationOutlook: string;
    targetLocationOutlook?: string;
    remoteOpportunityScore: number;
    demandTrend: string;
  };
  input: {
    currentLocation: string;
    targetLocation?: string;
    remotePreference: RemotePreference;
    employmentStatus: EmploymentStatus;
    careerAspiration?: string;
  };
}

export interface ComparisonAdherenceItem {
  previousActionTitle: string;
  status: 'addressed' | 'partially-addressed' | 'not-addressed';
  evidence: string;
}

export interface ComparisonReport {
  generatedAt: string;
  previousReportId: string;
  currentReportId: string;
  scoreDelta: number;
  adherenceScore: number;
  coachNote: string;
  wins: string[];
  stillOpen: string[];
  newStrengths: string[];
  adherence: ComparisonAdherenceItem[];
  skillProgress: Array<{
    skill: string;
    previousDecayLevel: 'low' | 'medium' | 'high' | 'absent';
    currentDecayLevel: 'low' | 'medium' | 'high' | 'absent';
    direction: 'improved' | 'worsened' | 'unchanged';
  }>;
}

/** Tailor-CV-to-job result (cross-side feature using a campaign's criteria). */
export interface TailorResult {
  predictedMatchScore: number;
  fitSummary: string;
  matchedStrengths: string[];
  gaps: string[];
  tailoredBullets: { original?: string; improved: string; rationale: string }[];
  keywordsToAdd: string[];
}
