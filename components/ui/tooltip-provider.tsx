import type * as React from "react"

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

export function TooltipProvider({ children, delayDuration = 200 }: TooltipProviderProps) {
  return <>{children}</>
}
