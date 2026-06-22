import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Network } from "lucide-react";
import { ProductTour } from "@/components/ProductTour";

export const metadata = {
  title: "Live Product Tour — Hiretics",
  description:
    "An interactive walkthrough of Hiretics for recruiters, candidates and platform owners.",
};

export default function ProductTourPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="sticky top-0 z-50 border-b border-[#1c1c1c] bg-[#080808]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm text-[#bbb] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <Image src="/logo.png" alt="Hiretics" width={92} height={92} className="brightness-0 invert" />
          </Link>
          <Link
            href="/architecture"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]"
          >
            <Network className="h-4 w-4 text-[#16a34a]" /> System architecture
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1c1c1c] bg-[#111] px-3 py-1 text-xs font-medium text-[#bbb]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /> Interactive walkthrough
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
            See Hiretics <span className="text-[#16a34a]">in action</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#999]">
            A guided, click-through demo of the real product — no setup needed. Switch between the
            three roles, step through each screen, and read what happens behind the scenes. Hit{" "}
            <span className="font-semibold text-white">Auto-play</span> to let it run itself.
          </p>
        </div>

        <ProductTour />
      </main>
    </div>
  );
}
