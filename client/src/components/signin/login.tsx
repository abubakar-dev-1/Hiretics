"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, BarChart3, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "@/lib/auth";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
}

const features = [
  {
    icon: Users,
    title: "Smart CV Ranking",
    description: "AI ranks candidates so you find the best fit instantly",
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    description: "Insights on age, location, university and score distributions",
  },
  {
    icon: Zap,
    title: "Fast Campaign Setup",
    description: "Create a campaign and start receiving CVs in minutes",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared with third parties",
  },
];

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const router = useRouter();
  const setUser = useUserStore(
    (state: {
      setUser: (email: string | null, displayName: string | null) => void;
    }) => state.setUser
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email, password);
      } else {
        const data = await signIn(email, password);
        toast.success("Signed in successfully!");
        setUser(data.user?.email ?? null, data.user?.fullName ?? null);
        // Route by role: platform owner → console, candidate → portal, else dashboard.
        const role = data.user?.role;
        const dest =
          role === "SuperAdmin" ? "/platform" : role === "Candidate" ? "/candidate" : "/";
        try {
          router.push(dest);
          router.refresh();
        } catch (navError) {
          window.location.href = dest;
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-[#16A34A] relative overflow-hidden flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              Hiretics
            </span>
          </div>

          <h2 className="text-white text-3xl font-bold leading-tight mb-3">
            Hire smarter,
            <br />
            not harder.
          </h2>
          <p className="text-white/70 text-base mb-12">
            AI-powered recruitment that saves you hours of manual CV screening.
          </p>

          <div className="space-y-5">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-3">
                <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <feature.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    {feature.title}
                  </p>
                  <p className="text-white/60 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">
          Trusted by recruiters worldwide
        </p>

        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-lg bg-[#16A34A] flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-foreground text-xl font-bold tracking-tight">
              Hiretics
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertDescription className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#16A34A] hover:bg-[#15803D] text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#16A34A] hover:underline"
            >
              Create account
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Looking for a job?{" "}
            <Link
              href="/candidate/signup"
              className="font-medium text-[#16A34A] hover:underline"
            >
              Sign up as a candidate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
