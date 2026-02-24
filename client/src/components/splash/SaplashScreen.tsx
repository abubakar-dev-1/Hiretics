'use client'

import React, { useEffect, useState } from "react"

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-[#16A34A] flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hiretics
          </h1>
        </div>

        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#16A34A] rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          AI-Powered Hiring
        </p>
      </div>
    </div>
  )
}
