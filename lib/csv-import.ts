/**
 * CSV Import utilities
 * Converts CSV format to Question format and validates structure
 */

import type { Question } from "./types"

interface CSVRow {
  question: string
  type?: string
  Correct_Option_Indexes?: string
  "correct_answer-mark"?: string
  "wrong_answer-mark"?: string
  "partial-mark"?: string
  solution?: string
  [key: string]: string | undefined
}

export interface CSVImportResult {
  success: boolean
  questions?: Question[]
  error?: string
  warnings?: string[]
  totalCount?: number
}

/**
 * Validate CSV structure
 */
function validateCSVStructure(lines: string[]): { valid: boolean; error?: string } {
  if (lines.length < 2) {
    return { valid: false, error: "CSV file is empty or has no data rows" }
  }

  const headers = parseCSVLine(lines[0])

  // Required columns
  const requiredColumns = ["question", "Correct_Option_Indexes"]
  const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

  if (missingColumns.length > 0) {
    return {
      valid: false,
      error: `Missing required columns: ${missingColumns.join(", ")}`,
    }
  }

  // Check for at least Option_1_Text
  if (!headers.some((h) => h.startsWith("Option_") && h.endsWith("_Text"))) {
    return {
      valid: false,
      error: "No option columns found. Expected columns like Option_1_Text, Option_2_Text, etc.",
    }
  }

  return { valid: true }
}

/**
 * Parse CSV line handling quoted values and commas within quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      // Handle escaped quotes
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

/**
 * Parse CSV row into object
 */
function parseCSVRow(headers: string[], values: string[]): CSVRow {
  const row: CSVRow = { question: "" }
  headers.forEach((header, index) => {
    row[header] = values[index]?.trim() || ""
  })
  return row
}

/**
 * Convert CSV text to Question array
 */
export function csvToQuestions(csvText: string): CSVImportResult {
  try {
    // Split and clean lines
    const lines = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    // Validate structure
    const validation = validateCSVStructure(lines)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const headers = parseCSVLine(lines[0])
    const questions: Question[] = []
    const warnings: string[] = []

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row = parseCSVRow(headers, values)

      // Skip rows without question text
      if (!row.question || row.question.length === 0) {
        warnings.push(`Row ${i + 1}: Skipped - No question text`)
        continue
      }

      // Parse correct option indexes (1-based to 0-based)
      const correctIndexes = row.Correct_Option_Indexes
        ? row.Correct_Option_Indexes.split(",")
          .map((n) => Number.parseInt(n.trim()) - 1)
          .filter((n) => !Number.isNaN(n) && n >= 0)
        : []

      if (correctIndexes.length === 0) {
        warnings.push(`Row ${i + 1}: Skipped - No valid correct option indexes`)
        continue
      }

      // Collect options (up to 10)
      const options = []
      for (let j = 1; j <= 10; j++) {
        const optionKey = `Option_${j}_Text`
        const optionText = row[optionKey]

        if (optionText && optionText.length > 0) {
          options.push({
            id: crypto.randomUUID(),
            text: optionText,
            correct: correctIndexes.includes(j - 1),
          })
        }
      }

      // Validate at least 2 options
      if (options.length < 2) {
        warnings.push(`Row ${i + 1}: Skipped - Need at least 2 options`)
        continue
      }

      // Validate that correct indexes exist in options
      const validCorrectOptions = options.filter((opt) => opt.correct)
      if (validCorrectOptions.length === 0) {
        warnings.push(`Row ${i + 1}: Skipped - No correct option found`)
        continue
      }

      // Detect question type
      const questionType = correctIndexes.length > 1 ? "mcq_multiple" : "mcq_single"

      // Build question object
      const question: Question = {
        id: crypto.randomUUID(),
        type: questionType,
        question: row.question,
        options,
        marks: {
          correct: Number(row["correct_answer-mark"] || row["correct_answer_mark"]) || 1,
          wrong: Number(row["wrong_answer-mark"] || row["wrong_answer_mark"]) || 0,
          partial: Number(row["partial-mark"] || row["partial_mark"]) || 0,
        },
        images: [],
        solution: row.solution || "",
      }

      questions.push(question)
    }

    if (questions.length === 0) {
      return {
        success: false,
        error: "No valid questions found in CSV. Please check the format.",
        warnings,
      }
    }

    // Calculate total questions including sub-questions (for future scenario support)
    const totalCount = questions.reduce((total, q) => {
      if (q.type === "scenario" && q.subQuestions) {
        return total + q.subQuestions.length
      }
      return total + 1
    }, 0)

    return {
      success: true,
      questions,
      warnings: warnings.length > 0 ? warnings : undefined,
      totalCount
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse CSV file",
    }
  }
}

/**
 * Validate CSV file before processing
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.name.endsWith(".csv")) {
    return { valid: false, error: "Please upload a CSV file (.csv)" }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: "CSV file size must be less than 5MB" }
  }

  if (file.size === 0) {
    return { valid: false, error: "CSV file is empty" }
  }

  return { valid: true }
}

/**
 * Read CSV file content
 */
export function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(content)
    }
    reader.onerror = () => reject(new Error("Failed to read CSV file"))
    reader.readAsText(file)
  })
}
