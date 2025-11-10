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
import type { ImageMeta, Option, SubQuestion } from "@/lib/types"
import { Info, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { ImageUploader } from "./image-uploader"

interface SubQuestionEditorProps {
  subQuestion: SubQuestion
  index: number
  onUpdate: (subQuestion: SubQuestion) => void
  onDelete: (subQuestionId: string) => void
  onImagesAdd: (imageMetaWithFiles: Array<{ meta: ImageMeta; file: File }>) => void
  onImageRemove: (subQuestionId: string, imageId: string) => void
  imageFilesMap?: Map<string, File>
}

export function SubQuestionEditor({
  subQuestion,
  index,
  onUpdate,
  onDelete,
  onImagesAdd,
  onImageRemove,
  imageFilesMap,
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

  const updateMarks = (field: "positive" | "negative" | "partial", value: string) => {
    const numValue = Number.parseFloat(value) || 0
    const updated = {
      ...localSubQuestion,
      marks: { ...localSubQuestion.marks, [field]: numValue },
    }
    setLocalSubQuestion(updated)
    onUpdate(updated)
  }

  const addOption = () => {
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

  const handleImagesChange = (newImages: ImageMeta[], files: File[]) => {
    const imageMetaWithFiles = newImages.map((meta, index) => ({
      meta,
      file: files[index],
    }))

    const updated = {
      ...localSubQuestion,
      images: [...(localSubQuestion.images || []), ...newImages],
    }

    setLocalSubQuestion(updated)
    onUpdate(updated)
    onImagesAdd(imageMetaWithFiles)
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

        {/* Sub-Question Prompt */}
        <div>
          <Label htmlFor={`prompt-${subQuestion.id}`} className="text-sm">
            Question Text
          </Label>
          <Textarea
            id={`prompt-${subQuestion.id}`}
            value={localSubQuestion.prompt}
            onChange={(e) => updateField("prompt", e.target.value)}
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
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
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
            <Label htmlFor={`positive-${subQuestion.id}`} className="text-sm">
              Positive Marks<span className="text-destructive">*</span>
            </Label>
            <Input
              id={`positive-${subQuestion.id}`}
              type="number"
              min="0"
              step="0.5"
              value={localSubQuestion.marks.positive}
              onChange={(e) => updateMarks("positive", e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor={`negative-${subQuestion.id}`} className="text-sm">
              Negative Marks
            </Label>
            <Input
              id={`negative-${subQuestion.id}`}
              type="number"
              min="0"
              step="0.5"
              value={localSubQuestion.marks.negative || 0}
              onChange={(e) => updateMarks("negative", e.target.value)}
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

        {/* Images */}
        <ImageUploader
          images={localSubQuestion.images || []}
          onImagesChange={handleImagesChange}
          onImageRemove={(imageId) => onImageRemove(subQuestion.id, imageId)}
          imageFiles={imageFilesMap}
        />

        {/* Explanation */}
        <div>
          <Label htmlFor={`explanation-${subQuestion.id}`} className="text-sm">
            Explanation (Optional)
          </Label>
          <Textarea
            id={`explanation-${subQuestion.id}`}
            value={localSubQuestion.explanation || ""}
            onChange={(e) => updateField("explanation", e.target.value)}
            placeholder="Add an explanation..."
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  )
}
