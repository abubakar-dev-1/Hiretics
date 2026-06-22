"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/SideBar";
import { Header } from "@/components/layout/Header";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  getCompany,
  getPacks,
  purchase,
  type CompanyInfo,
  type PacksResponse,
} from "@/api/billing/api";

const proFeatures = [
  "Unlimited active campaigns",
  "Unlimited AI campaign authoring",
  "Full analytics dashboard",
  "Age, university & city insights",
  "Priority CV processing",
  "Everything in Free",
];
const freeFeatures = [
  "AI-powered CV ranking",
  "3 AI authoring generations",
  "Candidate management",
  "Favourite campaigns",
];
const freeLimitations = ["No advanced analytics", "AI authoring capped at 3"];

const fmt = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

export default function PricingPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [packsData, setPacksData] = useState<PacksResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([getCompany(), getPacks()]);
      setCompany(c);
      setPacksData(p);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Stripe redirect return (?status=success&txn=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") {
      toast.success("🎉 Payment successful!");
      refresh();
      window.history.replaceState({}, document.title, "/pricing");
    } else if (status === "cancel") {
      toast.info("Checkout cancelled");
      window.history.replaceState({}, document.title, "/pricing");
    }
  }, [refresh]);

  const isPro = company?.plan === "pro";

  const handleSubscribePro = async () => {
    setBusy("pro");
    try {
      const { completed } = await purchase("pro");
      if (completed) {
        toast.success("🎉 Welcome to Pro!");
        await refresh();
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not start checkout");
    } finally {
      setBusy(null);
    }
  };

  const handleBuyPack = async (packId: string) => {
    setBusy(packId);
    try {
      const { completed } = await purchase("credits", packId);
      if (completed) {
        toast.success("Credits added to your account!");
        await refresh();
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not start checkout");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full bg-muted/20">
      <div className="max-w-[1440px] mx-auto flex px-0 lg:px-6 lg:pt-6 pt-2">
        <div className="border-border border-[1px] shadow-md rounded-[6px] h-screen">
          <Sidebar
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <MobileHeader onMobileMenuClick={() => setIsMobileOpen(true)} title="Pricing Plans" />
          <Header title="Pricing & Billing" subtitle="Manage your plan and credits" />

          <div className="flex-1 p-6 overflow-auto pb-20">
            {/* Current status banner */}
            <div className="max-w-4xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isPro ? "bg-[#16A34A] text-white" : "bg-muted text-foreground"
                  }`}
                >
                  {isPro ? "Pro plan" : "Free plan"}
                </span>
                {company?.entitlement?.aiAuthor && !isPro && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-[#16A34A]" />
                    {company.entitlement.aiAuthor.remaining} AI authoring left
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Coins className="h-5 w-5 text-[#16A34A]" />
                {company?.availableCredits ?? 0} credits
              </div>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch mb-12">
              <PlanCard
                name="Free"
                price="$0"
                period="forever"
                features={freeFeatures}
                limitations={freeLimitations}
                current={!isPro}
              />
              <PlanCard
                name="Pro"
                price={packsData ? fmt(packsData.pro.amountCents, packsData.pro.currency) : "$9"}
                period="per month"
                features={proFeatures}
                popular
                current={isPro}
                cta={
                  <Button
                    onClick={handleSubscribePro}
                    disabled={isPro || busy === "pro"}
                    className="w-full h-12 text-base font-medium bg-[#16A34A] hover:bg-[#15803D] text-white"
                  >
                    {isPro ? "Current Plan" : busy === "pro" ? "Processing…" : "Upgrade to Pro"}
                  </Button>
                }
              />
            </div>

            {/* Credit packs */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Buy Credits</h2>
              <p className="text-center text-muted-foreground mb-8">
                Each CV scored by the AI ranking pipeline costs 1 credit.
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                {(packsData?.packs ?? []).map((pack) => (
                  <Card key={pack.id} className="rounded-xl border-border shadow-sm flex flex-col">
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {pack.name}
                      </CardTitle>
                      <div className="flex items-center justify-center gap-1 text-[#16A34A] font-bold text-2xl mt-2">
                        <Coins className="h-5 w-5" /> {pack.credits}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-end gap-4">
                      <span className="text-xl font-bold text-foreground">
                        {fmt(pack.amountCents, pack.currency)}
                      </span>
                      <Button
                        onClick={() => handleBuyPack(pack.id)}
                        disabled={busy === pack.id}
                        variant="outline"
                        className="w-full border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A]/10"
                      >
                        {busy === pack.id ? "Processing…" : "Buy"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {packsData?.provider === "mock" && (
                <p className="text-center text-xs text-muted-foreground mt-6">
                  Demo billing mode — purchases are simulated (no real charge).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  features,
  limitations = [],
  popular = false,
  current = false,
  cta,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  current?: boolean;
  cta?: React.ReactNode;
}) {
  return (
    <Card
      className={`relative rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl h-full flex flex-col ${
        popular ? "border-[#16A34A] ring-2 ring-[#16A34A]/20 scale-105" : "border-border"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#16A34A] text-white px-4 py-2 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          {name}
          {current && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Current
            </span>
          )}
        </CardTitle>
        <div className="mb-2">
          <span className="text-5xl font-bold text-foreground">{price}</span>
          <span className="text-muted-foreground ml-2">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-6">
        <div className="flex-1">
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#16A34A] mt-0.5 flex-shrink-0" />
                <span className="text-foreground text-sm">{f}</span>
              </li>
            ))}
            {limitations.map((l) => (
              <li key={l} className="flex items-start gap-3">
                <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">{l}</span>
              </li>
            ))}
          </ul>
        </div>
        {cta && <div className="pt-4">{cta}</div>}
      </CardContent>
    </Card>
  );
}
