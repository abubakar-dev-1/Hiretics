"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Check, BarChart3, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signUp } from "@/lib/auth";
import { toast } from "sonner";

interface SignupFormProps {
  onSubmit?: (name: string, email: string, password: string) => Promise<void>;
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

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains number", met: /\d/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError("Please meet all password requirements");
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(name, email, password);
      } else {
        // Creates the company + admin user and logs in (returns a JWT).
        await signUp({ companyName: `${name}'s Company`, fullName: name, email, password });
        toast.success("Account created!");
        try {
          router.push("/");
          router.refresh();
        } catch {
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
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
            Start hiring
            <br />
            with AI today.
          </h2>
          <p className="text-white/70 text-base mb-12">
            Join thousands of recruiters who save hours with smart CV ranking.
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

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Create account</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Get started with your free account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertDescription className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs">
                      <Check
                        className={`h-3 w-3 ${
                          req.met ? "text-[#16A34A]" : "text-muted-foreground/40"
                        }`}
                      />
                      <span className={req.met ? "text-[#16A34A]" : "text-muted-foreground"}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
                style={{ accentColor: "#16A34A" }}
              />
              <Label htmlFor="terms" className="text-xs text-muted-foreground leading-4">
                I agree to the{" "}
                <Link href="/" className="font-medium text-[#16A34A] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/" className="font-medium text-[#16A34A] hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#16A34A] hover:bg-[#15803D] text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-[#16A34A] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
