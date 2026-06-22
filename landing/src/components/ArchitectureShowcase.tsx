"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MonitorSmartphone,
  Network,
  ShieldCheck,
  Boxes,
  HardDrive,
  Layers,
  Cpu,
  Sparkles,
  Database,
  AlertTriangle,
  Radio,
  FileText,
  Play,
  Pause,
  RotateCcw,
  X,
  Wand2,
  Coins,
  Briefcase,
  BarChart3,
  Building2,
  Activity,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

/* ───────────────────────────── data model ───────────────────────────── */

type GroupKey = "client" | "edge" | "compute" | "messaging" | "storage" | "ai" | "realtime";

const GROUPS: Record<GroupKey, { label: string; color: string }> = {
  client: { label: "Client", color: "#3b82f6" },
  edge: { label: "API Edge", color: "#8b5cf6" },
  compute: { label: "Compute · Lambda", color: "#16a34a" },
  messaging: { label: "Messaging", color: "#f59e0b" },
  storage: { label: "Storage", color: "#06b6d4" },
  ai: { label: "AI", color: "#ec4899" },
  realtime: { label: "Realtime", color: "#10b981" },
};

interface NodeDef {
  id: string;
  title: string;
  sub: string;
  group: GroupKey;
  icon: LucideIcon;
  x: number;
  y: number;
  what: string;
  why: string;
  tech: string[];
}

const NODES: NodeDef[] = [
  { id: "users", title: "Users", sub: "Recruiter · Candidate · Admin", group: "client", icon: Users, x: 0.07, y: 0.5,
    what: "Three personas use the platform — recruiters who hire, candidates who get analysed, and platform owners who run it.",
    why: "A single system serves both sides of the hiring table plus the operator, so every actor shares one data model and one pipeline.",
    tech: ["Role-based experiences", "SuperAdmin · Admin · Recruiter · Candidate"] },
  { id: "frontend", title: "Next.js Frontend", sub: "React · Vercel", group: "client", icon: MonitorSmartphone, x: 0.225, y: 0.5,
    what: "The web app — dashboards, campaign creation, the candidate portal and the live platform console.",
    why: "Server-rendered React keeps the UI fast; it talks to the backend only through the API gateway and a realtime socket.",
    tech: ["Next.js App Router", "Tailwind UI", "Socket.IO client"] },
  { id: "api", title: "API Gateway", sub: "REST · CORS", group: "edge", icon: Network, x: 0.38, y: 0.5,
    what: "A single REST entry point that routes every HTTP request to the right Lambda function.",
    why: "Decouples the frontend from compute — functions can change, scale or deploy independently behind one stable URL.",
    tech: ["API Gateway (REST)", "CORS enabled", "44 routed endpoints"] },
  { id: "auth", title: "Auth & RBAC", sub: "JWT · bcrypt", group: "compute", icon: ShieldCheck, x: 0.53, y: 0.18,
    what: "Sign-up, sign-in and session validation. Issues signed tokens and enforces role + tenant scoping on every call.",
    why: "Custom JWT keeps auth stateless and serverless-friendly; bcrypt hashes passwords; RBAC isolates each company's data.",
    tech: ["JWT (HS256)", "bcrypt", "Per-company scoping"] },
  { id: "services", title: "Domain Services", sub: "9 microservices · 44 fns", group: "compute", icon: Boxes, x: 0.53, y: 0.5,
    what: "Independent Lambdas grouped into 9 domains — campaigns, ranking, career, AI authoring, billing, jobs, analytics, admin and auth.",
    why: "Microservices-style domain decomposition: each domain deploys and scales on its own. Switch to the Microservices view to see them all and what they touch.",
    tech: ["9 domains", "44 single-purpose fns", "Independently scalable"] },
  { id: "s3", title: "S3 Buckets", sub: "Presigned uploads", group: "storage", icon: HardDrive, x: 0.53, y: 0.82,
    what: "Object storage for uploaded CVs. The browser uploads directly using a short-lived presigned URL.",
    why: "Direct-to-S3 upload keeps large files off the API and Lambdas. Two buckets feed the two pipelines (ranking + analysis).",
    tech: ["Presigned PUT URLs", "ObjectCreated events", "Resume + Analysis buckets"] },
  { id: "dlq", title: "Dead-Letter Queue", sub: "Failed messages", group: "messaging", icon: AlertTriangle, x: 0.66, y: 0.18,
    what: "A safety net that captures any message the worker fails to process after 3 attempts.",
    why: "Failures are isolated and kept for 14 days instead of vanishing — they can be inspected and replayed, so the pipeline is resilient.",
    tech: ["maxReceiveCount: 3", "14-day retention", "Monitored in admin console"] },
  { id: "queue", title: "SQS Queues", sub: "Resume · Analysis", group: "messaging", icon: Layers, x: 0.66, y: 0.82,
    what: "Durable message queues that buffer every upload event before it's processed.",
    why: "The queue is the heart of the event-driven design — it absorbs bursts, decouples upload from processing, and guarantees nothing is lost.",
    tech: ["Amazon SQS", "Visibility timeout + retries", "Triggers the worker"] },
  { id: "socket", title: "Socket.IO", sub: "Live updates", group: "realtime", icon: Radio, x: 0.79, y: 0.18,
    what: "A realtime channel that pushes results to the browser the instant the worker finishes.",
    why: "No polling — the recruiter's shortlist re-ranks live as each CV is scored, which makes the event-driven design visible to the user.",
    tech: ["Socket.IO", "Server-pushed events", "Secured emit"] },
  { id: "db", title: "DynamoDB", sub: "8 tables · GSIs", group: "storage", icon: Database, x: 0.79, y: 0.5,
    what: "The serverless database — companies, users, campaigns, candidates, transactions and CV history.",
    why: "Table-per-entity with global secondary indexes gives millisecond reads, e.g. a campaign's candidates pre-sorted by AI score.",
    tech: ["8 tables", "Global Secondary Indexes", "Pay-per-request"] },
  { id: "worker", title: "Worker Lambdas", sub: "Parse · Score", group: "compute", icon: Cpu, x: 0.79, y: 0.82,
    what: "SQS-triggered functions that extract text from the PDF, call the AI, and persist the result.",
    why: "Processing runs asynchronously off the queue, so the user gets an instant response while heavy work happens in the background.",
    tech: ["SQS-triggered", "PDF text extraction", "120s timeout"] },
  { id: "openai", title: "OpenAI", sub: "gpt-4o-mini", group: "ai", icon: Sparkles, x: 0.93, y: 0.82,
    what: "The AI model that scores CVs against criteria and generates candidate career reports.",
    why: "A provider abstraction (OpenAI / Gemini / offline mock) means the model can be swapped — or run fully offline — without touching the pipeline.",
    tech: ["gpt-4o-mini", "Provider abstraction", "Structured JSON output"] },
];

