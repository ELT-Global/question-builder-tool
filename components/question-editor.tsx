/**
 * QuestionEditor Component
 * Form for creating/editing a single question
 * Component manages its own form state and validation
 */

"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ImageMeta, Option, Question, QuestionType, SubQuestion } from "@/lib/types"
import { AlertTriangle, Info, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { ImageUploader } from "./image-uploader"
import { SubQuestionEditor } from "./sub-question-editor"

interface QuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: (questionId: string) => void
  onImagesAdd: (imageMetaWithFiles: Array<{ meta: ImageMeta; file: File }>) => void
  onImageRemove: (questionId: string, imageId: string) => void
  imageFilesMap?: Map<string, File>
  totalQuestionCount: number
  allQuestions: Question[]
}

export function QuestionEditor({
  question,
  onUpdate,
  onDelete,
  onImagesAdd,
  onImageRemove,
  imageFilesMap,
  totalQuestionCount,
  allQuestions,
}: QuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState<Question>(question)
  const [hasContent, setHasContent] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [pendingType, setPendingType] = useState<QuestionType | null>(null)

  useEffect(() => {
    setLocalQuestion(question)
  }, [question])

  useEffect(() => {
    const hasOptions = (localQuestion.options?.length || 0) > 0
    const hasPrompt = localQuestion.prompt.trim().length > 0
    const hasSubQuestions = (localQuestion.subQuestions?.length || 0) > 0
    setHasContent(hasOptions || hasPrompt || hasSubQuestions)
  }, [localQuestion.options, localQuestion.prompt, localQuestion.subQuestions])

  const updateField = <K extends keyof Question>(field: K, value: Question[K]) => {
    const updated = { ...localQuestion, [field]: value }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  const updateMarks = (field: "positive" | "negative" | "partial", value: string) => {
    const numValue = Number.parseFloat(value) || 0
    const updated = {
      ...localQuestion,
      marks: { ...localQuestion.marks, [field]: numValue },
    }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  const addOption = () => {
    const currentOptions = localQuestion.options || []
    if (currentOptions.length >= 10) {
      alert("You can only add a maximum of 10 options per question.")
      return
    }
    const newOption: Option = {
      id: crypto.randomUUID(),
      text: "",
      correct: false,
    }
    const options = [...currentOptions, newOption]
    updateField("options", options)
  }

  const updateOption = (optionId: string, field: keyof Option, value: string | boolean) => {
    if (field === "correct" && value === true && localQuestion.type === "mcq_single") {
      const options =
        localQuestion.options?.map((opt) => ({
          ...opt,
          correct: opt.id === optionId ? true : false,
        })) || []
      updateField("options", options)
    } else {
      const options =
        localQuestion.options?.map((opt) => (opt.id === optionId ? { ...opt, [field]: value } : opt)) || []
      updateField("options", options)
    }
  }

  const removeOption = (optionId: string) => {
    const options = localQuestion.options?.filter((opt) => opt.id !== optionId) || []
    updateField("options", options)
  }

  const handleImagesChange = (newImages: ImageMeta[], files: File[]) => {
    const imageMetaWithFiles = newImages.map((meta, index) => ({
      meta,
      file: files[index],
    }))

    const updated = {
      ...localQuestion,
      images: [...(localQuestion.images || []), ...newImages],
    }

    setLocalQuestion(updated)
    onUpdate(updated)
    onImagesAdd(imageMetaWithFiles)
  }

  const generateSubQuestions = () => {
    const count = localQuestion.scenarioQuestionCount || 0
    if (count > 5) {
      alert("A scenario can have a maximum of 5 sub-questions.")
      updateField("scenarioQuestionCount", 5)
      return
    }

    // Calculate total questions excluding current scenario's sub-questions
    const otherQuestionsTotal = allQuestions.reduce((total, q) => {
      if (q.id === question.id) {
        // Skip current question
        return total
      }
      if (q.type === "scenario" && q.subQuestions) {
        return total + q.subQuestions.length
      }
      return total + 1
    }, 0)

    const newTotal = otherQuestionsTotal + count

    if (newTotal > 100) {
      const maxAllowed = 100 - otherQuestionsTotal
      alert(
        `Adding ${count} sub-questions would exceed the maximum limit of 100 total questions. You can add a maximum of ${maxAllowed} sub-questions to stay within the limit.`
      )
      return
    }

    const subQuestions: SubQuestion[] = Array.from({ length: count }, () => ({
      id: crypto.randomUUID(),
      type: "mcq_single",
      prompt: "",
      options: [],
      marks: { positive: 1, negative: 0, partial: 0 },
    }))
    updateField("subQuestions", subQuestions)
  }

  const updateSubQuestion = (updatedSubQuestion: SubQuestion) => {
    const subQuestions =
      localQuestion.subQuestions?.map((sq) => (sq.id === updatedSubQuestion.id ? updatedSubQuestion : sq)) || []
    updateField("subQuestions", subQuestions)
  }

  const deleteSubQuestion = (subQuestionId: string) => {
    const subQuestions = localQuestion.subQuestions?.filter((sq) => sq.id !== subQuestionId) || []
    updateField("subQuestions", subQuestions)
  }

  const resetQuestion = () => {
    const resetQuestion: Question = {
      ...localQuestion,
      type: pendingType || localQuestion.type,
      prompt: "",
      options: [],
      explanation: "",
      scenarioQuestionCount: undefined,
      subQuestions: undefined,
    }
    setLocalQuestion(resetQuestion)
    onUpdate(resetQuestion)
    setShowResetConfirm(false)
    setPendingType(null)
  }

  const handleTypeChange = (newType: QuestionType) => {
    if (hasContent && localQuestion.type !== newType) {
      setPendingType(newType)
      setShowResetConfirm(true)
    } else {
      updateField("type", newType)
    }
  }

  const isMCQ = localQuestion.type === "mcq_single" || localQuestion.type === "mcq_multiple"
  const isScenario = localQuestion.type === "scenario"

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Question</h3>
        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(question.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Question Type */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor={`type-${question.id}`}>Question Type</Label>
            {hasContent && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPendingType(localQuestion.type)
                  setShowResetConfirm(true)
                }}
                className="h-8 gap-1 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Question
              </Button>
            )}
          </div>
          <Select value={localQuestion.type} onValueChange={handleTypeChange}>
            <SelectTrigger id={`type-${question.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq_single">Multiple Choice Question</SelectItem>
              <SelectItem value="mcq_multiple">Multiple Choice Question with Multiple Answers</SelectItem>
              <SelectItem value="scenario">Scenario Based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question Prompt */}
        <div>
          <Label htmlFor={`prompt-${question.id}`}>{isScenario ? "Scenario Description" : "Question Text"}</Label>
          <Textarea
            id={`prompt-${question.id}`}
            value={localQuestion.prompt}
            onChange={(e) => updateField("prompt", e.target.value)}
            placeholder={isScenario ? "Describe the scenario..." : "Enter your question here..."}
            rows={3}
          />
        </div>

        {isScenario && (
          <div>
            <Label htmlFor={`scenario-count-${question.id}`}>
              Number of Questions in Scenario{" "}
              <span className="ml-1 text-xs text-muted-foreground">(Max: 5)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id={`scenario-count-${question.id}`}
                type="number"
                min="1"
                max="5"
                value={localQuestion.scenarioQuestionCount || ""}
                onChange={(e) => updateField("scenarioQuestionCount", Number.parseInt(e.target.value) || undefined)}
                placeholder="Enter number of questions (max 5)"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={generateSubQuestions}
                disabled={!localQuestion.scenarioQuestionCount || localQuestion.scenarioQuestionCount < 1}
              >
                Generate Questions
              </Button>
            </div>
          </div>
        )}

        {/* Options (for MCQ) */}
        {isMCQ && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Answers</Label>
                <div className="group relative">
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  <div className="absolute left-0 top-6 z-10 hidden w-48 rounded-md bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md group-hover:block">
                    Select correct answers by checking the boxes
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({localQuestion.options?.length || 0}/10)
                </span>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addOption}
                disabled={(localQuestion.options?.length || 0) >= 10}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>

            {localQuestion.options?.map((option, index) => (
              <div key={option.id} className="flex items-start gap-2">
                <Checkbox
                  checked={option.correct}
                  onCheckedChange={(checked) => updateOption(option.id, "correct", checked === true)}
                  className="mt-2"
                />
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, "text", e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(option.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isScenario && localQuestion.subQuestions && localQuestion.subQuestions.length > 0 && (
          <div className="space-y-3">
            <Label>Sub-Questions</Label>
            {localQuestion.subQuestions.map((subQuestion, index) => (
              <SubQuestionEditor
                key={subQuestion.id}
                subQuestion={subQuestion}
                index={index}
                onUpdate={updateSubQuestion}
                onDelete={deleteSubQuestion}
              />
            ))}
          </div>
        )}

        {/* Marks - Only for MCQ types, not for scenario */}
        {!isScenario && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor={`positive-${question.id}`}>
              Positive Marks<span className="text-destructive">*</span>
              </Label>
              <Input
              id={`positive-${question.id}`}
              type="number"
              min="0"
              step="0.5"
              value={localQuestion.marks.positive || ''}
              onChange={(e) => updateMarks("positive", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`negative-${question.id}`}>Negative Marks</Label>
              <Input
                id={`negative-${question.id}`}
                type="number"
                // min="0"
                step="0.5"
                value={localQuestion.marks.negative || ''}
                onChange={(e) => updateMarks("negative", e.target.value)}
              />
            </div>
            {localQuestion.type === "mcq_multiple" && (
              <div>
                <Label htmlFor={`partial-${question.id}`}>Partial Marks</Label>
                <Input
                  id={`partial-${question.id}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={localQuestion.marks.partial || ""}
                  onChange={(e) => updateMarks("partial", e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Images - Only for scenario types */}
        {isScenario && (
          <ImageUploader
            images={localQuestion.images || []}
            onImagesChange={handleImagesChange}
            onImageRemove={(imageId) => onImageRemove(question.id, imageId)}
            imageFiles={imageFilesMap}
            maxImages={2}
          />
        )}

        {/* Explanation - Only for non-scenario types */}
        {!isScenario && (
          <div>
            <Label htmlFor={`explanation-${question.id}`}>Explanation (Optional)</Label>
            <Textarea
              id={`explanation-${question.id}`}
              value={localQuestion.explanation || ""}
              onChange={(e) => updateField("explanation", e.target.value)}
              placeholder="Add an explanation for the answer..."
              rows={2}
            />
          </div>
        )}
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reset Question?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing the question type will clear all options, answers, and question text. This action cannot be
              undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingType(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
