"use client";

import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/auth";
import Home from "@/components/HomePage";
import LandingPage from "@/components/landing/LandingPage";

export default function Page() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  if (authed === null) {
    return null;
  }

  return authed ? <Home /> : <LandingPage />;
}
