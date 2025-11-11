/**
 * QuestionPrompt Component
 * Text area for question or scenario description
 */

"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getQuestionPromptPlaceholder, getQuestionTypeLabel, isScenarioType } from "@/lib/question-utils"
import type { QuestionType } from "@/lib/types"

interface QuestionPromptProps {
  questionId: string
  questionType: QuestionType
  value: string
  onChange: (value: string) => void
}

export function QuestionPrompt({ questionId, questionType, value, onChange }: QuestionPromptProps) {
  const isScenario = isScenarioType(questionType)
  const label = getQuestionTypeLabel(questionType, isScenario)
  const placeholder = getQuestionPromptPlaceholder(questionType)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`prompt-${questionId}`}>{label}</Label>
      <Textarea
        id={`prompt-${questionId}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  )
}
