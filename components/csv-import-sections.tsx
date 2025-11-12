/**
 * Reusable components for CSV Import Modal
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Question } from "@/lib/types"
import { AlertCircle, AlertTriangle, CheckCircle2, FileSpreadsheet, Link2, Upload } from "lucide-react"

// CSV File Upload Section
interface FileUploadSectionProps {
  selectedFile: File | null
  onBrowseClick: () => void
}

export function FileUploadSection({ selectedFile, onBrowseClick }: FileUploadSectionProps) {
  return (
    <div
      onClick={onBrowseClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onBrowseClick()
        }
      }}
      role="button"
      tabIndex={0}
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {selectedFile ? (
        <>
          <FileSpreadsheet className="mb-4 h-12 w-12 text-primary" />
          <p className="text-center font-medium">{selectedFile.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </>
      ) : (
        <>
          <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-center font-medium">Click to upload CSV file</p>
          <p className="mt-1 text-xs text-muted-foreground">Maximum file size: 5MB</p>
        </>
      )}
    </div>
  )
}

// CSV Format Information
export function CSVFormatInfo() {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <h4 className="mb-2 text-sm font-semibold">Required CSV Format:</h4>
      <ul className="space-y-1 text-xs text-muted-foreground">
        <li>
          • <strong>question</strong>: Question text (required)
        </li>
        <li>
          • <strong>Correct_Option_Indexes</strong>: Comma-separated indexes (e.g., &quot;1,3&quot;)
        </li>
        <li>
          • <strong>Option_1_Text, Option_2_Text, ...</strong>: Up to 10 options
        </li>
        <li>
          • <strong>correct_answer-mark</strong>: Marks for correct answer
        </li>
        <li>
          • <strong>wrong_answer-mark</strong>: Marks for wrong answer
        </li>
        <li>
          • <strong>partial_answer-mark</strong>: Marks for partial answer (optional)
        </li>
        <li>
          • <strong>solution</strong>: Solution explanation (optional)
        </li>
      </ul>
    </div>
  )
}

// Google Sheets URL Input Section
interface GoogleSheetsInputProps {
  url: string
  isProcessing: boolean
  onUrlChange: (url: string) => void
  onImport: () => void
}

export function GoogleSheetsInput({ url, isProcessing, onUrlChange, onImport }: GoogleSheetsInputProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="sheets-url" className="text-sm font-medium">
          Google Sheets URL
        </label>
        <Input
          id="sheets-url"
          type="url"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <Button onClick={onImport} disabled={!url.trim() || isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Importing...
          </>
        ) : (
          <>
            <Link2 className="mr-2 h-4 w-4" />
            Import from Google Sheets
          </>
        )}
      </Button>
    </div>
  )
}

// Google Sheets Instructions
export function GoogleSheetsInstructions() {
  return (
    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
        <AlertCircle className="h-4 w-4" />
        Important: Make sheet publicly accessible
      </h4>
      <ol className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
        <li>1. Open your Google Sheet</li>
        <li>
          2. Click <strong>Share</strong> button (top right)
        </li>
        <li>
          3. Click <strong>Change to anyone with the link</strong>
        </li>
        <li>
          4. Set permission to <strong>Viewer</strong>
        </li>
        <li>5. Copy and paste the URL here</li>
      </ol>
    </div>
  )
}

// Processing State
interface ProcessingStateProps {
  activeTab: "file" | "link"
}

export function ProcessingState({ activeTab }: ProcessingStateProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">
        {activeTab === "file" ? "Processing CSV file..." : "Fetching data from Google Sheets..."}
      </p>
    </div>
  )
}

// Error Message
interface ErrorMessageProps {
  error: string
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
      <div className="flex-1">
        <h4 className="font-semibold text-destructive">Import Failed</h4>
        <p className="mt-1 text-sm text-destructive/90">{error}</p>
      </div>
    </div>
  )
}

// Preview Header
interface PreviewHeaderProps {
  questionCount: number
}

export function PreviewHeader({ questionCount }: PreviewHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <p className="font-medium">
          {questionCount} question{questionCount === 1 ? "" : "s"} ready to import
        </p>
      </div>
    </div>
  )
}

// Warnings Display
interface WarningsDisplayProps {
  warnings: string[]
}

export function WarningsDisplay({ warnings }: WarningsDisplayProps) {
  if (warnings.length === 0) return null

  return (
    <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 p-3 dark:bg-yellow-950/20">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-500" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
            {warnings.length} Warning{warnings.length === 1 ? "" : "s"}
          </h4>
          <ul className="mt-1 space-y-0.5 text-xs text-yellow-800 dark:text-yellow-200">
            {warnings.slice(0, 5).map((warning, idx) => (
              <li key={`warning-${idx}`}>• {warning}</li>
            ))}
            {warnings.length > 5 && <li className="italic">... and {warnings.length - 5} more</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Question Preview Item
interface QuestionPreviewItemProps {
  question: Question
  index: number
}

export function QuestionPreviewItem({ question, index }: QuestionPreviewItemProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-start justify-between">
        <h4 className="font-semibold">Question {index + 1}</h4>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            question.type === "mcq_multiple"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          }`}
        >
          {question.type === "mcq_multiple" ? "Multiple Answer" : "Single Answer"}
        </span>
      </div>

      <p className="mb-3 text-sm">{question.question}</p>

      <div className="space-y-2">
        {question.options?.map((option, optIndex) => (
          <div
            key={option.id}
            className={`flex items-center gap-2 rounded p-2 text-sm ${
              option.correct
                ? "bg-green-50 font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : "bg-muted/50"
            }`}
          >
            <span className="text-xs text-muted-foreground">{optIndex + 1}.</span>
            <span className="flex-1">{option.text}</span>
            {option.correct && <CheckCircle2 className="h-4 w-4" />}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span>Correct: +{question.marks.correct}</span>
        <span>Wrong: {question.marks.wrong}</span>
        {question.marks.partial && question.marks.partial > 0 ? (
          <span>Partial: {question.marks.partial}</span>
        ) : null}
      </div>

      {question.solution && (
        <div className="mt-3 rounded bg-muted/50 p-2 text-sm">
          <strong>Solution:</strong> {question.solution}
        </div>
      )}
    </div>
  )
}

// Questions Preview List
interface QuestionsPreviewProps {
  questions: Question[]
}

export function QuestionsPreview({ questions }: QuestionsPreviewProps) {
  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-6">
        {questions.map((question, index) => (
          <QuestionPreviewItem key={question.id} question={question} index={index} />
        ))}
      </div>
    </ScrollArea>
  )
}
