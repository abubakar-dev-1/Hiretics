"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Menu,
  X,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  FileText,
  Activity,
  BrainCircuit,
  Compass,
  Scissors,
  GitCompareArrows,
  LayoutDashboard,
  Wand2,
  Radio,
  Boxes,
  Database,
  Cloud,
  ArrowRight,
  Users,
  Briefcase,
  Coins,
  Clock,
  FileStack,
  TrendingUp,
  Lock,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { CompareSlider } from "./CompareSlider";
import { DepthField } from "./DepthField";

// Auth/pricing CTAs point at the main app (set NEXT_PUBLIC_APP_URL on Vercel);
// the /architecture and /product-tour showcase routes live in this project.
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
const SIGNIN_URL = APP_URL ? APP_URL + "/signin" : "#";
const SIGNUP_URL = APP_URL ? APP_URL + "/signup" : "#";
const PRICING_URL = APP_URL ? APP_URL + "/pricing" : "#";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#platform", label: "Platform" },
    { href: "#candidates", label: "For Candidates" },
    { href: "/architecture", label: "Architecture" },
    { href: "/product-tour", label: "Live Demo" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-300 scroll-smooth">
      {/* ───────────────────────── Navbar ───────────────────────── */}
      <nav className="w-full border-b border-[#F0F0F0] dark:border-[#1c1c1c] bg-white/80 dark:bg-[#080808]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Hiretics" width={100} height={100} />
            </div>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] hover:text-[#080808] dark:hover:text-white transition-colors rounded-md"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-[#5A5A5A] dark:text-[#D8D8D8] hover:bg-[#F0F0F0] dark:hover:bg-[#1c1c1c] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Link
                href={SIGNIN_URL}
                className="px-4 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] hover:text-[#080808] dark:hover:text-white transition-colors"
              >
                Log in
              </Link>

              <Link
                href={SIGNUP_URL}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-lg transition-colors shadow-sm shadow-[#16A34A]/30"
              >
                Try for free
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-[#5A5A5A] dark:text-[#D8D8D8] hover:bg-[#F0F0F0] dark:hover:bg-[#1c1c1c] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#5A5A5A] dark:text-[#D8D8D8] hover:bg-[#F0F0F0] dark:hover:bg-[#1c1c1c] transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#F0F0F0] dark:border-[#1c1c1c] bg-white dark:bg-[#080808] pb-4">
            <div className="px-4 pt-3 space-y-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] rounded-md"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-3 border-t border-[#F0F0F0] dark:border-[#1c1c1c] space-y-2 px-3">
                <Link
                  href={SIGNIN_URL}
                  className="block w-full text-center py-2.5 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] border border-[#D8D8D8] dark:border-[#2D2D2D] rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  href={SIGNUP_URL}
                  className="block w-full text-center py-2.5 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-lg"
                >
                  Try for free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        {/* soft glow behind the molecule field */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[500px] opacity-60 dark:opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(22,163,74,0.16), transparent 70%)",
          }}
        />

        {/* animated 3D molecule field — local cursor interaction */}
        <DepthField className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* fade the field into the page toward the bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white dark:to-[#080808]"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 lg:pt-24 lg:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] dark:border-[#2D2D2D] bg-white/60 dark:bg-[#111]/60 backdrop-blur px-4 py-1.5 text-xs font-medium"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[#5A5A5A] dark:text-[#D8D8D8]">
              Event-driven · AI-powered · Real-time
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-6 mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-tight text-[#080808] dark:text-white leading-[1.05]"
          >
            One AI platform for{" "}
            <span className="text-[#16A34A]">both sides</span> of the hiring table.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-[#666666] dark:text-[#999] leading-relaxed"
          >
            Recruiters rank thousands of CVs in seconds with explainable AI. Candidates get a
            full career-intelligence report and apply in one click. All powered by a{" "}
            <span className="font-semibold text-[#080808] dark:text-white">
              real-time, event-driven serverless pipeline
            </span>
            .
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href={SIGNUP_URL}
              className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-lg transition-all hover:scale-105 shadow-lg shadow-[#16A34A]/25"
            >
              Try for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#showcase"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#080808] dark:text-white border border-[#D8D8D8] dark:border-[#2D2D2D] rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#1c1c1c] transition-all hover:scale-105"
            >
              See it in action
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#666666] dark:text-[#999]"
          >
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#16A34A]" /> PDF & DOCX supported
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#16A34A]" /> Live scoring in seconds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" /> Multi-tenant & secure
            </span>
          </motion.div>

          {/* Hero preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-14 lg:mt-20 relative"
          >
            <div
              aria-hidden
              className="absolute -inset-x-8 -inset-y-8 -z-10 blur-3xl opacity-30 dark:opacity-25"
              style={{
                background:
                  "linear-gradient(120deg, rgba(22,163,74,0.4), rgba(16,185,129,0.2), rgba(22,163,74,0.4))",
              }}
            />
            <div className="relative mx-auto rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#1c1c1c] shadow-2xl">
              <Image
                src="/hero.png"
                alt="Hiretics Platform Dashboard"
                width={1200}
                height={700}
                className="w-full h-auto"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Stats bar ───────────────────────── */}
      <section className="border-y border-[#F0F0F0] dark:border-[#1c1c1c] bg-[#FAFAFA] dark:bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "99.7%", label: "Ranking accuracy" },
              { value: "<60s", label: "CV-to-score time" },
              { value: "2", label: "Real-time AI pipelines" },
              { value: "4", label: "Role-based access tiers" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="text-3xl sm:text-4xl font-bold text-[#16A34A]">{s.value}</div>
                <div className="mt-1 text-sm text-[#666666] dark:text-[#999]">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Product showcase (image) ───────────────────────── */}
      <section id="showcase" className="bg-white dark:bg-[#080808] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] dark:border-[#2D2D2D] px-3 py-1 text-xs font-medium text-[#5A5A5A] dark:text-[#D8D8D8] mb-4">
              <Sparkles className="h-3 w-3 text-[#16A34A]" /> Product tour
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#080808] dark:text-white leading-tight">
              See Hiretics in action
            </h2>
            <p className="mt-4 text-base text-[#666666] dark:text-[#999] leading-relaxed">
              A CV travels through the live pipeline — uploaded, queued, scored by AI, and ranked on
              screen in real time — then the candidate gets their own career report.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-12 relative"
          >
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 blur-3xl opacity-25"
              style={{
                background:
                  "linear-gradient(120deg, rgba(22,163,74,0.5), rgba(16,185,129,0.25))",
              }}
            />
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#1c1c1c] shadow-2xl">
              <Image
                src="/demo.png"
                alt="Hiretics live ranking preview"
                width={1200}
                height={700}
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Before / After comparison ───────────────────────── */}
      <section className="bg-[#FAFAFA] dark:bg-[#0b0b0b] border-y border-[#F0F0F0] dark:border-[#1c1c1c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#16A34A]">
              Manual screening vs Hiretics
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#080808] dark:text-white leading-tight">
              Drag to see the difference
            </h2>
            <p className="mt-4 text-base text-[#666666] dark:text-[#999]">
              The same pile of applicants — one read by hand, one ranked by AI in seconds. Slide the
              divider to compare.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            {/* labels */}
            <div className="mb-3 flex items-center justify-between text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F0F0] dark:bg-[#1c1c1c] px-3 py-1 text-[#666666] dark:text-[#999]">
                <Clock className="h-3.5 w-3.5" /> Without Hiretics
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-3 py-1 text-[#16A34A]">
                <Zap className="h-3.5 w-3.5" /> With Hiretics
              </span>
            </div>

            <CompareSlider before={<CompareBefore />} after={<CompareAfter />} />
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Two-sided Platform ───────────────────────── */}
      <section id="platform" className="bg-[#FAFAFA] dark:bg-[#0b0b0b] border-y border-[#F0F0F0] dark:border-[#1c1c1c] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-[#080808] dark:text-white leading-[1.1]">
              Built for everyone in the loop
            </h2>
            <p className="mt-4 text-base text-[#666666] dark:text-[#999]">
              One system, three experiences — recruiters, candidates, and the platform owners who
              run it all.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recruiters */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-[#E5E5E5] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] p-8"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#16A34A]/10">
                <Briefcase className="h-5 w-5 text-[#16A34A]" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#080808] dark:text-white">For Recruiters</h3>
              <p className="mt-2 text-sm text-[#666666] dark:text-[#999] leading-relaxed">
                Launch a campaign, let AI write it, and watch candidates rank themselves the moment
                they apply.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "AI-authored job titles, descriptions & scoring criteria",
                  "Custom-weighted, explainable CV ranking",
                  "Live shortlist that re-ranks in real time as CVs arrive",
                  "Public job board + private campaign links",
                  "Analytics: age, university & city insights",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#16A34A] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#080808] dark:text-[#D8D8D8]">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Candidates */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl border border-[#E5E5E5] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] p-8"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#16A34A]/10">
                <Users className="h-5 w-5 text-[#16A34A]" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#080808] dark:text-white">For Candidates</h3>
              <p className="mt-2 text-sm text-[#666666] dark:text-[#999] leading-relaxed">
                Upload your résumé once and get an AI career coach — then tailor and apply to live
                roles in a click.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Career report: skill decay, automation exposure & pivot paths",
                  "Line-level CV surgery and a 30-60-90 action plan",
                  "Re-upload to track progress with an AI coach",
                  "Browse the public job board and tailor your CV per role",
                  "One-click apply — straight into the recruiter's pipeline",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#16A34A] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#080808] dark:text-[#D8D8D8]">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Platform owner strip */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 rounded-2xl border border-[#E5E5E5] dark:border-[#1c1c1c] bg-gradient-to-br from-[#16A34A] to-[#0f7a37] p-8 text-white"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
              <div className="max-w-xl">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold">For Platform Owners</h3>
                <p className="mt-2 text-sm text-white/85 leading-relaxed">
                  A super-admin console with live queue & dead-letter monitoring, multi-tenant
                  controls, credit grants, tenant suspension, and revenue — the whole event-driven
                  system at a glance.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 shrink-0">
                {[
                  { k: "SQS depth", v: "Live" },
                  { k: "DLQ alerts", v: "Live" },
                  { k: "Tenants", v: "Managed" },
                  { k: "Revenue", v: "Tracked" },
                ].map((x) => (
                  <div key={x.k} className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                    <div className="text-lg font-bold">{x.v}</div>
                    <div className="text-xs text-white/80">{x.k}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Recruiter showcase ───────────────────────── */}
      <section id="recruiters" className="bg-white dark:bg-[#080808] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-[#16A34A]">
                Recruiter workspace
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#080808] dark:text-white leading-tight">
                Launch campaigns in minutes — let the AI do the typing
              </h2>
              <p className="mt-4 text-base text-[#666666] dark:text-[#999] leading-relaxed max-w-md">
                Click ✨ Generate and Hiretics drafts the title, description, and weighted scoring
                criteria for you. Tweak the weights, publish to the job board, and every applicant
                is scored and ranked the instant their CV lands.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Wand2, t: "AI campaign authoring", d: "Title, description & criteria drafted in one click." },
                  { icon: Radio, t: "Real-time ranking", d: "Socket-powered shortlist updates live as CVs are scored." },
                  { icon: Activity, t: "Hiring analytics", d: "Diversity, education and location insights on Pro." },
                ].map((x) => (
                  <div key={x.t} className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#16A34A]/10 shrink-0">
                      <x.icon className="h-4 w-4 text-[#16A34A]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#080808] dark:text-white">{x.t}</div>
                      <div className="text-sm text-[#666666] dark:text-[#999]">{x.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={SIGNUP_URL}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-lg transition-all"
              >
                Start hiring <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="rounded-xl overflow-hidden border border-[#E5E5E5] dark:border-[#1c1c1c] shadow-xl"
            >
              <Image
                src="/campaign.png"
                alt="Create Campaign Interface"
                width={600}
                height={600}
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Candidate showcase ───────────────────────── */}
      <section id="candidates" className="bg-[#FAFAFA] dark:bg-[#0b0b0b] border-y border-[#F0F0F0] dark:border-[#1c1c1c] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#16A34A]">
              Career intelligence
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold text-[#080808] dark:text-white leading-[1.1]">
              Not just an analyzer — a career coach that follows you
            </h2>
            <p className="mt-4 text-base text-[#666666] dark:text-[#999]">
              From the first résumé you upload to the third revision six months later — every
              signal, every edit, every step of follow-through, in one place.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              { icon: Activity, t: "Skill Decay Radar", d: "See which of your skills are aging and which are accelerating against live market signals." },
              { icon: BrainCircuit, t: "Automation Exposure", d: "Per-responsibility AI-disruption scores — not a vague risk percentage." },
              { icon: Compass, t: "Pivot Path Engine", d: "Personalized career trajectories with fit scores, growth outlook and timelines." },
              { icon: Scissors, t: "CV Surgery", d: "Line-level edits to your résumé, sorted by impact — quantify, drop, rewrite." },
              { icon: GitCompareArrows, t: "Progress Coach", d: "Re-upload a revised CV and an AI coach grades your follow-through over time." },
              { icon: Sparkles, t: "Tailor & Apply", d: "Tailor your CV to any public role and apply in one click — into the recruiter's pipeline." },
            ].map((f, idx) => (
              <motion.div
                key={f.t}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
                className="group relative overflow-hidden rounded-2xl border border-[#E5E5E5] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] p-6 transition-all hover:border-[#16A34A]/40 hover:shadow-lg"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#16A34A]/10">
                  <f.icon className="h-5 w-5 text-[#16A34A]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#080808] dark:text-white">{f.t}</h3>
                <p className="mt-2 text-sm text-[#666666] dark:text-[#999] leading-relaxed">{f.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Architecture (the thesis) ───────────────────────── */}
      <section id="architecture" className="relative bg-[#080808] text-white scroll-mt-16 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(22,163,74,0.25), transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-[#D8D8D8] mb-4">
              <Boxes className="h-3.5 w-3.5 text-[#16A34A]" /> Under the hood
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold leading-[1.1]">
              An <span className="text-[#16A34A]">event-driven</span> serverless engine
            </h2>
            <p className="mt-4 text-base text-[#999]">
              Every upload flows through a decoupled, queue-based pipeline with microservices-style
              domain decomposition — resilient, scalable, and observable end to end.
            </p>
          </motion.div>

          {/* pipeline flow */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-14 flex flex-wrap items-stretch justify-center gap-3"
          >
            {[
              { icon: FileText, t: "Presigned upload", s: "to object storage" },
              { icon: Radio, t: "Event fires", s: "ObjectCreated" },
              { icon: Boxes, t: "Queue", s: "buffered & durable" },
              { icon: BrainCircuit, t: "Worker + AI", s: "parse & score" },
              { icon: Database, t: "Persist", s: "ranked results" },
              { icon: Zap, t: "Socket push", s: "live to UI" },
            ].map((step, idx, arr) => (
              <motion.div key={step.t} variants={fadeUp} transition={{ duration: 0.4 }} className="flex items-center">
                <div className="w-36 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur">
                  <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#16A34A]/15">
                    <step.icon className="h-5 w-5 text-[#16A34A]" />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{step.t}</div>
                  <div className="text-xs text-[#888]">{step.s}</div>
                </div>
                {idx < arr.length - 1 && (
                  <ArrowRight className="mx-1 h-5 w-5 text-[#16A34A]/60 hidden sm:block" />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* failed messages note + tech pills */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {[
              { icon: ShieldCheck, t: "Dead-letter safety", d: "Failed jobs land in a DLQ instead of vanishing — retried and monitored." },
              { icon: Boxes, t: "Domain decomposition", d: "Auth, campaigns, ranking, career, billing & admin as independent functions." },
              { icon: Cloud, t: "Cloud-portable", d: "Built on serverless primitives — S3, SQS, Lambda, DynamoDB, API Gateway." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <x.icon className="h-5 w-5 text-[#16A34A]" />
                <h3 className="mt-3 text-base font-semibold">{x.t}</h3>
                <p className="mt-1.5 text-sm text-[#999] leading-relaxed">{x.d}</p>
              </div>
            ))}
          </motion.div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {["Serverless Framework", "S3", "SQS + DLQ", "Lambda", "DynamoDB", "API Gateway", "Socket.IO", "JWT + RBAC"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[#D8D8D8]"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/architecture"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-[#15803d]"
            >
              Explore the interactive architecture
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/product-tour"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-white/5"
            >
              Take the live product tour
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────── How it works ───────────────────────── */}
      <section className="bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#080808] dark:text-white">
              Up and running in three steps
            </h2>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { n: "01", t: "Create a campaign", d: "Describe the role or let AI write it, set your scoring weights, and publish." },
              { n: "02", t: "Collect & auto-rank", d: "Candidates apply via your link or the job board; every CV is scored live." },
              { n: "03", t: "Hire the top 1%", d: "Review the ranked shortlist with explainable scores and analytics, then decide." },
            ].map((s) => (
              <motion.div key={s.n} variants={fadeUp} transition={{ duration: 0.5 }} className="relative">
                <div className="text-5xl font-bold text-[#16A34A]/20">{s.n}</div>
                <h3 className="mt-2 text-lg font-semibold text-[#080808] dark:text-white">{s.t}</h3>
                <p className="mt-2 text-sm text-[#666666] dark:text-[#999] leading-relaxed">{s.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Pricing ───────────────────────── */}
      <section id="pricing" className="bg-[#FAFAFA] dark:bg-[#0b0b0b] border-y border-[#F0F0F0] dark:border-[#1c1c1c] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#080808] dark:text-white">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-base text-[#666666] dark:text-[#999] max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
          >
            {/* Free */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="border border-[#E5E5E5] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] rounded-xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-[#080808] dark:text-white">Free</h3>
              <div className="mt-4 mb-2">
                <span className="text-5xl font-bold text-[#080808] dark:text-white">$0</span>
                <span className="text-[#666666] dark:text-[#999] ml-2">forever</span>
              </div>
              <p className="text-sm text-[#666666] dark:text-[#999] mb-6">
                Get started with AI-powered hiring for small teams
              </p>
              <div className="flex-1">
                <p className="font-semibold text-[#080808] dark:text-white text-sm mb-3">What&apos;s included:</p>
                <ul className="space-y-3">
                  {["AI-powered CV ranking", "3 AI authoring generations", "Candidate career reports", "Public job board access", "Candidate management & favourites"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#16A34A] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#080808] dark:text-[#D8D8D8]">{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold text-[#080808] dark:text-white text-sm mb-3 mt-6">Limitations:</p>
                <ul className="space-y-3">
                  {["No advanced analytics", "AI authoring capped at 3"].map((l) => (
                    <li key={l} className="flex items-start gap-2">
                      <X className="h-4 w-4 text-[#999] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#666666] dark:text-[#999]">{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href={SIGNUP_URL}
                  className="block w-full text-center py-3 text-sm font-medium border border-[#16A34A] text-[#16A34A] rounded-lg hover:bg-[#16A34A]/10 transition-colors"
                >
                  Get started free
                </Link>
              </div>
            </motion.div>

            {/* Pro */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="relative border-2 border-[#16A34A] bg-white dark:bg-[#0f0f0f] rounded-xl p-8 flex flex-col ring-2 ring-[#16A34A]/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-[#16A34A] text-white px-4 py-1.5 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#080808] dark:text-white">Pro</h3>
              <div className="mt-4 mb-2">
                <span className="text-5xl font-bold text-[#080808] dark:text-white">$9</span>
                <span className="text-[#666666] dark:text-[#999] ml-2">per month</span>
              </div>
              <p className="text-sm text-[#666666] dark:text-[#999] mb-6">
                Unlimited AI authoring and full analytics for growing teams
              </p>
              <div className="flex-1">
                <p className="font-semibold text-[#080808] dark:text-white text-sm mb-3">Everything in Free, plus:</p>
                <ul className="space-y-3">
                  {["Unlimited active campaigns", "Unlimited AI campaign authoring", "Full analytics dashboard", "Age, university & city insights", "Priority CV processing"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#16A34A] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#080808] dark:text-[#D8D8D8]">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href={PRICING_URL}
                  className="block w-full text-center py-3 text-sm font-semibold bg-[#16A34A] hover:bg-[#15803d] text-white rounded-lg transition-colors"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Credit packs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mt-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#080808] dark:text-white">Pay-as-you-go credits</h3>
              <p className="mt-2 text-sm text-[#666666] dark:text-[#999]">
                Each CV scored by the AI ranking pipeline costs{" "}
                <span className="font-semibold text-[#080808] dark:text-white">1 credit</span>. Top up
                anytime — credits never expire.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { name: "Starter Pack", credits: 50, price: "$19", per: "$0.38 / CV" },
                { name: "Growth Pack", credits: 200, price: "$59", per: "$0.30 / CV", popular: true },
                { name: "Scale Pack", credits: 500, price: "$129", per: "$0.26 / CV" },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`relative rounded-xl border bg-white dark:bg-[#0f0f0f] p-6 flex flex-col text-center ${
                    p.popular ? "border-[#16A34A] ring-1 ring-[#16A34A]/20" : "border-[#E5E5E5] dark:border-[#1c1c1c]"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#16A34A] text-white px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                      Best value
                    </span>
                  )}
                  <div className="text-sm font-semibold text-[#080808] dark:text-white">{p.name}</div>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[#16A34A]">
                    <Coins className="h-5 w-5" />
                    <span className="text-2xl font-bold">{p.credits}</span>
                    <span className="text-sm text-[#666666] dark:text-[#999]">credits</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-[#080808] dark:text-white">{p.price}</div>
                  <div className="mt-1 text-xs text-[#666666] dark:text-[#999]">{p.per}</div>
                  <Link
                    href={PRICING_URL}
                    className={`mt-6 block w-full text-center py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      p.popular
                        ? "bg-[#16A34A] hover:bg-[#15803d] text-white"
                        : "border border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A]/10"
                    }`}
                  >
                    Buy credits
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Footer ───────────────────────── */}
      <footer className="bg-[#080808] text-white">
        <div className="border-b border-[#1a1a1a]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">Ready to hire smarter?</h2>
              <p className="mt-3 text-[#999] text-base max-w-md">
                Join the teams and candidates already using Hiretics to make hiring intelligent on
                both sides.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={SIGNUP_URL}
                className="px-6 py-3 text-sm font-semibold text-[#080808] bg-white hover:bg-[#F0F0F0] rounded-lg transition-colors hover:scale-105"
              >
                Get started free
              </Link>
              <a
                href="#video"
                className="px-6 py-3 text-sm font-medium text-[#999] border border-[#333] hover:border-[#555] rounded-lg transition-colors hover:scale-105"
              >
                Watch demo
              </a>
            </div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Image src="/logo.png" alt="Hiretics" width={100} height={100} className="brightness-0 invert" />
              <p className="mt-4 text-sm text-[#888] leading-relaxed max-w-xs">
                AI-powered hiring for both sides of the table — built on an event-driven serverless
                architecture.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <a href="#" className="w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#888]">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#888]">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#888]">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#recruiters" className="text-sm text-[#888] hover:text-white transition-colors">For Recruiters</a></li>
                <li><a href="#candidates" className="text-sm text-[#888] hover:text-white transition-colors">For Candidates</a></li>
                <li><a href="#architecture" className="text-sm text-[#888] hover:text-white transition-colors">Architecture</a></li>
                <li><a href="#pricing" className="text-sm text-[#888] hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Solutions</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">For Startups</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">For Enterprise</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">For Job Seekers</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">For HR Teams</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#video" className="text-sm text-[#888] hover:text-white transition-colors">Product Tour</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#666]">&copy; {new Date().getFullYear()} Hiretics. All rights reserved.</p>
            <p className="text-xs text-[#666]">Made with precision for modern hiring teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───────── Compare slider panels — rich content on BOTH sides for a clean wipe ───────── */

const CANDIDATES = [
  { name: "Aisha Khan", role: "Senior Frontend Engineer", meta: "London · 7y", score: 94 },
  { name: "Daniel Ortega", role: "Full-stack Developer", meta: "Berlin · 5y", score: 88 },
  { name: "Mei Lin", role: "React Engineer", meta: "Singapore · 4y", score: 81 },
  { name: "Tom Becker", role: "Frontend Developer", meta: "Austin · 3y", score: 76 },
  { name: "Sara Ahmed", role: "UI Engineer", meta: "Dubai · 4y", score: 70 },
];

const initials = (n: string) =>
  n.split(" ").map((p) => p[0]).join("").slice(0, 2);

function scoreBadge(s: number) {
  if (s >= 85) return "bg-[#16A34A] text-white";
  if (s >= 75) return "bg-[#16A34A]/15 text-[#16A34A]";
  return "bg-[#EFEFEF] dark:bg-[#1c1c1c] text-[#666666] dark:text-[#999]";
}

function ShortlistPanel({ variant }: { variant: "before" | "after" }) {
  const after = variant === "after";
  return (
    <div className="flex h-[480px] w-full flex-col bg-white dark:bg-[#0f0f0f]">
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-[#F0F0F0] dark:border-[#1c1c1c] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ddd] dark:bg-[#2a2a2a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ddd] dark:bg-[#2a2a2a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ddd] dark:bg-[#2a2a2a]" />
        </div>
        <span className="ml-2 text-[11px] text-[#999]">hiretics.app / campaign / frontend-eng</span>
      </div>

      {/* header band */}
      <div className="flex items-center gap-3 px-5 pt-5">
        <div
          className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${
            after ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#F0F0F0] dark:bg-[#1c1c1c] text-[#999]"
          }`}
        >
          {after ? <Star className="h-5 w-5" /> : <FileStack className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-[#080808] dark:text-white">Candidate Shortlist</div>
          <div className="text-xs text-[#666666] dark:text-[#999]">
            Senior Frontend Engineer · 47 applicants
          </div>
        </div>
        {after ? (
          <ScoreRing score={94} />
        ) : (
          <div className="flex flex-none flex-col items-end">
            <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-500">
              <Clock className="h-4 w-4" /> ~6h
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#999]">by hand</span>
          </div>
        )}
      </div>

      <div className="mx-5 my-4 h-px bg-[#F0F0F0] dark:bg-[#1c1c1c]" />

      {/* candidate rows */}
      <div className="flex-1 space-y-2 px-5">
        {CANDIDATES.map((c, i) => (
          <div
            key={c.name}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
              after && i === 0
                ? "border-[#16A34A]/40 bg-[#16A34A]/[0.06]"
                : "border-[#F0F0F0] dark:border-[#1c1c1c]"
            } ${after ? "" : "opacity-90"}`}
          >
            <span
              className={`flex h-9 w-9 flex-none items-center justify-center rounded-full text-xs font-bold ${
                after ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#EFEFEF] dark:bg-[#1c1c1c] text-[#999]"
              }`}
            >
              {after ? initials(c.name) : <span className="text-base">?</span>}
            </span>
            <div className="min-w-0 flex-1">
              {after ? (
                <>
                  <div className="truncate text-sm font-semibold text-[#080808] dark:text-white">
                    {c.name}
                  </div>
                  <div className="truncate text-xs text-[#666666] dark:text-[#999]">
                    {c.role} · {c.meta}
                  </div>
                </>
              ) : (
                <>
                  <div className="h-2.5 w-32 rounded bg-[#E8E8E8] dark:bg-[#222]" />
                  <div className="mt-1.5 h-2 w-24 rounded bg-[#F1F1F1] dark:bg-[#1a1a1a]" />
                </>
              )}
            </div>
            {after ? (
              <span className="flex items-center gap-2">
                <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-[#999] sm:block">
                  #{i + 1}
                </span>
                <span
                  className={`flex h-7 min-w-9 items-center justify-center rounded-md px-2 text-xs font-bold ${scoreBadge(
                    c.score,
                  )}`}
                >
                  {c.score}
                </span>
              </span>
            ) : (
              <span className="flex h-7 items-center justify-center rounded-md bg-[#F3F3F3] dark:bg-[#1c1c1c] px-2.5 text-[11px] font-medium text-[#aaa] dark:text-[#555]">
                unscored
              </span>
            )}
          </div>
        ))}
      </div>

      {/* footer note */}
      <div className="px-5 pb-5 pt-4">
        {after ? (
          <div className="flex items-start gap-2 rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/[0.06] p-3">
            <TrendingUp className="mt-0.5 h-4 w-4 flex-none text-[#16A34A]" />
            <p className="text-xs leading-snug text-[#080808] dark:text-[#D8D8D8]">
              <span className="font-semibold text-[#16A34A]">Ranked in 8s.</span> Top match 94% —
              skills, seniority &amp; experience scored against your criteria.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-[#F0F0F0] dark:border-[#1c1c1c] bg-[#FAFAFA] dark:bg-[#141414] p-3">
            <Lock className="mt-0.5 h-4 w-4 flex-none text-[#999]" />
            <p className="text-xs leading-snug text-[#666666] dark:text-[#999]">
              <span className="font-semibold text-[#080808] dark:text-white">No ranking.</span>{" "}
              Every CV read by hand — no scores, no insights, hours of work.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-12 w-12 flex-none">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={radius} fill="none" strokeWidth="4" className="stroke-[#EAEAEA] dark:stroke-[#222]" />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          stroke="#16A34A"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#16A34A]">
        {score}
      </div>
    </div>
  );
}

function CompareBefore() {
  return <ShortlistPanel variant="before" />;
}
function CompareAfter() {
  return <ShortlistPanel variant="after" />;
}
