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
    onSave(title.trim())
    onOpenChange(false)
  }

  const handleSkip = () => {
    onOpenChange(false)
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
              placeholder="e.g., Math Quiz, Science Test, etc."
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  handleSave()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          {/* {isFirstQuestion && (
            <Button variant="outline" onClick={handleSkip}>
              Skip for Now
            </Button>
          )} */}
          <Button onClick={handleSave} disabled={!title.trim()}>
            {isFirstQuestion ? "Save Title" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
