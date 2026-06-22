"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Timer,
  Hourglass,
  ChevronDown,
  ChevronUp,
  MapPin,
  GraduationCap,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getApplicants } from "@/api/cv/api";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import { getCampaign } from "@/api/campaign/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EnhancedCandidate, ScoringBreakdown } from "@/types/applicant";

export type Candidate = EnhancedCandidate;

interface BestCandidatesProps {
  candidates?: EnhancedCandidate[];
  campaignId?: string;
  refreshKey?: number;
}

function getScoreTextColor(score: number) {
  if (score >= 70) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
}

function getScoreRingColor(score: number) {
  if (score >= 70) return "stroke-green-500";
  if (score >= 40) return "stroke-yellow-500";
  return "stroke-red-500";
}

function getProgressColor(score: number) {
  if (score >= 70) return "[&>[data-slot=progress-indicator]]:bg-green-500";
  if (score >= 40) return "[&>[data-slot=progress-indicator]]:bg-yellow-500";
  return "[&>[data-slot=progress-indicator]]:bg-red-500";
}

function generateFallbackReason(candidate: EnhancedCandidate): string {
  const parts: string[] = [];

  if (candidate.matched_skills && candidate.matched_skills.length > 0) {
    const skills = candidate.matched_skills.slice(0, 3).join(", ");
    parts.push(`Matches ${candidate.matched_skills.length} skill${candidate.matched_skills.length > 1 ? "s" : ""}: ${skills}`);
  }

  if (candidate.university) {
    parts.push(`${candidate.university} graduate`);
  }

  if (candidate.city) {
    parts.push(`based in ${candidate.city}`);
  }

  if (parts.length === 0) {
    if (candidate.score >= 70) return "Strong overall match for this role.";
    if (candidate.score >= 40) return "Partial match — some relevant qualifications.";
    return "Limited match with the job requirements.";
  }

  return parts.join(". ") + ".";
}

function ScoreCircle({ score, size = 44 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${getScoreRingColor(score)} transition-all duration-500`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getScoreTextColor(score)}`}
      >
        {score}
      </span>
    </div>
  );
}

