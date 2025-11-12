/**
 * SubQuestionEditor Component
 * Form for creating/editing sub-questions within a scenario
 * Similar to QuestionEditor but simplified for sub-questions
 */

"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Option, SubQuestion } from "@/lib/types"
import { Info, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface SubQuestionEditorProps {
  subQuestion: SubQuestion
  index: number
  onUpdate: (subQuestion: SubQuestion) => void
  onDelete: (subQuestionId: string) => void
}

export function SubQuestionEditor({
  subQuestion,
  index,
  onUpdate,
  onDelete,
}: SubQuestionEditorProps) {
  const [localSubQuestion, setLocalSubQuestion] = useState<SubQuestion>(subQuestion)

  useEffect(() => {
    setLocalSubQuestion(subQuestion)
  }, [subQuestion])

  const updateField = <K extends keyof SubQuestion>(field: K, value: SubQuestion[K]) => {
    const updated = { ...localSubQuestion, [field]: value }
    setLocalSubQuestion(updated)
    onUpdate(updated)
  }

  const updateMarks = (field: "correct" | "wrong" | "partial", value: string) => {
    const numValue = Number.parseFloat(value) || 0
    const updated = {
      ...localSubQuestion,
      marks: { ...localSubQuestion.marks, [field]: numValue },
    }
    setLocalSubQuestion(updated)
    onUpdate(updated)
  }

  const addOption = () => {
    if (localSubQuestion.options.length >= 10) {
      alert("You can only add a maximum of 10 options per question.")
      return
    }
    const newOption: Option = {
      id: crypto.randomUUID(),
      text: "",
      correct: false,
    }
    const options = [...localSubQuestion.options, newOption]
    updateField("options", options)
  }

  const updateOption = (optionId: string, field: keyof Option, value: string | boolean) => {
    if (field === "correct" && value === true && localSubQuestion.type === "mcq_single") {
      const options = localSubQuestion.options.map((opt) => ({
        ...opt,
        correct: opt.id === optionId ? true : false,
      }))
      updateField("options", options)
    } else {
      const options = localSubQuestion.options.map((opt) => (opt.id === optionId ? { ...opt, [field]: value } : opt))
      updateField("options", options)
    }
  }

  const removeOption = (optionId: string) => {
    const options = localSubQuestion.options.filter((opt) => opt.id !== optionId)
    updateField("options", options)
  }

  return (
    <div className="rounded-lg border-2 border-dashed bg-muted/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Sub-Question {index + 1}</h4>
        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(subQuestion.id)} className="h-8 w-8">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-3">
        {/* Sub-Question Type */}
        <div>
          <Label htmlFor={`type-${subQuestion.id}`} className="text-sm">
            Question Type
          </Label>
          <Select
            value={localSubQuestion.type}
            onValueChange={(value: "mcq_single" | "mcq_multiple") => updateField("type", value)}
          >
            <SelectTrigger id={`type-${subQuestion.id}`} className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq_single">MCQ (Single Answer)</SelectItem>
              <SelectItem value="mcq_multiple">MCQ (Multiple Answers)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sub-Question Text */}
        <div>
          <Label htmlFor={`question-${subQuestion.id}`} className="text-sm">
            Question Text
          </Label>
          <Textarea
            id={`question-${subQuestion.id}`}
            value={localSubQuestion.question}
            onChange={(e) => updateField("question", e.target.value)}
            placeholder="Enter sub-question here..."
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Answers</Label>
              <div className="group relative">
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                <div className="absolute left-0 top-5 z-10 hidden w-48 rounded-md bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md group-hover:block">
                  Select correct answers by checking the boxes
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                ({localSubQuestion.options.length}/10)
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={localSubQuestion.options.length >= 10}
              className="h-8 text-xs bg-transparent"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Option
            </Button>
          </div>

          {localSubQuestion.options.map((option, optIndex) => (
            <div key={option.id} className="flex items-start gap-2">
              <Checkbox
                checked={option.correct}
                onCheckedChange={(checked) => updateOption(option.id, "correct", checked === true)}
                className="mt-1.5"
              />
              <Input
                value={option.text}
                onChange={(e) => updateOption(option.id, "text", e.target.value)}
                placeholder={`Option ${optIndex + 1}`}
                className="flex-1 h-9 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(option.id)}
                className="h-9 w-9"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Marks */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor={`correct-${subQuestion.id}`} className="text-sm">
              Correct Marks<span className="text-destructive">*</span>
            </Label>
            <Input
              id={`correct-${subQuestion.id}`}
              type="number"
              min="0"
              step="0.5"
              value={localSubQuestion.marks.correct}
              onChange={(e) => updateMarks("correct", e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor={`wrong-${subQuestion.id}`} className="text-sm">
              Wrong Marks
            </Label>
            <Input
              id={`wrong-${subQuestion.id}`}
              type="number"
              min="0"
              step="0.5"
              value={localSubQuestion.marks.wrong || 0}
              onChange={(e) => updateMarks("wrong", e.target.value)}
              className="h-9"
            />
          </div>
          {/* Only show partial marks for multiple answer MCQ */}
          {localSubQuestion.type === "mcq_multiple" && (
            <div>
              <Label htmlFor={`partial-${subQuestion.id}`} className="text-sm">
                Partial Marks
              </Label>
              <Input
                id={`partial-${subQuestion.id}`}
                type="number"
                min="0"
                step="0.5"
                value={localSubQuestion.marks.partial || 0}
                onChange={(e) => updateMarks("partial", e.target.value)}
                className="h-9"
              />
            </div>
          )}
        </div>

        {/* Solution */}
        <div>
          <Label htmlFor={`solution-${subQuestion.id}`} className="text-sm">
            Solution (Optional)
          </Label>
          <Textarea
            id={`solution-${subQuestion.id}`}
            value={localSubQuestion.solution || ""}
            onChange={(e) => updateField("solution", e.target.value)}
            placeholder="Add a solution..."
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  )
}
