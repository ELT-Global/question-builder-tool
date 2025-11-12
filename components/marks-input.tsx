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
  correctMarks: number
  wrongMarks?: number
  partialMarks?: number
  onUpdate: (field: "correct" | "wrong" | "partial", value: string) => void
}

export function MarksInput({
  questionId,
  questionType,
  correctMarks,
  wrongMarks,
  partialMarks,
  onUpdate,
}: MarksInputProps) {
  const showPartialMarks = questionType === "mcq_multiple"

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`correct-${questionId}`}>
            Marks<span className="text-destructive">*</span>
        </Label>
        <Input
          id={`correct-${questionId}`}
          type="number"
          min="0"
          step="0.5"
          value={correctMarks || ""}
          onChange={(e) => onUpdate("correct", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`wrong-${questionId}`}>Wrong Marks</Label>
        <Input
          id={`wrong-${questionId}`}
          type="number"
          min="0"
          step="0.5"
          value={wrongMarks || ""}
          onChange={(e) => onUpdate("wrong", e.target.value)}
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
