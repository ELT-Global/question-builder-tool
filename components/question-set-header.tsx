/**
 * QuestionSetHeader Component
 * Displays question set title with edit functionality
 */

"use client"

import { Button } from "@/components/ui/button"
import { Edit2 } from "lucide-react"

interface QuestionSetHeaderProps {
  title: string
  onEditTitle: () => void
}

export function QuestionSetHeader({ title, onEditTitle }: QuestionSetHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 flex-1">
        <div className="max-w-324 w-full overflow-x-auto scrollbar-thin">
          <p className="text-muted-foreground">Question Set Title</p>
          <h1 className="text-2xl font-bold">{title || "Section 1"}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditTitle}
          className="text-muted-foreground hover:text-foreground"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  )
}
