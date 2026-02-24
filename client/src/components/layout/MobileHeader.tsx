'use client'

import { Menu, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileHeaderProps } from "@/types/header-types"

export const MobileHeader = ({
  onMobileMenuClick,
  button = true,
  title = "Your Campaigns",
  subtitle,
  onAddClick,
}: MobileHeaderProps) => {
  return (
    <>
      {/* Top nav bar */}
      <div className="w-full px-4 py-3 flex lg:hidden items-center justify-between bg-background border-b sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onMobileMenuClick}>
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-md bg-[#16A34A] flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-semibold text-sm text-foreground">Hiretics</span>
          </div>
        </div>

        {button && (
          <Button
            size="sm"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white gap-1.5 h-8"
            onClick={onAddClick}
          >
            <Plus size={16} />
            New
          </Button>
        )}
      </div>

      {/* Page title */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </>
  )
}
