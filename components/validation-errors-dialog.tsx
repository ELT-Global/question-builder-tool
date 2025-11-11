/**
 * ValidationErrorsDialog Component
 * Displays validation errors in a user-friendly dialog
 */

"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ValidationError } from "@/lib/export-validation"
import { groupErrorsByQuestion } from "@/lib/export-validation"
import { AlertTriangle } from "lucide-react"

interface ValidationErrorsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  errors: ValidationError[]
}

export function ValidationErrorsDialog({ open, onOpenChange, errors }: ValidationErrorsDialogProps) {
  const groupedErrors = groupErrorsByQuestion(errors)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Validation Errors Found
          </DialogTitle>
          <DialogDescription>
            Please fix the following errors before exporting. {errors.length} error{errors.length !== 1 ? "s" : ""}{" "}
            found across your questions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {Array.from(groupedErrors.entries()).map(([questionIndex, questionErrors]) => {
              const firstError = questionErrors[0]
              const questionLabel =
                firstError.questionType === "scenario"
                  ? `Scenario ${questionIndex + 1}`
                  : `Question ${questionIndex + 1}`

              return (
                <div key={questionIndex} className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <h4 className="mb-2 font-semibold text-destructive">{questionLabel}</h4>
                  <ul className="space-y-2">
                    {questionErrors.map((error, errorIndex) => (
                      <li key={errorIndex} className="text-sm">
                        {error.subQuestionIndex !== undefined && (
                          <span className="font-medium">Sub-Question {error.subQuestionIndex + 1}: </span>
                        )}
                        <span className="font-medium">{error.field}</span> - {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
