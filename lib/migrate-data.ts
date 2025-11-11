/**
 * Data Migration Utility
 * Converts old field names to new field names in stored data
 * 
 * Old → New mappings:
 * - prompt → question
 * - positive → correct
 * - negative → wrong
 * - explanation → solution
 */

import type { Question, SubQuestion } from "./types"

// Old field names (for type safety during migration)
interface OldMarks {
  positive: number
  negative?: number
  partial?: number
}

interface OldSubQuestion {
  id: string
  type: "mcq_single" | "mcq_multiple"
  prompt: string
  options: Array<{ id: string; text: string; correct: boolean }>
  marks: OldMarks
  images?: Array<{ id: string; name: string; mime: string; size: number }>
  explanation?: string
}

interface OldQuestion {
  id: string
  type: "mcq_single" | "mcq_multiple" | "scenario"
  prompt: string
  options?: Array<{ id: string; text: string; correct: boolean }>
  marks: OldMarks
  images?: Array<{ id: string; name: string; mime: string; size: number }>
  explanation?: string
  scenarioQuestionCount?: number
  subQuestions?: OldSubQuestion[]
}

/**
 * Check if data uses old field names
 */
export function isOldDataFormat(question: any): boolean {
  return (
    "prompt" in question ||
    ("marks" in question && "positive" in question.marks) ||
    "explanation" in question
  )
}

/**
 * Migrate a single sub-question from old to new format
 */
function migrateSubQuestion(oldSubQuestion: OldSubQuestion): SubQuestion {
  return {
    id: oldSubQuestion.id,
    type: oldSubQuestion.type,
    question: oldSubQuestion.prompt, // prompt → question
    options: oldSubQuestion.options,
    marks: {
      correct: oldSubQuestion.marks.positive, // positive → correct
      wrong: oldSubQuestion.marks.negative, // negative → wrong
      partial: oldSubQuestion.marks.partial,
    },
    images: oldSubQuestion.images,
    solution: oldSubQuestion.explanation, // explanation → solution
  }
}

/**
 * Migrate a single question from old to new format
 */
export function migrateQuestion(oldQuestion: OldQuestion | Question): Question {
  // If already in new format, return as is
  if (!isOldDataFormat(oldQuestion)) {
    return oldQuestion as Question
  }

  const old = oldQuestion as OldQuestion

  return {
    id: old.id,
    type: old.type,
    question: old.prompt, // prompt → question
    options: old.options,
    marks: {
      correct: old.marks.positive, // positive → correct
      wrong: old.marks.negative, // negative → wrong
      partial: old.marks.partial,
    },
    images: old.images,
    solution: old.explanation, // explanation → solution
    scenarioQuestionCount: old.scenarioQuestionCount,
    subQuestions: old.subQuestions?.map(migrateSubQuestion),
  }
}

/**
 * Migrate an array of questions from old to new format
 */
export function migrateQuestions(questions: (OldQuestion | Question)[]): Question[] {
  return questions.map(migrateQuestion)
}

/**
 * Migrate draft data from localStorage
 */
export function migrateDraftFromStorage(): { questions: Question[]; title: string } | null {
  try {
    const draft = localStorage.getItem("question-draft")
    if (!draft) return null

    const parsed = JSON.parse(draft)
    
    // Check if migration is needed
    if (!parsed.questions || parsed.questions.length === 0) {
      return parsed
    }

    const needsMigration = parsed.questions.some((q: any) => isOldDataFormat(q))
    
    if (!needsMigration) {
      return parsed
    }

    // Migrate questions
    const migratedQuestions = migrateQuestions(parsed.questions)
    
    // Save migrated data back to localStorage
    const migratedDraft = {
      questions: migratedQuestions,
      title: parsed.title || "",
    }
    
    localStorage.setItem("question-draft", JSON.stringify(migratedDraft))
    
    console.log("✅ Draft data migrated successfully:", {
      questionsCount: migratedQuestions.length,
      from: "old format (prompt, positive, negative, explanation)",
      to: "new format (question, correct, wrong, solution)",
    })
    
    return migratedDraft
  } catch (error) {
    console.error("❌ Error migrating draft data:", error)
    return null
  }
}

/**
 * Migrate exported JSON data
 */
export function migrateExportData(data: any): any {
  if (!data.questions || data.questions.length === 0) {
    return data
  }

  const needsMigration = data.questions.some((q: any) => isOldDataFormat(q))
  
  if (!needsMigration) {
    return data
  }

  return {
    ...data,
    questions: migrateQuestions(data.questions),
  }
}
