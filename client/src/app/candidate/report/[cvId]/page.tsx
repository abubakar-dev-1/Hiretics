"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CandidateNav } from "@/components/candidate/CandidateNav";
import { ReportView } from "@/components/candidate/ReportView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getCV, type CVVersion } from "@/api/candidate/api";

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const cvId = params.cvId as string;
  const [ready, setReady] = useState(false);
  const [cv, setCV] = useState<CVVersion | null>(null);

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
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const data = await getCV(cvId);
        if (!active) return;
        setCV(data);
        if (data.status === "pending" || data.status === "analyzing") {
          timer = setTimeout(poll, 4000);
        }
      } catch (e) {
        console.error(e);
      }
    };
    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [ready, cvId]);

  if (!ready) return null;

  const analyzing = cv && (cv.status === "pending" || cv.status === "analyzing");

  return (
    <div className="min-h-screen bg-muted/20">
      <CandidateNav />
      <main className="max-w-[1000px] mx-auto px-6 py-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {!cv ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : analyzing ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Loader2 className="h-10 w-10 mx-auto text-[#16A34A] animate-spin mb-4" />
              <p className="font-medium text-foreground mb-1">Analyzing your CV…</p>
              <p className="text-sm text-muted-foreground">
                Our AI is generating your career report. This usually takes a few seconds.
              </p>
            </CardContent>
          </Card>
        ) : cv.status === "failed" ? (
          <Card>
            <CardContent className="py-20 text-center">
              <AlertTriangle className="h-10 w-10 mx-auto text-[#C1492E] mb-4" />
              <p className="font-medium text-foreground mb-1">Analysis failed</p>
              <p className="text-sm text-muted-foreground mb-4">{cv.error || "Please try a different PDF."}</p>
              <Link href="/candidate/analyze">
                <Button className="bg-[#16A34A] hover:bg-[#15803D] text-white">Try again</Button>
              </Link>
            </CardContent>
          </Card>
        ) : cv.report ? (
          <ReportView report={cv.report} />
        ) : null}
      </main>
    </div>
  );
}
