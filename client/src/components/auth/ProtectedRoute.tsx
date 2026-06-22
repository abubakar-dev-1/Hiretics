"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

const PUBLIC_ROUTES = [
  /^\/campaign\/applicants\/[^/]+$/, // Regex for /campaign/applicants/[id]
  /^\/signup$/, // Signup route
  /^\/$/, // Landing page
  /^\/architecture$/, // Public: interactive architecture showcase
  /^\/product-tour$/, // Public: interactive product demo
];

function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some((regex) => regex.test(path));
}

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the route is public, skip auth check
    if (isPublicRoute(pathname)) {
      setLoading(false);
      return;
    }
    if (!isAuthenticated()) {
      router.replace("/signin");
    }
    setLoading(false);
  }, [router, pathname]);

  if (loading) return <div>Loading...</div>;
  return <>{children}</>;
}
