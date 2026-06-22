"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  Shield,
  Sparkles,
  Wand2,
  Radio,
  Upload,
  FileText,
  TrendingUp,
  Activity,
  Compass,
  Scissors,
  CheckCircle2,
  GitCompareArrows,
  Layers,
  AlertTriangle,
  Coins,
  DollarSign,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

/* ───────────────────────── small UI helpers ───────────────────────── */

function CountUp({ to, dur = 1, prefix = "", suffix = "" }: { to: number; dur?: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / (dur * 1000));
      setV(to * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  const display = Number.isInteger(to) ? Math.round(v) : v.toFixed(1);
  return (
    <>
      {prefix}
      {display}
      {suffix}
    </>
  );
}

function Browser({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1c1c1c] bg-white shadow-2xl">
      <div className="flex items-center gap-2 border-b border-[#ececec] bg-[#f6f6f6] px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex w-2/3 items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] text-[#888] ring-1 ring-[#ececec]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /> {url}
        </div>
      </div>
      <div className="h-[420px] overflow-hidden bg-[#fafafa] sm:h-[460px]">{children}</div>
    </div>
  );
}

function AppShell({ active, children }: { active: string; children: ReactNode }) {
  const nav = [
    { id: "campaigns", icon: Briefcase, label: "Campaigns" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "candidate", icon: Users, label: "Candidate" },
    { id: "platform", icon: Shield, label: "Platform" },
  ];
  return (
    <div className="flex h-full">
      <div className="hidden w-[58px] flex-col items-center gap-1 border-r border-[#ececec] bg-white py-3 sm:flex">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#16a34a] text-sm font-bold text-white">
          H
        </div>
        {nav.map((n) => (
          <div
            key={n.id}
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              active === n.id ? "bg-[#16a34a]/10 text-[#16a34a]" : "text-[#bbb]"
            }`}
          >
            <n.icon className="h-[18px] w-[18px]" />
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function ScoreRing({ value, size = 86 }: { value: number; size?: number }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={7} stroke="#eee" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={7}
          strokeLinecap="round"
          stroke="#16a34a"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (value / 100) * c }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#111]">
          <CountUp to={value} />
        </span>
        <span className="text-[9px] uppercase tracking-widest text-[#999]">score</span>
      </div>
    </div>
  );
}

function Bar({ label, value, color = "#16a34a" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-[#666]">{label}</span>
        <span className="font-semibold text-[#111]">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#eee]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

const head = (title: string, subtitle: string) => (
  <div className="border-b border-[#ececec] bg-white px-5 py-3">
    <div className="text-sm font-bold text-[#111]">{title}</div>
    <div className="text-[11px] text-[#999]">{subtitle}</div>
  </div>
);

/* ───────────────────────── scene content ───────────────────────── */

const CANDS = [
  { name: "Aisha Khan", role: "Senior Frontend Engineer · London", score: 94 },
  { name: "Daniel Ortega", role: "Full-stack Developer · Berlin", score: 88 },
  { name: "Mei Lin", role: "React Engineer · Singapore", score: 81 },
  { name: "Tom Becker", role: "Frontend Developer · Austin", score: 76 },
  { name: "Sara Ahmed", role: "UI Engineer · Dubai", score: 70 },
];
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);

/* — Recruiter — */

function RecruiterDashboard() {
  const campaigns = [
    { name: "Senior Frontend Engineer", tag: "Engineering", applicants: 47, status: "ongoing" },
    { name: "Product Designer", tag: "Design", applicants: 31, status: "ongoing" },
    { name: "Data Analyst", tag: "Data", applicants: 22, status: "completed" },
    { name: "DevOps Engineer", tag: "Infrastructure", applicants: 15, status: "ongoing" },
  ];
  return (
    <AppShell active="campaigns">
      {head("Your Campaigns", "Welcome back, Acme Inc.")}
      <div className="grid grid-cols-2 gap-3 p-5">
        <div className="flex h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#16a34a]/40 text-[#16a34a]">
          <Wand2 className="h-6 w-6" />
          <span className="text-xs font-semibold">New campaign</span>
        </div>
        {campaigns.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            className="flex h-[120px] flex-col justify-between rounded-xl border border-[#ececec] bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#16a34a]/10 px-2 py-0.5 text-[9px] font-semibold text-[#16a34a]">
                {c.tag}
              </span>
              <span
                className={`text-[9px] font-semibold uppercase ${
                  c.status === "completed" ? "text-[#999]" : "text-[#16a34a]"
                }`}
              >
                ● {c.status}
              </span>
            </div>
            <div className="text-sm font-semibold leading-tight text-[#111]">{c.name}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#666]">
              <Users className="h-3.5 w-3.5" /> {c.applicants} applicants
            </div>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}

function RecruiterAuthoring() {
  const bullets = [
    "Build performant, accessible React interfaces at scale",
    "5+ years with TypeScript, Next.js and modern tooling",
    "Lead design-system and component-library work",
  ];
  const criteria = [
    { k: "React / Next.js", w: 35 },
    { k: "TypeScript", w: 25 },
    { k: "System design", w: 20 },
    { k: "Communication", w: 20 },
  ];
  return (
    <AppShell active="campaigns">
      {head("Create Campaign", "✨ AI authoring · 2 free generations left")}
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#16a34a] px-3 py-1.5 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" /> Generate with AI
          </span>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#999]">Title</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-[#ececec] bg-white px-3 py-2 text-sm font-medium text-[#111]"
          >
            Senior Frontend Engineer
          </motion.div>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#999]">Description</div>
          <div className="space-y-1.5 rounded-lg border border-[#ececec] bg-white px-3 py-2.5">
            {bullets.map((b, i) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.25 }}
                className="flex items-start gap-2 text-[12px] text-[#444]"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#16a34a]" /> {b}
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#999]">Scoring criteria (weighted)</div>
          <div className="grid grid-cols-2 gap-2">
            {criteria.map((c, i) => (
              <motion.div
                key={c.k}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.15 }}
                className="rounded-lg border border-[#ececec] bg-white px-3 py-2"
              >
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-[#111]">{c.k}</span>
                  <span className="font-semibold text-[#16a34a]">{c.w}%</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#eee]">
                  <motion.div
                    className="h-full rounded-full bg-[#16a34a]"
                    initial={{ width: 0 }}
                    animate={{ width: `${c.w}%` }}
                    transition={{ delay: 1.3 + i * 0.15, duration: 0.6 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function RecruiterLiveRanking() {
  return (
    <AppShell active="campaigns">
      {head("Senior Frontend Engineer", "47 applicants")}
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16a34a] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16a34a]" />
          </span>
          <span className="text-[11px] font-semibold text-[#16a34a]">Live · scoring candidates in real time</span>
        </div>
        <div className="space-y-2">
          {CANDS.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.4 }}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                i === 0 ? "border-[#16a34a]/40 bg-[#16a34a]/[0.06]" : "border-[#ececec] bg-white"
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16a34a]/10 text-xs font-bold text-[#16a34a]">
                {initials(c.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#111]">{c.name}</div>
                <div className="truncate text-[11px] text-[#777]">{c.role}</div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb]">#{i + 1}</span>
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.4 }}
                className={`flex h-7 min-w-9 items-center justify-center rounded-md px-2 text-xs font-bold ${
                  c.score >= 85 ? "bg-[#16a34a] text-white" : "bg-[#16a34a]/15 text-[#16a34a]"
                }`}
              >
                <CountUp to={c.score} dur={0.8} />
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function RecruiterAnalytics() {
  return (
    <AppShell active="analytics">
      {head("Analytics", "Hiring insights · Pro")}
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active campaigns", value: 3 },
            { label: "Avg. AI score", value: 82 },
            { label: "Total candidates", value: 115 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#ececec] bg-white p-3 text-center">
              <div className="text-2xl font-bold text-[#16a34a]">
                <CountUp to={s.value} />
              </div>
              <div className="text-[10px] text-[#777]">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-[#ececec] bg-white p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#999]">Score distribution</div>
          <div className="flex h-28 items-end justify-between gap-2">
            {[12, 23, 41, 58, 47, 30, 18].map((v, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-[#16a34a] to-[#22c55e]"
                initial={{ height: 0 }}
                animate={{ height: `${v}%` }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[#aaa]">
            <span>40</span><span>50</span><span>60</span><span>70</span><span>80</span><span>90</span><span>100</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* — Candidate — */

function CandidateUpload() {
  return (
    <AppShell active="candidate">
      {head("Analyze your CV", "AI career intelligence")}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border-2 border-dashed border-[#16a34a]/40 bg-white p-7">
          <Upload className="h-8 w-8 text-[#16a34a]" />
          <div className="mt-3 text-sm font-semibold text-[#111]">Drop your résumé</div>
          <div className="text-[11px] text-[#999]">PDF or DOCX</div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex w-full items-center gap-2 rounded-lg border border-[#ececec] bg-[#fafafa] px-3 py-2"
          >
            <FileText className="h-4 w-4 text-[#16a34a]" />
            <span className="flex-1 text-[12px] text-[#444]">Aisha_Khan_CV.pdf</span>
            <span className="text-[10px] text-[#999]">214 KB</span>
          </motion.div>
          <div className="mt-4 w-full">
            <div className="h-1.5 overflow-hidden rounded-full bg-[#eee]">
              <motion.div
                className="h-full rounded-full bg-[#16a34a]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.7, duration: 1.8, ease: "easeInOut" }}
              />
            </div>
            <div className="mt-1.5 text-center text-[11px] text-[#16a34a]">Analyzing in the background pipeline…</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CandidateReport() {
  const decay = [
    { k: "Sketch", v: 32, c: "#ef4444" },
    { k: "jQuery", v: 28, c: "#ef4444" },
    { k: "React", v: 92, c: "#16a34a" },
    { k: "TypeScript", v: 88, c: "#16a34a" },
  ];
  const pivots = [
    { t: "AI Product Engineer", fit: 91 },
    { t: "Design Systems Lead", fit: 86 },
    { t: "Staff Frontend Eng", fit: 80 },
  ];
  return (
    <AppShell active="candidate">
      {head("Career Report", "Aisha Khan · Senior Frontend Engineer")}
      <div className="grid grid-cols-2 gap-3 overflow-auto p-4" style={{ maxHeight: 420 }}>
        <div className="col-span-2 flex items-center gap-4 rounded-xl border border-[#ececec] bg-white p-4">
          <ScoreRing value={78} />
          <div>
            <div className="text-sm font-bold text-[#111]">Career readiness</div>
            <div className="text-[11px] text-[#777]">Strong core, a few aging tools to refresh.</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              <Activity className="h-3 w-3" /> 18% automation exposure
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#ececec] bg-white p-4">
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#999]">
            <Activity className="h-3.5 w-3.5" /> Skill decay
          </div>
          <div className="space-y-2.5">
            {decay.map((d) => (
              <Bar key={d.k} label={d.k} value={d.v} color={d.c} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#ececec] bg-white p-4">
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#999]">
            <Compass className="h-3.5 w-3.5" /> Pivot paths
          </div>
          <div className="space-y-2">
            {pivots.map((p) => (
              <div key={p.t} className="flex items-center justify-between rounded-lg border border-[#f0f0f0] px-2.5 py-1.5">
                <span className="text-[12px] font-medium text-[#111]">{p.t}</span>
                <span className="rounded-full bg-[#16a34a]/10 px-2 py-0.5 text-[10px] font-bold text-[#16a34a]">{p.fit}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 rounded-xl border border-[#ececec] bg-white p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#999]">
            <Scissors className="h-3.5 w-3.5" /> CV surgery
          </div>
          <div className="space-y-1.5">
            {["Quantify impact on your last 3 bullets", "Replace Sketch with Figma + design tokens", "Add an AI-augmented workflow line"].map((s) => (
              <div key={s} className="flex items-center gap-2 text-[12px] text-[#444]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" /> {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CandidateCompare() {
  return (
    <AppShell active="candidate">
      {head("Progress Coach", "Compare two versions of your CV")}
      <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <ScoreRing value={65} size={92} />
            <div className="mt-1 text-[11px] text-[#999]">Initial</div>
          </div>
          <div className="flex flex-col items-center text-[#16a34a]">
            <GitCompareArrows className="h-6 w-6" />
            <span className="mt-1 text-lg font-bold">+20</span>
          </div>
          <div className="text-center">
            <ScoreRing value={85} size={92} />
            <div className="mt-1 text-[11px] text-[#999]">Revision</div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex max-w-md items-start gap-2 rounded-xl border border-[#16a34a]/30 bg-[#16a34a]/[0.06] p-3"
        >
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
          <p className="text-[12px] leading-snug text-[#333]">
            <span className="font-semibold text-[#16a34a]">Coach&apos;s note:</span> You applied every
            CV-surgery item — readiness jumped 65 → 85 and pivot fit rose to 91%.
          </p>
        </motion.div>
      </div>
    </AppShell>
  );
}

function CandidateApply() {
  const jobs = [
    { t: "Senior Frontend Engineer", c: "Acme Inc.", tailored: true },
    { t: "React Engineer", c: "Nimbus Labs", tailored: false },
    { t: "UI Engineer", c: "Vertex", tailored: false },
  ];
  return (
    <AppShell active="candidate">
      {head("Job Board", "Tailor your CV and apply in one click")}
      <div className="space-y-3 p-5">
        {jobs.map((j, i) => (
          <motion.div
            key={j.t}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-3 rounded-xl border border-[#ececec] bg-white p-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16a34a]/10 text-[#16a34a]">
              <Briefcase className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#111]">{j.t}</div>
              <div className="text-[11px] text-[#777]">{j.c}</div>
            </div>
            {j.tailored ? (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-1 rounded-lg bg-[#16a34a] px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Applied
              </motion.span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-[#16a34a] px-3 py-1.5 text-[11px] font-semibold text-[#16a34a]">
                <Sparkles className="h-3.5 w-3.5" /> Tailor & apply
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}

/* — Admin — */

function AdminConsole() {
  const tiles = [
    { icon: Layers, label: "Queue depth", value: 3, color: "#f59e0b" },
    { icon: Radio, label: "In-flight", value: 2, color: "#16a34a" },
    { icon: AlertTriangle, label: "Dead-letter", value: 0, color: "#ef4444" },
    { icon: CheckCircle2, label: "Processed today", value: 128, color: "#06b6d4" },
  ];
  return (
    <AppShell active="platform">
      {head("Platform Console", "Live event-driven infrastructure")}
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-[#ececec] bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${t.color}1a`, color: t.color }}>
                  <t.icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] text-[#777]">{t.label}</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#111]">
                <CountUp to={t.value} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-[#ececec] bg-white p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#999]">Resume pipeline · SQS</div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-7 flex-1 rounded"
                style={{ background: i < 3 ? "#16a34a" : "#eee" }}
                animate={i < 3 ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <div className="mt-2 text-[10px] text-[#999]">3 messages buffered · processing healthy · 0 in dead-letter</div>
        </div>
      </div>
    </AppShell>
  );
}

function AdminTenants() {
  const tenants = [
    { name: "Acme Inc.", plan: "Pro", credits: 420, status: "active" },
    { name: "Nimbus Labs", plan: "Free", credits: 18, status: "active" },
    { name: "Vertex", plan: "Pro", credits: 96, status: "active" },
    { name: "Globex", plan: "Free", credits: 0, status: "suspended" },
  ];
  return (
    <AppShell active="platform">
      {head("Tenants", "Multi-tenant management")}
      <div className="p-5">
        <div className="overflow-hidden rounded-xl border border-[#ececec]">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_1fr] bg-[#f6f6f6] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#999]">
            <span>Company</span><span>Plan</span><span>Credits</span><span>Actions</span>
          </div>
          {tenants.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="grid grid-cols-[1.4fr_0.7fr_0.8fr_1fr] items-center border-t border-[#f0f0f0] bg-white px-3 py-2.5 text-[12px]"
            >
              <span className="flex items-center gap-2 font-medium text-[#111]">
                {t.name}
                {t.status === "suspended" && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-600">suspended</span>
                )}
              </span>
              <span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.plan === "Pro" ? "bg-[#16a34a]/10 text-[#16a34a]" : "bg-[#eee] text-[#666]"}`}>
                  {t.plan}
                </span>
              </span>
              <span className="flex items-center gap-1 text-[#444]">
                <Coins className="h-3.5 w-3.5 text-[#16a34a]" /> {t.credits}
              </span>
              <span className="flex gap-1.5">
                <span className="rounded-md border border-[#ececec] px-2 py-1 text-[10px] text-[#666]">+ credits</span>
                <span className="rounded-md border border-[#ececec] px-2 py-1 text-[10px] text-[#666]">
                  {t.status === "suspended" ? "Restore" : "Suspend"}
                </span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function AdminRevenue() {
  const txns = [
    { co: "Acme Inc.", kind: "Pro upgrade", amt: 9 },
    { co: "Vertex", kind: "Scale Pack · 500 credits", amt: 129 },
    { co: "Nimbus Labs", kind: "Starter Pack · 50 credits", amt: 19 },
    { co: "Acme Inc.", kind: "Growth Pack · 200 credits", amt: 59 },
  ];
  return (
    <AppShell active="platform">
      {head("Revenue", "Billing across all tenants")}
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#ececec] bg-white p-4">
            <div className="flex items-center gap-1.5 text-[11px] text-[#777]">
              <DollarSign className="h-3.5 w-3.5 text-[#16a34a]" /> Total revenue
            </div>
            <div className="mt-1 text-2xl font-bold text-[#111]">
              <CountUp to={216} prefix="$" />
            </div>
          </div>
          <div className="rounded-xl border border-[#ececec] bg-white p-4">
            <div className="flex items-center gap-1.5 text-[11px] text-[#777]">
              <TrendingUp className="h-3.5 w-3.5 text-[#16a34a]" /> Paying tenants
            </div>
            <div className="mt-1 text-2xl font-bold text-[#111]">
              <CountUp to={2} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#ececec] bg-white">
          <div className="border-b border-[#f0f0f0] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#999]">
            Recent transactions
          </div>
          {txns.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between border-b border-[#f5f5f5] px-4 py-2.5 last:border-0"
            >
              <div>
                <div className="text-[12px] font-medium text-[#111]">{t.co}</div>
                <div className="text-[10px] text-[#999]">{t.kind}</div>
              </div>
              <span className="text-sm font-bold text-[#16a34a]">${t.amt}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

/* ───────────────────────── persona + scene config ───────────────────────── */

interface Scene {
  id: string;
  url: string;
  title: string;
  explain: string;
  tech: string[];
  body: ReactNode;
}
interface Persona {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  scenes: Scene[];
}

const PERSONAS: Persona[] = [
  {
    id: "recruiter",
    label: "Recruiter",
    icon: Briefcase,
    blurb: "Create campaigns, let AI write them, and rank applicants automatically.",
    scenes: [
      {
        id: "dash",
        url: "hiretics.app /",
        title: "Campaign dashboard",
        explain:
          "The recruiter's home. Every campaign is scoped to their company (multi-tenancy) and shows live applicant counts pulled from DynamoDB.",
        tech: ["Per-company scoping", "DynamoDB CompanyIndex"],
        body: <RecruiterDashboard />,
      },
      {
        id: "author",
        url: "hiretics.app / campaigns / new",
        title: "AI campaign authoring",
        explain:
          "One click and the AI drafts the title, description and weighted scoring criteria. Free accounts get 3 generations, then it's gated to Pro.",
        tech: ["aiAuthor Lambda", "Entitlement gate (3 free → Pro)", "gpt-4o-mini"],
        body: <RecruiterAuthoring />,
      },
      {
        id: "rank",
        url: "hiretics.app / campaign / frontend-eng",
        title: "Live ranking",
        explain:
          "As each CV is uploaded it flows S3 → SQS → Worker → AI → DynamoDB, and the score is pushed back over Socket.IO — the shortlist re-ranks live, no refresh.",
        tech: ["Event-driven pipeline", "Socket.IO push", "Pre-sorted by AI score"],
        body: <RecruiterLiveRanking />,
      },
      {
        id: "analytics",
        url: "hiretics.app / analytics",
        title: "Hiring analytics",
        explain:
          "Pro unlocks aggregate insights — score distribution, age, university and city breakdowns — computed across all of the company's candidates.",
        tech: ["Analytics Lambdas", "Aggregations over DynamoDB"],
        body: <RecruiterAnalytics />,
      },
    ],
  },
  {
    id: "candidate",
    label: "Candidate",
    icon: Users,
    blurb: "Upload a résumé, get a career report, and apply to live roles in a click.",
    scenes: [
      {
        id: "upload",
        url: "hiretics.app / candidate / analyze",
        title: "Upload résumé",
        explain:
          "The CV is uploaded straight to S3 with a presigned URL and analysed on the second event-driven pipeline — exactly like the recruiter side, reused.",
        tech: ["Presigned S3 upload", "Analysis queue + worker"],
        body: <CandidateUpload />,
      },
      {
        id: "report",
        url: "hiretics.app / candidate / report",
        title: "Career report",
        explain:
          "A full AI report: readiness score, skill-decay radar, automation exposure, pivot paths and line-level CV surgery — generated by the worker and stored as a CV version.",
        tech: ["AI career analysis", "CV versions table"],
        body: <CandidateReport />,
      },
      {
        id: "compare",
        url: "hiretics.app / candidate / compare",
        title: "Progress coach",
        explain:
          "Re-upload a revised CV and the AI grades your follow-through — an adherence score, a readiness delta and a personal coach's note.",
        tech: ["CV comparisons table", "AI diff scoring"],
        body: <CandidateCompare />,
      },
      {
        id: "apply",
        url: "hiretics.app / candidate / jobs",
        title: "Tailor & apply",
        explain:
          "Browse public campaigns, tailor the CV to a role, and apply in one click — the application drops straight into that recruiter's ranking pipeline.",
        tech: ["Public job board", "One-click apply → ranking pipeline"],
        body: <CandidateApply />,
      },
    ],
  },
  {
    id: "admin",
    label: "Platform Owner",
    icon: Shield,
    blurb: "Operate the whole system — live infra, tenants and revenue.",
    scenes: [
      {
        id: "console",
        url: "hiretics.app / platform",
        title: "Live infrastructure",
        explain:
          "The super-admin sees the event-driven system itself — real SQS queue depth, in-flight messages and dead-letter count — making the architecture visible.",
        tech: ["adminInfra Lambda", "Live SQS + DLQ metrics"],
        body: <AdminConsole />,
      },
      {
        id: "tenants",
        url: "hiretics.app / platform / tenants",
        title: "Tenant management",
        explain:
          "Every company on the platform, with one-click suspend and credit grants. Suspending a tenant instantly gates their pipeline.",
        tech: ["Multi-tenancy", "Suspend / credit controls"],
        body: <AdminTenants />,
      },
      {
        id: "revenue",
        url: "hiretics.app / platform / revenue",
        title: "Revenue",
        explain:
          "Billing rolled up across all tenants — Pro upgrades and credit-pack purchases, recorded idempotently from the billing pipeline.",
        tech: ["Transactions table", "Idempotent fulfillment"],
        body: <AdminRevenue />,
      },
    ],
  },
];

/* ───────────────────────── component ───────────────────────── */

export function ProductTour() {
  const [pIdx, setPIdx] = useState(0);
  const [sIdx, setSIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const persona = PERSONAS[pIdx];
  const scene = persona.scenes[sIdx];

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setSIdx((s) => {
        if (s < persona.scenes.length - 1) return s + 1;
        // move to next persona, loop around
        setPIdx((p) => (p + 1) % PERSONAS.length);
        return 0;
      });
    }, 5000);
    return () => clearTimeout(t);
  }, [playing, sIdx, pIdx, persona.scenes.length]);

  const selectPersona = (i: number) => {
    setPIdx(i);
    setSIdx(0);
  };

  return (
    <div className="w-full">
      {/* persona tabs */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PERSONAS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => selectPersona(i)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                i === pIdx
                  ? "border-[#16a34a] bg-[#16a34a] text-white"
                  : "border-[#2a2a2a] bg-[#141414] text-[#cfcfcf] hover:bg-[#1c1c1c]"
              }`}
            >
              <p.icon className="h-4 w-4" /> {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPlaying((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          {playing ? "Pause tour" : "Auto-play tour"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* device */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${persona.id}-${scene.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <Browser url={scene.url}>{scene.body}</Browser>
            </motion.div>
          </AnimatePresence>

          {/* scene controls */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setSIdx((s) => Math.max(0, s - 1))}
              disabled={sIdx === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <div className="flex items-center gap-1.5">
              {persona.scenes.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === sIdx ? "w-6 bg-[#16a34a]" : "w-2 bg-[#333]"}`}
                  aria-label={s.title}
                />
              ))}
            </div>
            <button
              onClick={() => setSIdx((s) => Math.min(persona.scenes.length - 1, s + 1))}
              disabled={sIdx === persona.scenes.length - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-white disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* explanation */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0c0c0c] p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#16a34a]">
            <persona.icon className="h-3.5 w-3.5" /> {persona.label}
          </div>
          <p className="mt-1 text-xs text-[#888]">{persona.blurb}</p>

          <div className="my-4 h-px bg-[#1c1c1c]" />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${persona.id}-${scene.id}-info`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#16a34a]/15 text-[11px] font-bold text-[#16a34a]">
                  {sIdx + 1}
                </span>
                <h3 className="text-base font-bold text-white">{scene.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#cfcfcf]">{scene.explain}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {scene.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#262626] bg-[#141414] px-2.5 py-1 text-[11px] text-[#cfcfcf]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
