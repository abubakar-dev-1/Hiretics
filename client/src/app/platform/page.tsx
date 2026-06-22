"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Building2,
  Coins,
  DollarSign,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getUser, signOut } from "@/lib/auth";
import {
  getInfra,
  getTenants,
  getRevenue,
  suspendTenant,
  grantCredits,
  type InfraMetrics,
  type Tenant,
  type RevenueSummary,
} from "@/api/admin/api";

const money = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

export default function PlatformConsole() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [infra, setInfra] = useState<InfraMetrics | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "SuperAdmin") {
      router.replace("/");
      return;
    }
    setAuthorized(true);
  }, [router]);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [i, t, r] = await Promise.all([getInfra(), getTenants(), getRevenue()]);
      setInfra(i);
      setTenants(t);
      setRevenue(r);
    } catch (e: any) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Poll the infra monitor for a live queue-depth feel.
  useEffect(() => {
    if (!authorized) return;
    loadAll();
    const id = setInterval(() => {
      getInfra().then(setInfra).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [authorized, loadAll]);

  const onSuspend = async (t: Tenant) => {
    try {
      await suspendTenant(t.companyId, !t.suspended);
      toast.success(t.suspended ? "Tenant reactivated" : "Tenant suspended");
      loadAll();
    } catch {
      toast.error("Action failed");
    }
  };

  const onGrant = async (t: Tenant) => {
    const input = window.prompt(`Grant how many credits to "${t.name}"?`, "50");
    if (!input) return;
    const amount = parseInt(input, 10);
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Enter a positive number");
    try {
      await grantCredits(t.companyId, amount);
      toast.success(`Granted ${amount} credits`);
      loadAll();
    } catch {
      toast.error("Could not grant credits");
    }
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1F3A5F] flex items-center justify-center text-white font-bold">
              H
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">Platform Console</h1>
              <p className="text-xs text-muted-foreground">Super-Admin · infrastructure & tenants</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadAll} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signOut();
                router.replace("/login");
              }}
            >
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-8">
        {/* Infrastructure monitor */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Event-Driven Infrastructure
            {infra && (
              <span className="ml-2 normal-case font-normal text-xs">
                AI: <b>{infra.provider.ai}</b> · Billing: <b>{infra.provider.billing}</b>
              </span>
            )}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Metric label="Queue · waiting" value={infra?.queues.resume.available} accent="#2E5E8C" />
            <Metric label="Queue · in-flight" value={infra?.queues.resume.inFlight} accent="#1B998B" />
            <Metric
              label="DLQ · failed"
              value={infra?.queues.dlq.available}
              accent="#C1492E"
              warn={(infra?.queues.dlq.available ?? 0) > 0}
            />
            <Metric label="CVs scored" value={infra?.pipeline.scored} accent="#16A34A" />
            <Metric label="CVs pending" value={infra?.pipeline.pending} accent="#E0A458" />
            <Metric label="Manual review" value={infra?.pipeline.manualReview} accent="#6C5B7B" />
          </div>
        </section>

        {/* Revenue */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Revenue
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric
              label="Total revenue"
              value={revenue ? money(revenue.totalCents, revenue.currency) : undefined}
              accent="#16A34A"
              isText
            />
            <Metric
              label="Credit packs"
              value={revenue ? money(revenue.creditsRevenueCents, revenue.currency) : undefined}
              accent="#2E5E8C"
              isText
            />
            <Metric
              label="Pro upgrades"
              value={revenue ? money(revenue.proRevenueCents, revenue.currency) : undefined}
              accent="#6C5B7B"
              isText
            />
            <Metric label="Paid orders" value={revenue?.paidCount} accent="#1B998B" />
          </div>
          {revenue && revenue.recent.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border text-sm">
                  {revenue.recent.map((t) => (
                    <div key={t.txnId} className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">
                        {t.kind === "pro" ? "Pro upgrade" : `${t.credits} credits`} ·{" "}
                        {new Date(t.paidAt).toLocaleDateString()}
                      </span>
                      <span className="font-medium">{money(t.amountCents, t.currency)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Tenants */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Tenants ({tenants.length})
          </h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Credits</th>
                    <th className="px-4 py-3 font-medium">Users</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.companyId} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            t.plan === "pro"
                              ? "bg-[#16A34A]/10 text-[#16A34A]"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5 text-[#16A34A]" /> {t.availableCredits}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" /> {t.userCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {t.suspended ? (
                          <span className="flex items-center gap-1 text-[#C1492E] text-xs font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" /> Suspended
                          </span>
                        ) : (
                          <span className="text-[#16A34A] text-xs font-medium">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => onGrant(t)}>
                            + Credits
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={
                              t.suspended
                                ? "text-[#16A34A] border-[#16A34A]/40"
                                : "text-[#C1492E] border-[#C1492E]/40"
                            }
                            onClick={() => onSuspend(t)}
                          >
                            {t.suspended ? "Reactivate" : "Suspend"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                        No tenants yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  warn = false,
  isText = false,
}: {
  label: string;
  value: number | string | undefined;
  accent: string;
  warn?: boolean;
  isText?: boolean;
}) {
  return (
    <Card className={warn ? "border-[#C1492E]/40" : ""}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p
          className={`font-bold ${isText ? "text-xl" : "text-2xl"}`}
          style={{ color: accent }}
        >
          {value ?? "—"}
        </p>
      </CardContent>
    </Card>
  );
}
