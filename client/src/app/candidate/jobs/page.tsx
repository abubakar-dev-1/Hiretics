"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateNav } from "@/components/candidate/CandidateNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Briefcase, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import {
  getJobs,
  getThreads,
  tailorToJob,
  applyToJob,
  type Job,
  type CVThread,
  type TailorResult,
} from "@/api/candidate/api";

export default function JobBoardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [threads, setThreads] = useState<CVThread[]>([]);
  const [cvId, setCvId] = useState<string>("");
  const [busy, setBusy] = useState<string | null>(null);
  const [tailor, setTailor] = useState<{ job: Job; result: TailorResult } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "Candidate") {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getJobs(), getThreads()])
      .then(([j, t]) => {
        setJobs(j);
        const analyzed = t.filter((x) => x.latestCvId);
        setThreads(analyzed);
        if (analyzed[0]?.latestCvId) setCvId(analyzed[0].latestCvId);
      })
      .catch(console.error);
  }, [ready]);

  if (!ready) return null;

  const needCv = () => {
    if (!cvId) {
      toast.error("Analyze a CV first, then select it above");
      return true;
    }
    return false;
  };

  const onTailor = async (job: Job) => {
    if (needCv()) return;
    setBusy(`tailor-${job.id}`);
    try {
      const result = await tailorToJob(cvId, job.id);
      setTailor({ job, result });
    } catch (e: any) {
      toast.error(e?.message || "Tailoring failed");
    } finally {
      setBusy(null);
    }
  };

  const onApply = async (job: Job) => {
    if (needCv()) return;
    setBusy(`apply-${job.id}`);
    try {
      await applyToJob(job.id, cvId);
      toast.success(`Applied to ${job.name}! Your CV is being ranked.`);
    } catch (e: any) {
      toast.error(e?.message || "Apply failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <CandidateNav />
      <main className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Board</h1>
            <p className="text-muted-foreground">Public roles you can tailor your CV to and apply in one click.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Use CV:</span>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
            >
              {threads.length === 0 && <option value="">No analyzed CV</option>}
              {threads.map((t) => (
                <option key={t.threadId} value={t.latestCvId}>
                  {t.title} {typeof t.latestScore === "number" ? `(${t.latestScore})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground mb-1">No public jobs yet</p>
              <p className="text-sm text-muted-foreground">Check back soon — recruiters publish roles here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-[240px]">
                      <p className="font-semibold text-foreground text-lg">{job.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.company_name} · {job.job_role}
                      </p>
                      <p className="text-sm text-foreground mt-2 line-clamp-3">{job.job_description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTailor(job)}
                        disabled={busy === `tailor-${job.id}`}
                        className="border-[#16A34A] text-[#16A34A]"
                      >
                        <Sparkles className="h-4 w-4 mr-1.5" />
                        {busy === `tailor-${job.id}` ? "Tailoring…" : "Tailor my CV"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onApply(job)}
                        disabled={busy === `apply-${job.id}`}
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white"
                      >
                        <Send className="h-4 w-4 mr-1.5" />
                        {busy === `apply-${job.id}` ? "Applying…" : "One-click apply"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tailor result dialog */}
        <Dialog open={!!tailor} onOpenChange={(o) => !o && setTailor(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            {tailor && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Tailored to {tailor.job.name}</span>
                    <span className="text-[#16A34A] text-2xl font-bold">
                      {tailor.result.predictedMatchScore}%
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{tailor.result.fitSummary}</p>

                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <p className="font-semibold text-[#16A34A] mb-1">Strengths</p>
                    <ul className="list-disc list-inside space-y-0.5 text-foreground">
                      {tailor.result.matchedStrengths.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-[#C1492E] mb-1">Gaps</p>
                    <ul className="list-disc list-inside space-y-0.5 text-foreground">
                      {tailor.result.gaps.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="font-semibold text-foreground mb-1 text-sm">Suggested bullet rewrites</p>
                  <div className="space-y-2">
                    {tailor.result.tailoredBullets.map((b, i) => (
                      <div key={i} className="text-sm bg-muted/50 rounded p-2">
                        <p className="text-foreground">✓ {b.improved}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {tailor.result.keywordsToAdd.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-foreground mb-1 text-sm">Keywords to add</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tailor.result.keywordsToAdd.map((k, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A]">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => {
                    onApply(tailor.job);
                    setTailor(null);
                  }}
                  className="w-full mt-4 bg-[#16A34A] hover:bg-[#15803D] text-white"
                >
                  <Send className="h-4 w-4 mr-1.5" /> Apply with this CV
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
