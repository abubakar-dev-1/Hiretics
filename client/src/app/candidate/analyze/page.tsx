"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CandidateNav } from "@/components/candidate/CandidateNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { uploadCV, type PresignBody } from "@/api/candidate/api";

export default function AnalyzePage() {
  const router = useRouter();
  const search = useSearchParams();
  const threadId = search.get("threadId") || undefined;
  const [ready, setReady] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<PresignBody>({
    threadId,
    title: "",
    currentLocation: "",
    targetLocation: "",
    remotePreference: "any",
    employmentStatus: "employed",
    careerAspiration: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "Candidate") {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Choose a PDF CV to upload");
    setSubmitting(true);
    try {
      const { cvId } = await uploadCV(file, { ...form, threadId });
      toast.success("Uploaded — analyzing your CV…");
      router.push(`/candidate/report/${cvId}`);
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
      setSubmitting(false);
    }
  };

  const set = (patch: Partial<PresignBody>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="min-h-screen bg-muted/20">
      <CandidateNav />
      <main className="max-w-[640px] mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{threadId ? "Upload a new version" : "Analyze your CV"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              We’ll generate a career report: skill decay, automation exposure, pivot paths, a
              30-60-90 plan, and line-level CV surgery.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>CV (PDF)</Label>
                <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              {!threadId && (
                <div className="space-y-1.5">
                  <Label>Thread title</Label>
                  <Input
                    placeholder="e.g. Frontend Engineer CV"
                    value={form.title}
                    onChange={(e) => set({ title: e.target.value })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Current location</Label>
                  <Input value={form.currentLocation} onChange={(e) => set({ currentLocation: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Target location (optional)</Label>
                  <Input value={form.targetLocation} onChange={(e) => set({ targetLocation: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Remote preference</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.remotePreference}
                    onChange={(e) => set({ remotePreference: e.target.value as PresignBody["remotePreference"] })}
                  >
                    <option value="any">Any</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Employment status</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.employmentStatus}
                    onChange={(e) => set({ employmentStatus: e.target.value as PresignBody["employmentStatus"] })}
                  >
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="freelancing">Freelancing</option>
                    <option value="student">Student</option>
                    <option value="career-break">Career break</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Career aspiration (optional)</Label>
                <Textarea
                  placeholder="Where do you want your career to go?"
                  value={form.careerAspiration}
                  onChange={(e) => set({ careerAspiration: e.target.value })}
                  className="resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
              >
                <FileUp className="h-4 w-4 mr-1.5" />
                {submitting ? "Uploading…" : "Analyze CV"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
