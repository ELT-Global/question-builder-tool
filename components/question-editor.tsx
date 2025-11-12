/**
 * QuestionEditor Component
 * Form for creating/editing a single question
 * Refactored with custom hooks and utility functions
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQuestionEditor } from "@/hooks/use-question-editor"
import { canAddOption, getOptionCount, isMCQType, isScenarioType } from "@/lib/question-utils"
import type { ImageMeta, Question } from "@/lib/types"
import { AlertTriangle, Trash2 } from "lucide-react"
import { ImageUploader } from "./image-uploader"
import { MarksInput } from "./marks-input"
import { MCQOptions } from "./mcq-options"
import { QuestionPrompt } from "./question-prompt"
import { QuestionTypeSelector } from "./question-type-selector"
import { ScenarioSubQuestions } from "./scenario-sub-questions"
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
  // Use custom hook for question state and logic
  const {
    localQuestion,
    hasContent,
    showResetConfirm,
    setShowResetConfirm,
    pendingType,
    setPendingType,
    updateField,
    updateMarks,
    addOption,
    updateOption,
    removeOption,
    handleImagesChange,
    generateSubQuestions,
    updateSubQuestion,
    deleteSubQuestion,
    resetQuestion,
    handleTypeChange,
  } = useQuestionEditor({ question, onUpdate, allQuestions })

  // Handle image changes and pass to parent
  const handleImageUpdate = (newImages: ImageMeta[], files: File[]) => {
    const imageMetaWithFiles = handleImagesChange(newImages, files)
    onImagesAdd(imageMetaWithFiles)
  }

  // Determine question type
  const isMCQ = isMCQType(localQuestion.type)
  const isScenario = isScenarioType(localQuestion.type)
  const optionCount = getOptionCount(localQuestion)
  const maxOptionsReached = !canAddOption(optionCount)

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Question</h3>
        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(question.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Question Type Selector */}
        <QuestionTypeSelector
          questionId={question.id}
          value={localQuestion.type}
          hasContent={hasContent}
          onChange={handleTypeChange}
          onReset={() => {
            setPendingType(localQuestion.type)
            setShowResetConfirm(true)
          }}
        />

        {/* Question Prompt */}
        <QuestionPrompt
          questionId={question.id}
          questionType={localQuestion.type}
          value={localQuestion.question}
          onChange={(value) => updateField("question", value)}
        />

        {/* Scenario Sub-Questions Input */}
        {isScenario && (
          <ScenarioSubQuestions
            questionId={question.id}
            count={localQuestion.scenarioQuestionCount}
            onCountChange={(value) => updateField("scenarioQuestionCount", value)}
            onGenerate={generateSubQuestions}
          />
        )}

        {/* MCQ Options */}
        {isMCQ && (
          <MCQOptions
            options={localQuestion.options || []}
            onAdd={addOption}
            onUpdate={updateOption}
            onRemove={removeOption}
            maxReached={maxOptionsReached}
          />
        )}

        {/* Scenario Sub-Questions List */}
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
          <MarksInput
            questionId={question.id}
            questionType={localQuestion.type}
            correctMarks={localQuestion.marks.correct}
            wrongMarks={localQuestion.marks.wrong}
            partialMarks={localQuestion.marks.partial}
            onUpdate={updateMarks}
          />
        )}

        {/* Images - For all question types */}
        <ImageUploader
          images={localQuestion.images || []}
          onImagesChange={handleImageUpdate}
          onImageRemove={(imageId) => onImageRemove(question.id, imageId)}
          imageFiles={imageFilesMap}
          maxImages={2}
        />

        {/* Solution - Only for non-scenario types */}
        {!isScenario && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`solution-${question.id}`}>Solution (Optional)</Label>
            <Textarea
              id={`solution-${question.id}`}
              value={localQuestion.solution || ""}
              onChange={(e) => updateField("solution", e.target.value)}
              placeholder="Add a solution for the answer..."
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
