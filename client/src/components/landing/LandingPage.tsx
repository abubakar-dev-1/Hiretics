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
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
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
      staggerChildren: 0.12,
    },
  },
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-300 scroll-smooth">
      {/* Navbar */}
      <nav className="w-full border-b border-[#F0F0F0] dark:border-[#2D2D2D] bg-white dark:bg-[#080808] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Hiretics"
                width={100}
                height={100}
                className=""
              />
            
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              <a
                href="#features"
                className="px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] hover:text-[#080808] dark:hover:text-white transition-colors rounded-md"
              >
                Features
              </a>
              <a
                href="#platform"
                className="px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] hover:text-[#080808] dark:hover:text-white transition-colors rounded-md"
              >
                Platform
              </a>
              <a
                href="#demo"
                className="px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] hover:text-[#080808] dark:hover:text-white transition-colors rounded-md"
              >
                Demo
              </a>
              <a
                href="#pricing"
                className="px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] hover:text-[#080808] dark:hover:text-white transition-colors rounded-md"
              >
                Pricing
              </a>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-[#5A5A5A] dark:text-[#D8D8D8] hover:bg-[#F0F0F0] dark:hover:bg-[#2D2D2D] transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] hover:text-[#080808] dark:hover:text-white transition-colors"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-lg transition-colors"
              >
                Try for free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-[#5A5A5A] dark:text-[#D8D8D8] hover:bg-[#F0F0F0] dark:hover:bg-[#2D2D2D] transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#5A5A5A] dark:text-[#D8D8D8] hover:bg-[#F0F0F0] dark:hover:bg-[#2D2D2D] transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#F0F0F0] dark:border-[#2D2D2D] bg-white dark:bg-[#080808] pb-4">
            <div className="px-4 pt-3 space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] rounded-md"
              >
                Features
              </a>
              <a
                href="#platform"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] rounded-md"
              >
                Platform
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] rounded-md"
              >
                Demo
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] rounded-md"
              >
                Pricing
              </a>

              <div className="pt-3 border-t border-[#F0F0F0] dark:border-[#2D2D2D] space-y-2 px-3">
                <Link
                  href="/signin"
                  className="block w-full text-center py-2.5 text-sm font-medium text-[#5A5A5A] dark:text-[#D8D8D8] border border-[#D8D8D8] dark:border-[#2D2D2D] rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="block w-full text-center py-2.5 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-lg"
                >
                  Try for free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 lg:pt-24 lg:pb-24">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-tight text-[#080808] dark:text-white leading-[1.1] max-w-2xl"
          >
            From Thousands of Resumes to the Top 1% in Seconds
          </motion.h1>

          {/* Subtext + CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
          >
            {/* Subtext */}
            <p className="text-base text-[#666666] dark:text-[#999] max-w-md leading-relaxed">
              Our <span className="font-bold text-[#080808] dark:text-white">AI-powered</span> platform automates resume screening with{" "}
              <span className="font-bold text-[#080808] dark:text-white">99.7% accuracy</span>,
              empowering your team to focus on what truly matters: interviewing the best talent.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/signup"
                className="px-6 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-lg transition-all hover:scale-105"
              >
                Try for free
              </Link>
              <Link
                href="#"
                className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-[#666666] dark:text-[#999] border border-[#D8D8D8] dark:border-[#2D2D2D] rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#2D2D2D] transition-all hover:scale-105"
              >
                Request a Demo
                <span className="ml-1">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-14 lg:mt-20 relative"
          >
            <div className="relative mx-auto">
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

      {/* Features Section */}
      <section id="features" className="border-t border-[#F0F0F0] dark:border-[#2D2D2D] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
          >
            {/* Customizable Scoring */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#080808] dark:text-white mb-2">
                Customizable Scoring
              </h3>
              <p className="text-sm text-[#666666] dark:text-[#999] leading-relaxed">
                Build the ideal candidate profile. Set custom weights for specific skills, education, and years of experience to ensure the AI ranks candidates based on what matters most for any given role.
              </p>
            </motion.div>

            {/* AI-Powered Scoring */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#080808] dark:text-white mb-2">
                AI-Powered Scoring
              </h3>
              <p className="text-sm text-[#666666] dark:text-[#999] leading-relaxed">
                Our proprietary AI engine goes beyond keywords to understand context and proficiency. It analyzes and scores every resume instantly, surfacing the top candidates with unmatched accuracy and objectivity.
              </p>
            </motion.div>

            {/* Analytics & Reporting */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-8 4 4 4-6" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#080808] dark:text-white mb-2">
                Analytics &amp; Reporting
              </h3>
              <p className="text-sm text-[#666666] dark:text-[#999] leading-relaxed">
                Access a central dashboard to monitor key hiring metrics. Track time-to-hire, diversity statistics, and top performer sources to make data-driven decisions and optimize your recruitment process.
              </p>
            </motion.div>

            {/* Security & Integration */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#080808] dark:text-white mb-2">
                Security &amp; Integration
              </h3>
              <p className="text-sm text-[#666666] dark:text-[#999] leading-relaxed">
                Built for enterprise scale with best-in-class security and data compliance. Collaborate with granular permissions and seamlessly connect with your existing ATS and HR tech stack via native integrations.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hire With Intelligence Section */}
      <section id="platform" className="bg-white dark:bg-[#080808] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Headline - above the grid */}
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold text-[#080808] dark:text-white leading-[1.1] mb-10"
          >
            Hire With<br />Intelligence
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              {/* Description */}
              <p className="text-base text-[#666666] dark:text-[#999] leading-relaxed max-w-md">
                Our AI-powered platform does more than parse CVs — it understands them. From intelligent campaign creation to real-time scoring insights, we help you attract, screen, and select candidates who truly match your needs.
              </p>

              {/* Try for Free Button */}
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803d] rounded-lg transition-all"
                >
                  Try for Free
                </Link>
              </div>

              {/* Read More Card */}
              <div className="mt-8 border border-[#E5E5E5] dark:border-[#2D2D2D] rounded-lg p-4 max-w-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#080808] dark:text-white border border-[#080808] dark:border-white rounded px-2 py-0.5 uppercase tracking-wide">
                    Read More
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#080808] dark:text-white">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </div>
                <p className="text-sm text-[#666666] dark:text-[#999]">
                  The power of a data-driven strategy
                </p>
              </div>

              {/* Feature List */}
              <div className="mt-10 border-t border-[#E5E5E5] dark:border-[#2D2D2D] pt-8">
                <h3 className="text-base font-semibold text-[#080808] dark:text-white mb-1">
                  Launch hiring campaigns in minutes
                </h3>
                <p className="text-sm text-[#666666] dark:text-[#999] leading-relaxed">
                  Emphasize or de-emphasize any criteria, from specific programming languages to years of experience.
                </p>

                <p className="mt-5 text-sm text-[#666666] dark:text-[#999]">
                  Scale your hiring pipeline with confidence
                </p>

                <p className="mt-3 text-sm text-[#666666] dark:text-[#999]">
                  Smart Candidate Insights
                </p>
              </div>
            </motion.div>

            {/* Right Column - Campaign Image */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="rounded-xl overflow-hidden">
                <Image
                  src="/campaign.png"
                  alt="Create Campaign Interface"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Save 10x More Section */}
      <section className="bg-[#f0faf0] dark:bg-[#0a1a0a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-0">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-lg mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#080808] dark:text-white">
              Save 10x More
            </h2>
            <p className="mt-3 text-sm text-[#666666] dark:text-[#999] leading-relaxed">
              Emphasize or de-emphasize any criteria, from specific programming languages to years of experience.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-8 max-w-7xl mx-auto"
          >
            <Image
              src="/more.png"
              alt="Hiretics Platform Overview"
              width={1200}
              height={500}
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Experience a Live Demo Section */}
      <section id="demo" className="bg-white dark:bg-[#080808] scroll-mt-16 pt-29">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-lg mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#080808] dark:text-white leading-tight">
              Experience a Live Demo
            </h2>
            <p className="mt-4 text-sm text-[#666666] dark:text-[#999] leading-relaxed">
              This is a simplified, interactive preview of our platform. Adjust the scoring criteria below and watch how the candidate shortlist instantly re-ranks in real-time.
            </p>
          </motion.div>

          {/* Demo Image */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-10 max-w-4xl mx-auto"
          >
            <Image
              src="/demo.png"
              alt="Hiretics Live Demo Preview"
              width={900}
              height={600}
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Workflows Section */}
      <section className="bg-[#F5F5F5] dark:bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-20 lg:space-y-28">
          {/* Row 1 - Collaborative workflows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
              <Image
                src="/w1.png"
                alt="Collaborative Workflows"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </motion.div>
            <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.1 }}>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#080808] dark:text-white">
                Collaborative workflows
              </h3>
              <p className="mt-4 text-sm text-[#666666] dark:text-[#999] leading-relaxed max-w-sm">
                Easily sync with hiring managers and stakeholders. Create and manage job campaigns together — all from one dashboard.
              </p>
            </motion.div>
          </div>

          {/* Row 2 - Secure by design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
              <Image
                src="/w2.png"
                alt="Secure by Design"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </motion.div>
            <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.1 }}>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#080808] dark:text-white">
                Secure by design
              </h3>
              <p className="mt-4 text-sm text-[#666666] dark:text-[#999] leading-relaxed max-w-sm">
                Data privacy is at our core. We follow industry-grade encryption and compliance standards to protect your candidates&apos; information.
              </p>
            </motion.div>
          </div>

          {/* Row 3 - Seamless integrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
              <Image
                src="/w3.png"
                alt="Seamless Integrations"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </motion.div>
            <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.1 }}>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#080808] dark:text-white">
                Seamless integrations
              </h3>
              <p className="mt-4 text-sm text-[#666666] dark:text-[#999] leading-relaxed max-w-sm">
                Connect effortlessly with your existing HR stack — from CRMs to job boards — using our robust API and no-code integrations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white dark:bg-[#080808] scroll-mt-16">
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
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-base text-[#666666] dark:text-[#999] max-w-2xl mx-auto">
              Start for free and scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
          >
            {/* Free Plan */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="border border-[#E5E5E5] dark:border-[#2D2D2D] rounded-xl p-8 flex flex-col">
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
                  {["Up to 3 active campaigns", "AI-powered CV ranking", "Up to 50 CVs per campaign", "Candidate management", "Favourite campaigns"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#16A34A] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#080808] dark:text-white">{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="font-semibold text-[#080808] dark:text-white text-sm mb-3 mt-6">Limitations:</p>
                <ul className="space-y-3">
                  {["No analytics dashboard", "Limited CV uploads", "3 campaign limit"].map((l) => (
                    <li key={l} className="flex items-start gap-2">
                      <X className="h-4 w-4 text-[#999] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#666666] dark:text-[#999]">{l}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/signup"
                  className="block w-full text-center py-3 text-sm font-medium border border-[#16A34A] text-[#16A34A] rounded-lg hover:bg-[#16A34A]/10 transition-colors"
                >
                  Current Plan
                </Link>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="relative border-2 border-[#16A34A] rounded-xl p-8 flex flex-col ring-2 ring-[#16A34A]/20">
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
                Full analytics and higher limits for growing recruiters
              </p>

              <div className="flex-1">
                <p className="font-semibold text-[#080808] dark:text-white text-sm mb-3">What&apos;s included:</p>
                <ul className="space-y-3">
                  {["Up to 25 active campaigns", "AI-powered CV ranking", "Up to 500 CVs per campaign", "Full analytics dashboard", "Age, university & city insights", "Candidate management", "Favourite campaigns", "Priority CV processing"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#16A34A] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#080808] dark:text-white">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/signup"
                  className="block w-full text-center py-3 text-sm font-semibold bg-[#16A34A] hover:bg-[#15803d] text-white rounded-lg transition-colors"
                >
                  Subscribe
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Multi-Device Frame Section */}
      <section className="bg-white dark:bg-[#080808]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20"
        >
          <Image
            src="/frame.png"
            alt="Hiretics across all devices"
            width={1400}
            height={500}
            className="w-full h-auto"
          />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080808] text-white">
        {/* CTA Banner */}
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
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Ready to hire smarter?
              </h2>
              <p className="mt-3 text-[#999] text-base max-w-md">
                Join hundreds of teams already using Hiretics to find top talent faster.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/signup"
                className="px-6 py-3 text-sm font-semibold text-[#080808] bg-white hover:bg-[#F0F0F0] rounded-lg transition-colors hover:scale-105"
              >
                Get started free
              </Link>
              <a
                href="#demo"
                className="px-6 py-3 text-sm font-medium text-[#999] border border-[#333] hover:border-[#555] rounded-lg transition-colors hover:scale-105"
              >
                View demo
              </a>
            </div>
          </motion.div>
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Image
                src="/logo.png"
                alt="Hiretics"
                width={100}
                height={100}
                className="brightness-0 invert"
              />
              <p className="mt-4 text-sm text-[#888] leading-relaxed max-w-xs">
                AI-powered resume screening that helps you find the best candidates in seconds, not days.
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

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-[#888] hover:text-white transition-colors">Features</a></li>
                <li><a href="#platform" className="text-sm text-[#888] hover:text-white transition-colors">Platform</a></li>
                <li><a href="#demo" className="text-sm text-[#888] hover:text-white transition-colors">Live Demo</a></li>
                <li><a href="#pricing" className="text-sm text-[#888] hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Solutions</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">For Startups</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">For Enterprise</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">For Recruiters</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">For HR Teams</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-[#888] hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>

            {/* Legal */}
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

        {/* Bottom Bar */}
        <div className="border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#666]">
              &copy; {new Date().getFullYear()} Hiretics. All rights reserved.
            </p>
            <p className="text-xs text-[#666]">
              Made with precision for modern hiring teams.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
