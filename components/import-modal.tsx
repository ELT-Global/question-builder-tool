/**
 * ImportModal Component
 * Main modal for ZIP file import with drag-drop support and progress display
 */

"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { ImportState } from "@/lib/types"
import { AlertCircle, CheckCircle2, FileArchive, Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import { ImportProgress } from "./import-progress"

interface ImportModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onImport: (file: File) => Promise<void>
  readonly importState: ImportState
  readonly pendingFile: File | null
}

export function ImportModal({
  open,
  onOpenChange,
  onImport,
  importState,
  pendingFile,
}: Readonly<ImportModalProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(pendingFile)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file && (file.type.includes("zip") || file.name.endsWith(".zip"))) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleImportClick = () => {
    const fileToImport = selectedFile || pendingFile
    if (fileToImport) {
      onImport(fileToImport)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleCancel = () => {
    setSelectedFile(null)
    onOpenChange(false)
  }

  const isProcessing = importState.stage !== "idle" && importState.stage !== "complete" && importState.stage !== "error"
  const isComplete = importState.stage === "complete"
  const isError = importState.stage === "error"
  const hasFileToImport = selectedFile || pendingFile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>
            Import questions from a previously exported ZIP file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isProcessing && !isComplete && !isError && (
            <>
              {/* File Drop Zone */}
              <div
                role="button"
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleBrowseClick()
                  }
                }}
                className={`
                  relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors
                  ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                `}
                onClick={handleBrowseClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {selectedFile || pendingFile ? (
                  <>
                    <FileArchive className="mb-4 h-12 w-12 text-primary" />
                    <p className="text-center font-medium">{(selectedFile || pendingFile)?.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {((selectedFile || pendingFile)?.size || 0 / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-center font-medium">Drop ZIP file here or click to browse</p>
                    <p className="mt-1 text-xs text-muted-foreground">Maximum file size: 100MB</p>
                  </>
                )}
              </div>

              {/* Import Button */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleImportClick} disabled={!hasFileToImport}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </>
          )}

          {/* Progress Display */}
          {isProcessing && (
            <ImportProgress
              stage={importState.stage}
              progress={importState.progress}
              message={importState.message}
            />
          )}

          {/* Success Message */}
          {isComplete && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <div className="text-center">
                <h3 className="font-semibold">Import Successful!</h3>
                <p className="text-sm text-muted-foreground">Questions have been imported and are ready to edit</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {isError && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-destructive">Import Failed</h4>
                  <p className="text-sm text-destructive">{importState.error}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setSelectedFile(null)
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
