/**
 * Core type definitions for the Question Authoring application
 * Following single responsibility principle - types are grouped by domain
 */

export type QuestionType = "mcq_single" | "mcq_multiple" | "scenario"

// Marks structure for scoring
export interface Marks {
  positive: number
  negative?: number
  partial?: number // Only for mcq_single
}

// Option structure for MCQ questions
export interface Option {
  id: string
  text: string
  correct: boolean
}

// Image metadata (stored in JSON, actual files kept separately)
export interface ImageMeta {
  id: string // UUID + extension (e.g., "5b7f-uuid.png")
  name: string // Original filename
  mime: string // MIME type
  size: number // Size in bytes
}

export interface SubQuestion {
  id: string
  type: "mcq_single" | "mcq_multiple"
  prompt: string
  options: Option[]
  marks: Marks
  images?: ImageMeta[]
  explanation?: string
}

// Complete question structure
export interface Question {
  id: string
  type: QuestionType
  prompt: string
  options?: Option[] // Only for MCQ types
  marks: Marks
  images?: ImageMeta[]
  explanation?: string
  scenarioQuestionCount?: number // How many sub-questions to add in scenario
  subQuestions?: SubQuestion[] // Sub-questions for scenario type
}

// Export data structure
export interface ExportData {
  meta: {
    generatedAt: string
    version: string
    title?: string // Title for the question set
  }
  questions: Question[]
}

// Import validation result
export interface ImportValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

// Import progress states
export type ImportStage =
  | "idle"
  | "reading"
  | "extracting"
  | "validating-json"
  | "validating-images"
  | "processing"
  | "storing"
  | "complete"
  | "error"

// Import state for UI
export interface ImportState {
  stage: ImportStage
  progress: number // 0-100
  message: string
  error?: string
}

// Map for storing actual File objects (client-side only)
export type ImageFilesMap = Map<string, File>
