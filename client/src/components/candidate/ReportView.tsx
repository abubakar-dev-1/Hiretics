"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Gauge,
  TrendingDown,
  Bot,
  Compass,
  ListChecks,
  Scissors,
  Globe,
} from "lucide-react";
import type { CareerAnalysisReport } from "@/api/candidate/api";

const decayColor: Record<string, string> = {
  high: "#C1492E",
  medium: "#E0A458",
  low: "#16A34A",
};
const riskColor: Record<string, string> = {
  critical: "#C1492E",
  high: "#E0653E",
  moderate: "#E0A458",
  low: "#16A34A",
};
const sevColor: Record<string, string> = {
  critical: "#C1492E",
  important: "#E0A458",
  "nice-to-have": "#6C5B7B",
};

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-[#16A34A]" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

export function ReportView({ report }: { report: CareerAnalysisReport }) {
  const s = report.snapshot;
  return (
    <div className="space-y-6">
      {/* Snapshot + readiness */}
      <Card>
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{s.fullName}</h2>
            <p className="text-muted-foreground">
              {s.currentRole} · {s.seniorityLevel} · {s.yearsExperience} yrs · {s.industry}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {s.topSkills.map((sk) => (
                <span key={sk} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground">
                  {sk}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="relative h-24 w-24 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#16A34A ${report.overallReadinessScore * 3.6}deg, #e5e7eb 0deg)` }}>
              <div className="h-18 w-18 rounded-full bg-card flex flex-col items-center justify-center" style={{ height: "72px", width: "72px" }}>
                <span className="text-2xl font-bold text-foreground">{report.overallReadinessScore}</span>
                <span className="text-[10px] text-muted-foreground">readiness</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-foreground flex items-start gap-2">
            <Gauge className="h-5 w-5 text-[#16A34A] mt-0.5 shrink-0" /> {report.summary}
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Section icon={TrendingDown} title="Skill Decay">
          {report.skillDecay.map((d, i) => (
            <div key={i} className="border-l-2 pl-3" style={{ borderColor: decayColor[d.decayLevel] }}>
              <p className="font-medium text-foreground">
                {d.skill}{" "}
                <span className="text-xs" style={{ color: decayColor[d.decayLevel] }}>
                  ({d.decayLevel})
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{d.reason}</p>
              <p className="text-sm text-foreground mt-1">→ {d.recommendation}</p>
            </div>
          ))}
        </Section>

        <Section icon={Bot} title="Automation Exposure">
          {report.automationExposure.map((a, i) => (
            <div key={i} className="border-l-2 pl-3" style={{ borderColor: riskColor[a.riskLevel] }}>
              <p className="font-medium text-foreground flex items-center justify-between">
                {a.area}
                <span className="text-xs" style={{ color: riskColor[a.riskLevel] }}>
                  {a.riskScore}/100 · {a.riskLevel}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{a.rationale}</p>
              <p className="text-sm text-foreground mt-1">🛡 {a.mitigation}</p>
            </div>
          ))}
        </Section>
      </div>

      <Section icon={Compass} title="Pivot Paths">
        <div className="grid md:grid-cols-2 gap-4">
          {report.pivotPaths.map((p, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{p.title}</p>
                <span className="text-sm font-bold text-[#16A34A]">{p.fitScore}% fit</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{p.reason}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {p.growthOutlook} · {p.estimatedTimeline} · {p.salaryRangeUSD}
              </p>
              <ol className="list-decimal list-inside text-sm text-foreground mt-2 space-y-0.5">
                {p.transitionSteps.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={ListChecks} title="30-60-90 Action Plan">
        {report.actionPlan.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                a.priority === "high"
                  ? "bg-[#C1492E]/10 text-[#C1492E]"
                  : a.priority === "medium"
                  ? "bg-[#E0A458]/10 text-[#B07A2E]"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {a.priority}
            </span>
            <div>
              <p className="font-medium text-foreground">
                {a.title} <span className="text-xs text-muted-foreground">· {a.timeframe} · {a.category}</span>
              </p>
              <p className="text-sm text-muted-foreground">{a.description}</p>
            </div>
          </div>
        ))}
      </Section>

      <Section icon={Scissors} title="CV Surgery">
        {report.cvImprovements.map((c) => (
          <div key={c.id} className="border-l-2 pl-3" style={{ borderColor: sevColor[c.severity] }}>
            <p className="font-medium text-foreground">
              <span className="text-xs uppercase mr-2" style={{ color: sevColor[c.severity] }}>
                {c.severity}
              </span>
              {c.section}
            </p>
            <p className="text-sm text-muted-foreground">{c.issue}</p>
            <p className="text-sm text-foreground mt-1">→ {c.suggestion}</p>
            {c.example && (
              <p className="text-sm italic text-muted-foreground mt-1 bg-muted/50 rounded p-2">{c.example}</p>
            )}
          </div>
        ))}
      </Section>

      <Section icon={Globe} title="Market Signals">
        <p className="text-sm text-foreground">📍 {report.marketSignals.locationOutlook}</p>
        {report.marketSignals.targetLocationOutlook && (
          <p className="text-sm text-foreground">🎯 {report.marketSignals.targetLocationOutlook}</p>
        )}
        <p className="text-sm text-foreground">
          🌐 Remote opportunity: {report.marketSignals.remoteOpportunityScore}/100
        </p>
        <p className="text-sm text-foreground">📈 {report.marketSignals.demandTrend}</p>
      </Section>
    </div>
  );
}
