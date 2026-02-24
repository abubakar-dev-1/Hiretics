'use client'

import { useEffect, useState } from "react"
import { ThemeProvider } from "next-themes"
import { SplashScreen } from "@/components/splash/SaplashScreen"

export const ClientRoot = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {loading ? <SplashScreen /> : children}
    </ThemeProvider>
  )
}
