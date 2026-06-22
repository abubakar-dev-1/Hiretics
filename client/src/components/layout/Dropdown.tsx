'use client'

import { LogOut, Settings, CreditCard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Props } from "@/types/dropdown-types"
import { signOut } from "@/lib/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DropdownMenuButton({ name, avatarUrl }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    signOut()
    toast.success("Logged out successfully!")
    router.replace("/signin")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex gap-2 rounded-lg items-center px-2 py-1.5 border border-border hover:bg-muted/50 transition-colors outline-none">
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-[#16A34A]/10 text-[#16A34A] text-xs font-semibold">
              {name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm hidden lg:block max-w-[120px] truncate">
            {name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/pricing")} className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          Plans & Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
