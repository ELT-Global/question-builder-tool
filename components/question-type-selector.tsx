/**
 * QuestionTypeSelector Component
 * Handles question type selection and reset functionality
 */

"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuestionType } from "@/lib/types"
import { RotateCcw } from "lucide-react"

interface QuestionTypeOption {
  name: string
  value: QuestionType
  isDisabled: boolean
}

const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
  { name: "Multiple Choice Question", value: "mcq_single", isDisabled: false },
  { name: "Multiple Choice Question with Multiple Answers", value: "mcq_multiple", isDisabled: false },
  { name: "Scenario Based", value: "scenario", isDisabled: true },
]

interface QuestionTypeSelectorProps {
  questionId: string
  value: QuestionType
  hasContent: boolean
  onChange: (type: QuestionType) => void
  onReset: () => void
}

export function QuestionTypeSelector({
  questionId,
  value,
  hasContent,
  onChange,
  onReset,
}: QuestionTypeSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={`type-${questionId}`}>Question Type</Label>
        {hasContent && (
          <Button type="button" variant="ghost" size="sm" onClick={onReset} className="h-8 gap-1 text-xs">
            <RotateCcw className="h-3 w-3" />
            Reset Question
          </Button>
        )}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={`type-${questionId}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {QUESTION_TYPE_OPTIONS.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value} 
              disabled={option.isDisabled}
            >
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
