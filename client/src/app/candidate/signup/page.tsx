"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { signUpCandidate } from "@/lib/auth";

export default function CandidateSignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpCandidate({ fullName, email, password });
      toast.success("Welcome to Hiretics!");
      router.push("/candidate");
    } catch (err: any) {
      toast.error(err?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-10 w-10 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold mx-auto mb-2">
            H
          </div>
          <CardTitle className="text-xl">Create your candidate account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Get AI career analysis and apply to jobs in one click.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
            >
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-[#16A34A] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
