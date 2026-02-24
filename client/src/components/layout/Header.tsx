'use client'

import { Bell, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { DropdownMenuButton } from "./Dropdown"
import { HeaderProps } from "@/types/header-types"

export const Header = ({ title, subtitle }: HeaderProps) => {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed.displayName) setName(parsed.displayName)
      } catch {}
    }
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : ""

  return (
    <div className="hidden lg:flex items-center justify-between w-full px-6 py-4 border-b bg-background">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {subtitle}{displayName ? `, ${displayName}` : ""}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#DC2626]" />
        </Button>

        <DropdownMenuButton name={displayName || "User"} />
      </div>
    </div>
  )
}
