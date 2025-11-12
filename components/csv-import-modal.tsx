/**
 * CSVImportModal Component
 * Modal for importing questions from CSV file or Google Sheets link
 */

"use client"

import {
    CSVFormatInfo,
    ErrorMessage,
    FileUploadSection,
    GoogleSheetsInput,
    GoogleSheetsInstructions,
    PreviewHeader,
    ProcessingState,
    QuestionsPreview,
    WarningsDisplay,
} from "@/components/csv-import-sections"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCSVImportState } from "@/hooks/use-csv-import"
import type { Question } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, FileSpreadsheet, Link2 } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"

interface CSVImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (questions: Question[]) => void
}

export function CSVImportModal({ open, onOpenChange, onImport }: CSVImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    state,
    resetState,
    resetToInput,
    setActiveTab,
    setGoogleSheetsUrl,
    processCSVFile,
    processGoogleSheetsUrl,
  } = useCSVImportState()

  // Reset state when modal opens (fresh start each time)
  useEffect(() => {
    if (open) {
      resetState()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [open, resetState])

  // File input handlers
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        processCSVFile(file)
      }
    },
    [processCSVFile]
  )

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Import handlers
  const handleImport = useCallback(() => {
    if (state.previewQuestions.length > 0) {
      onImport(state.previewQuestions)
      resetState()
      onOpenChange(false)
    }
  }, [state.previewQuestions, onImport, resetState, onOpenChange])

  const handleClose = useCallback(() => {
    resetState()
    onOpenChange(false)
  }, [resetState, onOpenChange])

  // Handle modal close - reset state when closing
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        // Clear state when modal closes
        resetState()
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
      onOpenChange(isOpen)
    },
    [resetState, onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("w-full", state.showPreview ? "md:max-w-7xl" : "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle>Import Questions from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file or import from Google Sheets. Questions will be added to your existing questions.
          </DialogDescription>
        </DialogHeader>

        {state.showPreview ? (
          /* Preview Section */
          <div className="space-y-4">
            <PreviewHeader questionCount={state.previewQuestions.length} />
            <WarningsDisplay warnings={state.warnings} />
            <QuestionsPreview questions={state.previewQuestions} />
          </div>
        ) : (
          /* Input Section */
          <Tabs value={state.activeTab} onValueChange={(v) => setActiveTab(v as "file" | "link")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Upload CSV
              </TabsTrigger>
              <TabsTrigger value="link">
                <Link2 className="mr-2 h-4 w-4" />
                Google Sheets
              </TabsTrigger>
            </TabsList>

            {/* CSV File Upload Tab */}
            <TabsContent value="file" className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <FileUploadSection selectedFile={state.selectedFile} onBrowseClick={handleBrowseClick} />
              <CSVFormatInfo />
            </TabsContent>

            {/* Google Sheets Tab */}
            <TabsContent value="link" className="space-y-4">
              <GoogleSheetsInput
                url={state.googleSheetsUrl}
                isProcessing={state.isProcessing}
                onUrlChange={setGoogleSheetsUrl}
                onImport={processGoogleSheetsUrl}
              />
              <GoogleSheetsInstructions />
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-semibold">Sheet Format:</h4>
                <p className="mb-2 text-xs text-muted-foreground">
                  Your Google Sheet should follow the same format as the CSV file (see Upload CSV tab for details).
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Processing State */}
        {state.isProcessing && !state.showPreview && <ProcessingState activeTab={state.activeTab} />}

        {/* Error Message */}
        {state.error && !state.showPreview && <ErrorMessage error={state.error} />}

        <DialogFooter>
          {state.showPreview ? (
            <>
              <Button variant="outline" onClick={resetToInput}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={state.previewQuestions.length === 0}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Import {state.previewQuestions.length} Question
                {state.previewQuestions.length === 1 ? "" : "s"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
