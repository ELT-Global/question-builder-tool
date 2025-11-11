/**
 * MarksInput Component
 * Input fields for marks (positive, negative, partial)
 */

"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { QuestionType } from "@/lib/types"

interface MarksInputProps {
  questionId: string
  questionType: QuestionType
  positiveMarks: number
  negativeMarks?: number
  partialMarks?: number
  onUpdate: (field: "positive" | "negative" | "partial", value: string) => void
}

export function MarksInput({
  questionId,
  questionType,
  positiveMarks,
  negativeMarks,
  partialMarks,
  onUpdate,
}: MarksInputProps) {
  const showPartialMarks = questionType === "mcq_multiple"

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`positive-${questionId}`}>
          Positive Marks<span className="text-destructive">*</span>
        </Label>
        <Input
          id={`positive-${questionId}`}
          type="number"
          min="0"
          step="0.5"
          value={positiveMarks || ""}
          onChange={(e) => onUpdate("positive", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`negative-${questionId}`}>Negative Marks</Label>
        <Input
          id={`negative-${questionId}`}
          type="number"
          min="0"
          step="0.5"
          value={negativeMarks || ""}
          onChange={(e) => onUpdate("negative", e.target.value)}
        />
      </div>
      {showPartialMarks && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`partial-${questionId}`}>Partial Marks</Label>
          <Input
            id={`partial-${questionId}`}
            type="number"
            min="0"
            step="0.5"
            value={partialMarks || ""}
            onChange={(e) => onUpdate("partial", e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
