/**
 * ExportModal Component
 * Modal dialog for entering ZIP filename before export
 * Component handles user input and triggers export
 */

"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (zipName: string) => Promise<void>
  questionCount: number
}

export function ExportModal({ open, onOpenChange, onExport, questionCount }: ExportModalProps) {
  const [zipName, setZipName] = useState(() => {
    const date = new Date().toISOString().slice(0, 10)
    return `questions-${date}`
  })
  const [isExporting, setIsExporting] = useState(false)

  // Handle export button click
  const handleExport = async () => {
    if (!zipName.trim()) {
      alert("Please enter a ZIP filename")
      return
    }

    setIsExporting(true)
    try {
      await onExport(zipName.trim())
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Questions</DialogTitle>
          <DialogDescription>
            Export {questionCount} question{questionCount !== 1 ? "s" : ""} to a ZIP file containing the questions data
            and all uploaded images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="zip-name">ZIP Filename</Label>
            <div className="flex gap-2">
              <Input
                id="zip-name"
                value={zipName}
                onChange={(e) => setZipName(e.target.value)}
                placeholder="questions-2025-01-01"
              />
              <span className="flex items-center text-sm text-muted-foreground">.zip</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
