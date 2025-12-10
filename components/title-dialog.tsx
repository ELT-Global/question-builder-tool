/**
 * TitleDialog Component
 * Dialog for entering/editing the question set title
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"
import { useEffect, useState } from "react"

interface TitleDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (title: string) => void
  readonly initialTitle?: string
  readonly isFirstQuestion?: boolean
}

export function TitleDialog({
  open,
  onOpenChange,
  onSave,
  initialTitle = "",
  isFirstQuestion = false,
}: Readonly<TitleDialogProps>) {
  const [title, setTitle] = useState(initialTitle)

  useEffect(() => {
    setTitle(initialTitle)
  }, [initialTitle, open])

  const handleSave = () => {
    const finalTitle = title.trim() || "Section 1"
    onSave(finalTitle)
    // Note: Don't call onOpenChange(false) here - parent's handleTitleSave will close the dialog
    // This prevents a race condition where handleTitleDialogClose would run before state updates
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isFirstQuestion ? "Set Question Title" : "Edit Title"}
          </DialogTitle>
          <DialogDescription>
            {isFirstQuestion
              ? "Give your question set a title. This will be used as the default export filename."
              : "Update the title for your question set."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g., Math Quiz, Science Test (default: "Section 1")'
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>
            {isFirstQuestion ? "Save Title" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