const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));

const EDGES: { from: string; to: string }[] = [
  { from: "users", to: "frontend" },
  { from: "frontend", to: "api" },
  { from: "api", to: "auth" },
  { from: "api", to: "services" },
  { from: "frontend", to: "s3" },
  { from: "auth", to: "db" },
  { from: "services", to: "db" },
  { from: "s3", to: "queue" },
  { from: "queue", to: "dlq" },
  { from: "queue", to: "worker" },
  { from: "worker", to: "openai" },
  { from: "worker", to: "db" },
  { from: "worker", to: "socket" },
  { from: "socket", to: "frontend" },
];

const TRACE: { to: string; edge: string; caption: string }[] = [
  { to: "frontend", edge: "users->frontend", caption: "A candidate opens the public apply link" },
  { to: "api", edge: "frontend->api", caption: "The app asks the API for a presigned upload URL" },
  { to: "services", edge: "api->services", caption: "A Lambda issues a short-lived S3 presigned URL" },
  { to: "s3", edge: "frontend->s3", caption: "The browser uploads the PDF straight to S3" },
  { to: "queue", edge: "s3->queue", caption: "S3 fires an ObjectCreated event onto the SQS queue" },
  { to: "worker", edge: "queue->worker", caption: "The queue triggers a Worker Lambda" },
  { to: "openai", edge: "worker->openai", caption: "The worker parses the CV and scores it with AI" },
  { to: "db", edge: "worker->db", caption: "The score & profile are written to DynamoDB" },
  { to: "socket", edge: "worker->socket", caption: "The worker emits the result over Socket.IO" },
  { to: "frontend", edge: "socket->frontend", caption: "The recruiter's shortlist re-ranks live" },
];

