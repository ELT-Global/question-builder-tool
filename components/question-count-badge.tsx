/**
 * QuestionCountBadge Component
 * Displays total question count with visual indicator
 */

"use client"

interface QuestionCountBadgeProps {
  totalCount: number
}

export function QuestionCountBadge({ totalCount }: QuestionCountBadgeProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border-b bg-muted/50 px-4 py-3">
      <span className="text-sm font-medium">Total Questions</span>
      <span className={`text-sm font-semibold ${totalCount >= 100 ? "text-destructive" : "text-foreground"}`}>
        {totalCount} / 100
      </span>
    </div>
  )
}
