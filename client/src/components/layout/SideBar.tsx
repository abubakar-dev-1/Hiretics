"use client";

import {
  Home,
  Star,
  Trash,
  Settings,
  LogOut,
  BarChart,
  Crown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarProps } from "@/types/sidebar-types";
import { toast } from "sonner";
import { signOut } from "@/lib/auth";
import axios from "axios";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Star, label: "Favourites", href: "/favourites" },
  { icon: BarChart, label: "Analytics", href: "/analytics" },
  { icon: Trash, label: "Trash", href: "/trash" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export const Sidebar = ({
  isMobileOpen,
  setIsMobileOpen,
  collapsed,
  setCollapsed,
}: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [user, setUser] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    }
  }, []);

  const getUserSubscription = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL_SUBSCRIPTION}/subs?user_id=${user.id}`
      );
      setIsUserSubscribed(response.data.plan !== "free");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user.id) getUserSubscription();
  }, [user.id]);

  const handleLogout = async () => {
    signOut();
    toast.success("Logged out successfully!");
    router.replace("/signin");
  };

  return (
    <>
      <div
        className={cn(
          "bg-background h-full flex flex-col justify-between fixed lg:static z-40 transition-all duration-300 border-r",
          collapsed ? "w-16" : "w-[220px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Top section */}
        <div className={cn("flex flex-col", collapsed ? "items-center" : "items-start", "py-5 px-3")}>
          {/* Logo */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-2 mb-6 px-2 pb-4 border-b border-border w-full",
              collapsed && "justify-center"
            )}
          >
            <div className="h-8 w-8 rounded-lg bg-[#16A34A] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight text-foreground">
                Hiretics
              </span>
            )}
          </button>

          {/* Nav items */}
          <div className={cn("flex flex-col gap-1 w-full", !collapsed && "px-1")}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-3 w-full justify-start text-sm font-medium h-10",
                      isActive
                        ? "bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon
                      size={18}
                      className={cn(
                        isActive ? "text-[#16A34A]" : "text-muted-foreground"
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                    {item.label === "Analytics" && !isUserSubscribed && !collapsed && (
                      <Crown size={14} className="text-yellow-500 ml-auto" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Upgrade CTA */}
          {!isUserSubscribed && !collapsed && (
            <div className="mt-6 mx-1 p-3 rounded-lg bg-[#16A34A]/5 border border-[#16A34A]/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={14} className="text-[#16A34A]" />
                <span className="text-xs font-semibold text-foreground">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Unlock analytics and higher limits
              </p>
              <Link href="/pricing">
                <Button size="sm" className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs h-8">
                  View Plans
                </Button>
              </Link>
            </div>
          )}

          {!isUserSubscribed && collapsed && (
            <Link href="/pricing" className="mt-4">
              <Button size="icon" variant="ghost" className="h-10 w-10">
                <Sparkles size={18} className="text-[#16A34A]" />
              </Button>
            </Link>
          )}
        </div>

        {/* Logout */}
        <div className={cn("px-3 pb-4", collapsed && "flex justify-center")}>
          <Button
            variant="ghost"
            className={cn(
              "text-muted-foreground hover:text-foreground w-full justify-start h-10",
              collapsed && "w-10 p-0 justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {!collapsed && <span className="ml-2 text-sm">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
