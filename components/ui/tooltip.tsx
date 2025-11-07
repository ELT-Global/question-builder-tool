import type * as React from "react"

interface TooltipProps {
  children: React.ReactNode
  content: string
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
        {content}
        <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </div>
    </div>
  )
}
