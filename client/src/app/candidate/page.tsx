"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CandidateNav } from "@/components/candidate/CandidateNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, FileText, ArrowRight } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getThreads, type CVThread } from "@/api/candidate/api";

export default function CandidateDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [threads, setThreads] = useState<CVThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "Candidate") {
      router.replace("/login");
      return;
    }
    setReady(true);
    getThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <CandidateNav />
      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your CV Threads</h1>
            <p className="text-muted-foreground">Track each CV across versions and watch your readiness improve.</p>
          </div>
          <Link href="/candidate/analyze">
            <Button className="bg-[#16A34A] hover:bg-[#15803D] text-white">
              <FileUp className="h-4 w-4 mr-1.5" /> Analyze a CV
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : threads.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground mb-1">No CV analyses yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your CV to get an executive-grade career report.
              </p>
              <Link href="/candidate/analyze">
                <Button className="bg-[#16A34A] hover:bg-[#15803D] text-white">Get started</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {threads.map((t) => (
              <Card key={t.threadId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.versionCount} version{t.versionCount === 1 ? "" : "s"} · updated{" "}
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {typeof t.latestScore === "number" && (
                      <span className="text-2xl font-bold text-[#16A34A]">{t.latestScore}</span>
                    )}
                  </div>
                  <Link
                    href={`/candidate/threads/${t.threadId}`}
                    className="inline-flex items-center gap-1 text-sm text-[#16A34A] font-medium mt-4"
                  >
                    Open thread <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