/* ── microservices (the Domain Services block, expanded) + what each touches ── */

const DEP_COLOR: Record<string, string> = {
  "API Gateway": "#8b5cf6",
  DynamoDB: "#06b6d4",
  S3: "#06b6d4",
  SQS: "#f59e0b",
  DLQ: "#f59e0b",
  OpenAI: "#ec4899",
  "Socket.IO": "#10b981",
  Stripe: "#3b82f6",
};

interface ServiceDef {
  name: string;
  icon: LucideIcon;
  color: string;
  fns: string;
  desc: string;
  deps: string[];
}

const SERVICES: ServiceDef[] = [
  { name: "Auth & Sessions", icon: ShieldCheck, color: "#8b5cf6", fns: "4 functions",
    desc: "Sign-up, sign-in, JWT sessions and role + tenant enforcement on every request.", deps: ["API Gateway", "DynamoDB"] },
  { name: "Campaigns", icon: Boxes, color: "#16a34a", fns: "6 functions",
    desc: "Create, edit, list and publish hiring campaigns with shareable public apply links.", deps: ["API Gateway", "DynamoDB"] },
  { name: "Ranking Pipeline", icon: Cpu, color: "#16a34a", fns: "3 functions",
    desc: "Presigns CV uploads, then scores & ranks each applicant asynchronously off the queue.", deps: ["S3", "SQS", "OpenAI", "DynamoDB", "Socket.IO"] },
  { name: "Career Intelligence", icon: Activity, color: "#ec4899", fns: "7 functions",
    desc: "Candidate CV analysis, version comparison and job-tailoring on a second pipeline.", deps: ["S3", "SQS", "OpenAI", "DynamoDB"] },
  { name: "AI Authoring", icon: Wand2, color: "#ec4899", fns: "1 function",
    desc: "Generates campaign titles, descriptions and weighted scoring criteria — entitlement-gated.", deps: ["OpenAI", "DynamoDB"] },
  { name: "Billing", icon: Coins, color: "#3b82f6", fns: "5 functions",
    desc: "Credit packs, Pro upgrades and idempotent fulfilment via Stripe or an offline mock.", deps: ["DynamoDB", "Stripe"] },
  { name: "Job Board", icon: Briefcase, color: "#16a34a", fns: "4 functions",
    desc: "Public job listings plus one-click candidate apply straight into the ranking pipeline.", deps: ["API Gateway", "DynamoDB"] },
  { name: "Analytics", icon: BarChart3, color: "#06b6d4", fns: "6 functions",
    desc: "Aggregate hiring insights — score distribution, age, university and city breakdowns.", deps: ["DynamoDB"] },
  { name: "Admin / Platform", icon: Building2, color: "#f59e0b", fns: "6 functions",
    desc: "Multi-tenant controls — tenants, credit grants, suspension, revenue and live infra metrics.", deps: ["DynamoDB", "SQS"] },
];

const WD = 1600;
const HD = 600;

/* ───────────────────────────── component ───────────────────────────── */

