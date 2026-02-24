"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Home from "@/components/HomePage";
import LandingPage from "@/components/landing/LandingPage";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return isAuthenticated ? <Home /> : <LandingPage />;
}
