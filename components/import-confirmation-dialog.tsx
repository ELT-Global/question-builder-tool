/**
 * ImportConfirmationDialog Component
 * Warning dialog shown when importing would overwrite existing questions
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
import { AlertTriangle } from "lucide-react"

interface ImportConfirmationDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly existingQuestionCount: number
}

export function ImportConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  existingQuestionCount,
}: Readonly<ImportConfirmationDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Replace Existing Questions?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You currently have <strong>{existingQuestionCount}</strong> question
              {existingQuestionCount === 1 ? "" : "s"}.
            </p>
            <p>Importing this ZIP file will replace all existing questions and images.</p>
            <p className="font-semibold text-destructive">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Import ZIP
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