export function ArchitectureShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const [view, setView] = useState<"map" | "services">("map");
  const [selected, setSelected] = useState<string | null>("queue");
  const [hover, setHover] = useState<string | null>(null);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);

  // Re-measure whenever the canvas (re)mounts — e.g. after toggling back from
  // the Microservices view — so the diagram never keeps a stale width.
  useEffect(() => {
    if (view !== "map") return;
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setCw(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  useEffect(() => {
    if (!playing) return;
    if (step >= TRACE.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 2000);
    return () => clearTimeout(t);
  }, [playing, step]);

  const startTrace = useCallback(() => {
    setSelected(null);
    setStep(0);
    setPlaying(true);
  }, []);
  const resetTrace = useCallback(() => {
    setPlaying(false);
    setStep(-1);
  }, []);

  const tracing = step >= 0;
  const litEdges = new Set<string>();
  const litNodes = new Set<string>(["users"]);
  if (tracing) {
    for (let i = 0; i <= step; i++) {
      litEdges.add(TRACE[i].edge);
      litNodes.add(TRACE[i].to);
    }
  }
  const activeEdge = tracing ? TRACE[step].edge : null;

  const scale = cw > 0 ? Math.max(0.5, Math.min(1, cw / WD)) : 1;
  const stageH = HD * scale;
  const stageW = WD * scale;

  const px = (id: string) => {
    const n = NODE_BY_ID[id];
    return { x: n.x * WD, y: n.y * HD };
  };
  const pathFor = (from: string, to: string) => {
    const a = px(from);
    const b = px(to);
    const dx = (b.x - a.x) * 0.5;
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  };
  const isEdgeHot = (from: string, to: string) => {
    const key = `${from}->${to}`;
    if (tracing) return litEdges.has(key);
    if (hover) return from === hover || to === hover;
    return false;
  };

  // node that the info box should describe (hovered node, or current trace step)
  const popId = tracing ? TRACE[step].to : hover;
  const popNode = popId ? NODE_BY_ID[popId] : null;
  const popColor = popNode ? GROUPS[popNode.group].color : "#16a34a";

  const detail = selected ? NODE_BY_ID[selected] : null;

  return (
    <div className="w-full">
      {/* toolbar */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-lg border border-[#2a2a2a] bg-[#141414] p-0.5">
          <button
            onClick={() => setView("map")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${view === "map" ? "bg-[#16a34a] text-white" : "text-[#bbb] hover:text-white"}`}
          >
            <Network className="h-4 w-4" /> System Map
          </button>
          <button
            onClick={() => setView("services")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${view === "services" ? "bg-[#16a34a] text-white" : "text-[#bbb] hover:text-white"}`}
          >
            <GitBranch className="h-4 w-4" /> Microservices
          </button>
        </div>

        {view === "map" && (
          <div className="flex flex-wrap items-center gap-2">
            {!tracing ? (
              <button
                onClick={startTrace}
                className="inline-flex items-center gap-2 rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#16a34a]/25 transition-all hover:scale-[1.03] hover:bg-[#15803d]"
              >
                <Play className="h-4 w-4 fill-current" /> Trace a CV through the system
              </button>
            ) : (
              <>
                <button onClick={() => setPlaying((p) => !p)} className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]">
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                  {playing ? "Pause" : "Play"}
                </button>
                <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-white hover:bg-[#1c1c1c]">Prev</button>
                <button onClick={() => setStep((s) => Math.min(TRACE.length - 1, s + 1))} className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-white hover:bg-[#1c1c1c]">Next</button>
                <button onClick={resetTrace} className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-white hover:bg-[#1c1c1c]">
                  <RotateCcw className="h-4 w-4" /> Exit
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {view === "map" ? (
        <>
          {/* legend */}
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {(Object.keys(GROUPS) as GroupKey[]).map((g) => (
              <span key={g} className="inline-flex items-center gap-1.5 text-[11px] text-[#999]">
                <span className="h-2 w-2 rounded-full" style={{ background: GROUPS[g].color, boxShadow: `0 0 8px ${GROUPS[g].color}` }} />
                {GROUPS[g].label}
              </span>
            ))}
          </div>

          {/* canvas */}
          <div ref={stageRef} className="relative overflow-x-auto overflow-y-hidden rounded-2xl border border-[#1a1a1a] bg-[#080808]">
            <div className="relative mx-auto" style={{ width: stageW, height: stageH }}>
              <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(22,163,74,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="pointer-events-none absolute -left-10 top-1/3 h-64 w-64 rounded-full bg-[#16a34a]/10 blur-[90px]" />
              <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#10b981]/10 blur-[90px]" />

              <div className="absolute left-0 top-0" style={{ width: WD, height: HD, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                {/* pipeline annotation bracket */}
                <div className="pointer-events-none absolute" style={{ left: 0.5 * WD, top: 0.65 * HD, width: 0.45 * WD }}>
                  <div className="relative">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#16a34a]/40 to-transparent" />
                    <div className="absolute left-0 top-0 h-2 w-px bg-[#16a34a]/40" />
                    <div className="absolute right-0 top-0 h-2 w-px bg-[#16a34a]/40" />
                    <div className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#16a34a]/70">
                      Event-driven async pipeline
                    </div>
                  </div>
                </div>

                {/* edges */}
                <svg className="absolute inset-0" width={WD} height={HD}>
                  <defs>
                    <linearGradient id="flowHot" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity="0" />
                      <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                    </linearGradient>
                    <filter id="comet" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.2" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {EDGES.map((e) => {
                    const d = pathFor(e.from, e.to);
                    const hot = isEdgeHot(e.from, e.to);
                    return (
                      <g key={`${e.from}->${e.to}`}>
                        <path d={d} fill="none" stroke={hot ? "#16a34a" : "#1e1e1e"} strokeWidth={hot ? 2.2 : 1.5} strokeOpacity={hot ? 0.9 : 1} />
                        {hot ? (
                          <path d={d} fill="none" stroke="url(#flowHot)" strokeWidth={2.6} strokeDasharray="10 12">
                            <animate attributeName="stroke-dashoffset" from="44" to="0" dur="1s" repeatCount="indefinite" />
                          </path>
                        ) : (
                          <path d={d} fill="none" stroke="#16a34a" strokeWidth={1.5} strokeOpacity={0.32} strokeDasharray="2 14">
                            <animate attributeName="stroke-dashoffset" from="32" to="0" dur="2.6s" repeatCount="indefinite" />
                          </path>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* nodes */}
                {NODES.map((n) => {
                  const Icon = n.icon;
                  const color = GROUPS[n.group].color;
                  const p = px(n.id);
                  const dim = (tracing && !litNodes.has(n.id)) || (!tracing && hover !== null && hover !== n.id && !isNeighbor(hover, n.id));
                  const isStep = tracing && TRACE[step].to === n.id;
                  const isSel = !tracing && selected === n.id;
                  const lit = isStep || isSel || (!tracing && hover === n.id);
                  return (
                    <button
                      key={n.id}
                      onClick={() => !tracing && setSelected(n.id)}
                      onMouseEnter={() => setHover(n.id)}
                      onMouseLeave={() => setHover(null)}
                      className="absolute focus:outline-none"
                      style={{ left: p.x, top: p.y, transform: "translate(-50%,-50%)" }}
                    >
                      {isStep && (
                        <motion.span
                          className="absolute inset-0 rounded-2xl"
                          style={{ boxShadow: `0 0 0 2px ${color}` }}
                          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.06, 1] }}
                          transition={{ duration: 1.3, repeat: Infinity }}
                        />
                      )}
                      <motion.div
                        animate={{ scale: isStep ? 1.07 : lit ? 1.04 : 1, opacity: dim ? 0.3 : 1 }}
                        transition={{ duration: 0.25 }}
                        className="relative w-[124px] overflow-hidden rounded-2xl border bg-gradient-to-b from-[#161616] to-[#0d0d0d] px-3 pb-3 pt-3.5 text-center backdrop-blur"
                        style={{
                          borderColor: lit ? color : "#232323",
                          boxShadow: lit ? `0 0 0 1px ${color}66, 0 10px 34px ${color}33` : "0 6px 18px rgba(0,0,0,0.4)",
                        }}
                      >
                        <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                        <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${color}33, ${color}14)`, color, boxShadow: lit ? `0 0 14px ${color}55` : undefined }}>
                          <Icon className="h-[19px] w-[19px]" />
                        </span>
                        <div className="text-[12.5px] font-semibold leading-tight text-white">{n.title}</div>
                        <div className="mt-0.5 text-[9px] leading-tight text-[#8a8a8a]">{n.sub}</div>
                      </motion.div>
                    </button>
                  );
                })}

                {/* a CV document gliding through the pipeline during the trace */}
                {tracing && activeEdge && (() => {
                  const a = px(activeEdge.split("->")[0]);
                  const b = px(activeEdge.split("->")[1]);
                  return (
                    <motion.div
                      key={`doc-${step}`}
                      className="pointer-events-none absolute z-30"
                      style={{ transform: "translate(-50%,-50%)" }}
                      initial={{ left: a.x, top: a.y }}
                      animate={{ left: b.x, top: b.y }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    >
                      <div className="relative flex items-center justify-center">
                        <motion.span
                          className="absolute h-14 w-14 rounded-full bg-[#34d399]/25 blur-md"
                          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#16a34a] to-[#22c55e] text-white shadow-lg shadow-[#16a34a]/60 ring-2 ring-[#0a0a0a]">
                          <FileText className="h-5 w-5" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })()}
              </div>
            </div>

            {/* info box — fills the empty top-left; shows on hover or during the trace */}
            <AnimatePresence>
              {popNode && (
                <motion.div
                  key={popNode.id + (tracing ? `-s${step}` : "-h")}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute left-4 top-4 z-40 w-[300px] max-w-[46%]"
                >
                  <div className="rounded-xl border bg-[#0b0b0b]/95 p-4 shadow-2xl backdrop-blur" style={{ borderColor: `${popColor}66` }}>
                    {tracing && (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: popColor }}>
                          Step {step + 1} of {TRACE.length}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: `${popColor}1f`, color: popColor }}>
                          <span className="h-1 w-1 rounded-full" style={{ background: popColor }} /> live
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${popColor}1f`, color: popColor }}>
                        <popNode.icon className="h-[18px] w-[18px]" />
                      </span>
                      <div>
                        <div className="text-sm font-bold leading-tight text-white">{popNode.title}</div>
                        <div className="text-[10px] text-[#888]">{popNode.sub}</div>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#cbcbcb]">
                      {tracing ? TRACE[step].caption : popNode.what}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* meta chips */}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-[#777]">
            <span><b className="text-[#cfcfcf]">11</b> core components</span>
            <span><b className="text-[#cfcfcf]">2</b> event-driven pipelines</span>
            <span><b className="text-[#cfcfcf]">44</b> Lambda functions</span>
            <span><b className="text-[#cfcfcf]">8</b> DynamoDB tables</span>
            <span><b className="text-[#cfcfcf]">DLQ</b> resilience</span>
          </div>

          {/* detail panel (click) */}
          <div className="mt-4">
            {detail ? (
              <DetailPanel node={detail} onClose={() => setSelected(null)} />
            ) : (
              <div className="rounded-2xl border border-[#1a1a1a] bg-[#0c0c0c] p-5 text-center text-sm text-[#999]">
                Hover a component for a quick description, click it for full detail — or hit{" "}
                <span className="font-semibold text-white">Trace a CV</span> to watch a résumé flow through the whole event-driven pipeline.
              </div>
            )}
          </div>
        </>
      ) : (
        <ServicesView />
      )}
    </div>
  );
}

function isNeighbor(a: string, b: string) {
  return EDGES.some((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

/* ───────────────────────────── microservices view ───────────────────────────── */

function ServicesView() {
  return (
    <div>
      <p className="mb-4 max-w-3xl text-sm text-[#999]">
        The <span className="font-semibold text-white">Domain Services</span> block decomposes into nine independent
        microservices. Each owns one domain and only talks to the infrastructure it needs — tap a dependency tag to see the colour-coded interactions.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="group relative overflow-hidden rounded-2xl border border-[#1c1c1c] bg-gradient-to-b from-[#141414] to-[#0c0c0c] p-5 transition-colors hover:border-[#2c2c2c]"
          >
            <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${s.color}33, ${s.color}12)`, color: s.color }}>
                <s.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full border border-[#262626] bg-[#101010] px-2.5 py-0.5 text-[10px] font-semibold text-[#999]">{s.fns}</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-white">{s.name}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#999]">{s.desc}</p>
            <div className="mt-4">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#666]">Interacts with</div>
              <div className="flex flex-wrap gap-1.5">
                {s.deps.map((d) => {
                  const c = DEP_COLOR[d] ?? "#888";
                  return (
                    <span key={d} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium" style={{ borderColor: `${c}55`, background: `${c}12`, color: c }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* dependency legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[#1a1a1a] bg-[#0c0c0c] p-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#777]">Shared infrastructure</span>
        {Object.entries(DEP_COLOR).map(([k, c]) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-[11px] text-[#bbb]">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── detail panel ───────────────────────────── */

function DetailPanel({ node, onClose }: { node: NodeDef; onClose: () => void }) {
  const color = GROUPS[node.group].color;
  const Icon = node.icon;
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-[#1a1a1a] bg-[#0c0c0c] p-5"
    >
      <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1 text-[#777] hover:text-white">
        <X className="h-4 w-4" />
      </button>
      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${color}1f`, color }}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color }}>
                {GROUPS[node.group].label}
              </span>
              <h3 className="text-lg font-bold leading-tight text-white">{node.title}</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#cfcfcf]">{node.what}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#1c1c1c] bg-[#111] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#16a34a]">Why it&apos;s here</div>
            <p className="mt-1 text-sm leading-relaxed text-[#aaa]">{node.why}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {node.tech.map((t) => (
              <span key={t} className="rounded-full border border-[#262626] bg-[#141414] px-2.5 py-1 text-[11px] text-[#cfcfcf]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
