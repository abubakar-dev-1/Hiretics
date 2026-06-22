"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CandidateNav } from "@/components/candidate/CandidateNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileUp, GitCompare } from "lucide-react";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import {
  getThread,
  compareVersions,
  type CVThread,
  type CVVersion,
  type ComparisonReport,
} from "@/api/candidate/api";

export default function ThreadPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = params.threadId as string;
  const [ready, setReady] = useState(false);
  const [thread, setThread] = useState<CVThread | null>(null);
  const [versions, setVersions] = useState<CVVersion[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonReport | null>(null);
  const [comparing, setComparing] = useState(false);

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
    getThread(threadId)
      .then((d) => {
        setThread(d.thread);
        setVersions(d.versions);
      })
      .catch(console.error);
  }, [ready, threadId]);

  if (!ready) return null;

  const analyzed = versions.filter((v) => v.status === "analyzed");

  const toggle = (cvId: string) => {
    setSel((prev) =>
      prev.includes(cvId) ? prev.filter((x) => x !== cvId) : prev.length < 2 ? [...prev, cvId] : [prev[1], cvId],
    );
  };

  const runCompare = async () => {
    if (sel.length !== 2) return toast.error("Select exactly two analyzed versions");
    // order by createdAt: older = previous
    const [a, b] = sel
      .map((id) => versions.find((v) => v.cvId === id)!)
      .sort((x, y) => (x.createdAt < y.createdAt ? -1 : 1));
    setComparing(true);
    try {
      const { report } = await compareVersions(a.cvId, b.cvId);
      setComparison(report);
    } catch (e: any) {
      toast.error(e?.message || "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <CandidateNav />
      <main className="max-w-[1000px] mx-auto px-6 py-8">
        <Button variant="ghost" size="sm" onClick={() => router.push("/candidate")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{thread?.title || "CV thread"}</h1>
            <p className="text-muted-foreground">{versions.length} versions · select two to compare</p>
          </div>
          <Link href={`/candidate/analyze?threadId=${threadId}`}>
            <Button className="bg-[#16A34A] hover:bg-[#15803D] text-white">
              <FileUp className="h-4 w-4 mr-1.5" /> New version
            </Button>
          </Link>
        </div>

        <div className="space-y-3 mb-6">
          {versions.map((v) => (
            <Card key={v.cvId}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {v.status === "analyzed" && (
                    <input
                      type="checkbox"
                      checked={sel.includes(v.cvId)}
                      onChange={() => toggle(v.cvId)}
                      className="h-4 w-4 accent-[#16A34A]"
                    />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{v.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(v.createdAt).toLocaleString()} ·{" "}
                      <span
                        className={
                          v.status === "analyzed"
                            ? "text-[#16A34A]"
                            : v.status === "failed"
                            ? "text-[#C1492E]"
                            : "text-[#E0A458]"
                        }
                      >
                        {v.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {typeof v.readinessScore === "number" && (
                    <span className="text-xl font-bold text-[#16A34A]">{v.readinessScore}</span>
                  )}
                  <Link href={`/candidate/report/${v.cvId}`}>
                    <Button variant="outline" size="sm">
                      View report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {analyzed.length >= 2 && (
          <Button
            onClick={runCompare}
            disabled={sel.length !== 2 || comparing}
            className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white mb-6"
          >
            <GitCompare className="h-4 w-4 mr-1.5" />
            {comparing ? "Comparing…" : "Compare selected versions"}
          </Button>
        )}

        {comparison && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Progress comparison
                <span
                  className={`text-lg font-bold ${
                    comparison.scoreDelta >= 0 ? "text-[#16A34A]" : "text-[#C1492E]"
                  }`}
                >
                  {comparison.scoreDelta >= 0 ? "+" : ""}
                  {comparison.scoreDelta} pts
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground bg-muted/50 rounded-lg p-3">{comparison.coachNote}</p>
              <p className="text-sm text-muted-foreground">Adherence to prior plan: {comparison.adherenceScore}%</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-[#16A34A] mb-1">Wins</p>
                  <ul className="list-disc list-inside text-foreground space-y-1">
                    {comparison.wins.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[#E0A458] mb-1">Still open</p>
                  <ul className="list-disc list-inside text-foreground space-y-1">
                    {comparison.stillOpen.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[#1F3A5F] mb-1">New strengths</p>
                  <ul className="list-disc list-inside text-foreground space-y-1">
                    {comparison.newStrengths.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
