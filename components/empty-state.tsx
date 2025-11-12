/**
 * EmptyState Component
 * Displayed when there are no questions
 */

"use client"

import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

interface EmptyStateProps {
  onCreateQuestion: () => void
}

export function EmptyState({ onCreateQuestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24">
      <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-lg font-semibold">No questions yet</h2>
      <p className="mb-6 text-sm text-muted-foreground">Create your first question to get started</p>
      <Button onClick={onCreateQuestion}>
        <Plus className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  )
}