function CandidateCard({
  candidate,
  rank,
}: {
  candidate: EnhancedCandidate;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const breakdown = candidate.scoring_breakdown;
  const hasBreakdown = breakdown !== null && breakdown !== undefined;
  const reason = candidate.ranking_reason || generateFallbackReason(candidate);

  return (
    <div
      className="relative rounded-lg border border-border/60 p-3.5 transition-all duration-200 hover:border-border hover:shadow-sm cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src={candidate.avatar || "/placeholder.svg"}
            alt={candidate.name}
          />
          <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold text-sm">
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium shrink-0">
                  #{rank}
                </span>
                <p className="font-semibold text-sm text-foreground truncate">
                  {candidate.name}
                </p>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {candidate.email}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ScoreCircle score={candidate.score} />
              {candidate.cv_link && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 hover:bg-green-500/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={candidate.cv_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4 text-[#16A34A]" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download CV</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Ranking reason */}
          {reason && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {reason}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
            {candidate.city && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {candidate.city}
              </span>
            )}
            {candidate.university && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <GraduationCap className="w-3 h-3" />
                {candidate.university}
              </span>
            )}
          </div>

          {/* Matched skills */}
          {candidate.matched_skills && candidate.matched_skills.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {candidate.matched_skills.slice(0, 4).map((skill, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-[18px]"
                >
                  {skill}
                </Badge>
              ))}
              {candidate.matched_skills.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-[18px]"
                >
                  +{candidate.matched_skills.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expandable breakdown */}
      {expanded && hasBreakdown && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
          <p className="text-xs font-medium text-foreground">Score Breakdown</p>
          <div className="grid gap-2.5">
            {[
              { label: "Skills", value: breakdown!.skill_match_score },
              { label: "Experience", value: breakdown!.experience_score },
              { label: "Education", value: breakdown!.education_score },
              { label: "Location", value: breakdown!.location_score },
              { label: "Keywords", value: breakdown!.keyword_score },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-[11px] text-muted-foreground w-20 shrink-0">
                  {label}
                </span>
                <Progress
                  value={value}
                  className={`h-1.5 flex-1 bg-muted/50 ${getProgressColor(value)}`}
                />
                <span
                  className={`text-[11px] font-semibold w-7 text-right ${getScoreTextColor(value)}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {candidate.matched_skills && candidate.matched_skills.length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                All Matched Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {candidate.matched_skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {candidate.matched_keywords &&
            candidate.matched_keywords.length > 0 && (
              <div>
                <p className="text-[11px] text-muted-foreground mb-1.5">
                  Matched Keywords
                </p>
                <div className="flex flex-wrap gap-1">
                  {candidate.matched_keywords.map((kw, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Expand hint */}
      {hasBreakdown && (
        <div className="flex justify-center mt-1.5">
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/50" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
          )}
        </div>
      )}
    </div>
  );
}

export function BestCandidates({
  candidates: propCandidates,
  campaignId,
  refreshKey,
}: BestCandidatesProps) {
  const [candidates, setCandidates] = useState<EnhancedCandidate[]>(
    propCandidates || []
  );
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [showMismatched, setShowMismatched] = useState(false);

  useEffect(() => {
    if (campaignId) {
      setLoading(true);
      Promise.all([getApplicants(campaignId), getCampaign(campaignId)])
        .then(([applicants, campaignData]) => {
          setCandidates(applicants);
          setCampaign(campaignData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [campaignId, refreshKey]);

  // Live updates: when the worker scores a CV for this campaign, refetch.
  useEffect(() => {
    if (!campaignId) return;
    const socket = getSocket();
    if (!socket) return;
    const onScored = (payload: { campaignId?: string; name?: string; score?: number }) => {
      if (payload?.campaignId !== campaignId) return;
      toast.success(`New candidate scored: ${payload.name ?? "Applicant"} (${payload.score ?? 0})`);
      getApplicants(campaignId).then(setCandidates).catch(console.error);
    };
    socket.on("candidate.scored", onScored);
    return () => {
      socket.off("candidate.scored", onScored);
    };
  }, [campaignId]);

  const relevantCandidates = candidates.filter(
    (c) => c.relevance !== "irrelevant"
  );
  const mismatchedCandidates = candidates.filter(
    (c) => c.relevance === "irrelevant"
  );

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <CardTitle className="text-base font-semibold">
              Best Candidates
            </CardTitle>
          </div>
          {!loading && candidates.length > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {candidates.length} applicant
              {candidates.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3.5">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-56 mb-2" />
                    <Skeleton className="h-3 w-72" />
                  </div>
                  <Skeleton className="h-11 w-11 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            {campaign?.status === "not-started" ? (
              <Timer className="w-7 h-7 text-muted-foreground mb-2" />
            ) : (
              <Hourglass
                fill="#52525B"
                className="w-7 h-7 text-muted-foreground mb-2"
              />
            )}
            <p className="text-sm">
              {campaign?.status === "not-started"
                ? "Waiting for the campaign to start..."
                : "Waiting for responses..."}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2.5">
              {relevantCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.email}
                  candidate={candidate}
                  rank={index + 1}
                />
              ))}
            </div>

            {mismatchedCandidates.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-muted-foreground hover:text-foreground"
                  onClick={() => setShowMismatched(!showMismatched)}
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                    Mismatched Candidates ({mismatchedCandidates.length})
                  </span>
                  {showMismatched ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                {showMismatched && (
                  <div className="max-h-[300px] overflow-y-auto pr-1 mt-2 space-y-2.5">
                    {mismatchedCandidates.map((candidate, index) => (
                      <CandidateCard
                        key={candidate.email}
                        candidate={candidate}
                        rank={relevantCandidates.length + index + 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
