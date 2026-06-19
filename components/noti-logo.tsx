"use client"

import { Send, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotiLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = {
  sm: { wrap: "w-7 h-7 rounded-lg",  send: "h-3.5 w-3.5", zap_pos: "-top-1 -right-1 w-3.5 h-3.5", zap: "h-2 w-2" },
  md: { wrap: "w-10 h-10 rounded-xl", send: "h-5 w-5",    zap_pos: "-top-1.5 -right-1.5 w-5 h-5",  zap: "h-3 w-3" },
  lg: { wrap: "w-14 h-14 rounded-2xl",send: "h-7 w-7",    zap_pos: "-top-2 -right-2 w-6 h-6",      zap: "h-3.5 w-3.5" },
}

export function NotiLogo({ size = "md", className }: NotiLogoProps) {
  const s = sizes[size]
  return (
    <div className={cn("relative flex items-center justify-center bg-primary shadow-lg shadow-primary/40 shrink-0", s.wrap, className)}>
      <Send className={cn("text-primary-foreground", s.send)} strokeWidth={2.2} />
      <div className={cn("absolute bg-yellow-400 rounded-full flex items-center justify-center shadow-sm", s.zap_pos)}>
        <Zap className={cn("text-yellow-900 fill-yellow-400", s.zap)} strokeWidth={2.5} />
      </div>
    </div>
  )
}
