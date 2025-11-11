/**
 * ScenarioSubQuestions Component
 * Input for number of sub-questions and generation button
 */

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ScenarioSubQuestionsProps {
  questionId: string
  count?: number
  onCountChange: (count: number | undefined) => void
  onGenerate: () => void
}

export function ScenarioSubQuestions({ questionId, count, onCountChange, onGenerate }: ScenarioSubQuestionsProps) {
  const handleChange = (value: string) => {
    const parsed = Number.parseInt(value)
    onCountChange(parsed || undefined)
  }

  const isDisabled = !count || count < 1

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`scenario-count-${questionId}`}>
        Number of Questions in Scenario <span className="ml-1 text-xs text-muted-foreground">(Max: 5)</span>
      </Label>
      <div className="flex gap-2">
        <Input
          id={`scenario-count-${questionId}`}
          type="number"
          min="1"
          max="5"
          value={count || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter number of questions (max 5)"
          className="flex-1"
        />
        <Button type="button" onClick={onGenerate} disabled={isDisabled}>
          Generate Questions
        </Button>
      </div>
    </div>
  )
}
