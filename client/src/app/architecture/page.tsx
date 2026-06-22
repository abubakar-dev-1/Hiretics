import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { ArchitectureShowcase } from "@/components/landing/ArchitectureShowcase";

export const metadata = {
  title: "System Architecture — Hiretics",
  description:
    "An interactive map of Hiretics' event-driven, queue-based serverless architecture.",
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* header */}
      <header className="sticky top-0 z-50 border-b border-[#1c1c1c] bg-[#080808]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm text-[#bbb] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <Image src="/logo.png" alt="Hiretics" width={92} height={92} className="brightness-0 invert" />
          </Link>
          <Link
            href="/product-tour"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]"
          >
            <PlayCircle className="h-4 w-4 text-[#16a34a]" /> Live product demo
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1c1c1c] bg-[#111] px-3 py-1 text-xs font-medium text-[#bbb]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /> Interactive system map
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
            How Hiretics works <span className="text-[#16a34a]">under the hood</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#999]">
            An event-driven, queue-based serverless system with microservices-style domain
            decomposition. Click any component to learn what it does and why it&apos;s there — or
            press <span className="font-semibold text-white">Trace a CV</span> to watch a résumé
            travel through the entire pipeline in real time.
          </p>
        </div>

        <ArchitectureShowcase />
      </main>
    </div>
  );
}
