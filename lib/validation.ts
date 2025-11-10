/**
 * Zod validation schemas for all form inputs
 * Centralized validation logic following best practices
 */

import { z } from "zod"

// Marks validation schema
export const marksSchema = z.object({
  positive: z.number().min(0, "Positive marks must be >= 0"),
  negative: z.number().min(0, "Negative marks must be >= 0").optional(),
  partial: z.number().min(0, "Partial marks must be >= 0").optional(),
})

// Option validation schema
export const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required"),
  correct: z.boolean(),
})

// Image metadata validation schema
export const imageMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  mime: z.string(),
  size: z.number(),
})

export const subQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["mcq_single", "mcq_multiple"]),
  prompt: z.string().min(1, "Question prompt is required"),
  options: z.array(optionSchema),
  marks: marksSchema,
  images: z.array(imageMetaSchema).optional(),
  explanation: z.string().optional(),
})

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(["mcq_single", "mcq_multiple", "scenario"]),
  prompt: z.string().min(1, "Question prompt is required"),
  options: z.array(optionSchema).optional(),
  marks: marksSchema,
  images: z.array(imageMetaSchema).optional(),
  explanation: z.string().optional(),
  scenarioQuestionCount: z.number().optional(),
  subQuestions: z.array(subQuestionSchema).optional(),
})

// Export data validation schema
export const exportDataSchema = z.object({
  meta: z.object({
    generatedAt: z.string(),
    version: z.string(),
    title: z.string().optional(),
  }),
  questions: z.array(questionSchema),
})

// ZIP file validation constants
export const MAX_ZIP_SIZE = 100 * 1024 * 1024 // 100 MB

/**
 * Validate ZIP file before processing
 */
export function validateZipFile(file: File): {
  valid: boolean
  error?: string
} {
  // Check file type
  if (!file.type.includes("zip") && !file.name.endsWith(".zip")) {
    return {
      valid: false,
      error: "Invalid file type. Please select a ZIP file.",
    }
  }

  // Check file size
  if (file.size > MAX_ZIP_SIZE) {
    return {
      valid: false,
      error: `ZIP file too large. Maximum size is ${MAX_ZIP_SIZE / (1024 * 1024)}MB.`,
    }
  }

  return { valid: true }
}

// File validation constants
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"]
export const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
export const MAX_TOTAL_SIZE = 80 * 1024 * 1024 // 80 MB

/**
 * Validate image file extension and MIME type
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" is too large. Maximum size is 5 MB.`,
    }
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
    return {
      valid: false,
      error: `File "${file.name}" has invalid format. Allowed: jpg, png, gif, webp, svg.`,
    }
  }

  // Check extension
  const extension = file.name.split(".").pop()?.toLowerCase()
  if (!extension || !ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File "${file.name}" has invalid extension.`,
    }
  }

  return { valid: true }
}
