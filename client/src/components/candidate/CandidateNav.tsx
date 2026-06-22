"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FileUp, Briefcase, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

const links = [
  { href: "/candidate", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/analyze", label: "Analyze CV", icon: FileUp },
  { href: "/candidate/jobs", label: "Job Board", icon: Briefcase },
];

export function CandidateNav() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/candidate" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="font-bold text-foreground">Hiretics <span className="text-muted-foreground font-normal">for Candidates</span></span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
                  active ? "bg-[#16A34A]/10 text-[#16A34A]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <l.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
