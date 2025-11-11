/**
 * LocalStorage utilities for auto-save functionality
 * Simple, focused functions for draft persistence
 */

import { isOldDataFormat, migrateQuestions } from "./migrate-data"
import type { Question } from "./types"

const STORAGE_KEY = "question-authoring-draft"

export interface StoredDraft {
  questions: Question[]
  timestamp: string
  title?: string
}

/**
 * Save current draft to localStorage
 */
export function saveDraft(questions: Question[], title?: string): void {
  try {
    const draft: StoredDraft = {
      questions,
      timestamp: new Date().toISOString(),
      title,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error("[v0] Failed to save draft:", error)
  }
}

/**
 * Load draft from localStorage (with automatic migration)
 */
export function loadDraft(): StoredDraft | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    
    // Check if migration is needed
    if (parsed.questions && parsed.questions.length > 0) {
      const needsMigration = parsed.questions.some((q: any) => isOldDataFormat(q))
      
      if (needsMigration) {
        console.log("🔄 Migrating draft data from old format to new format...")
        const migratedQuestions = migrateQuestions(parsed.questions)
        
        // Save migrated data back
        const migratedDraft: StoredDraft = {
          questions: migratedQuestions,
          timestamp: new Date().toISOString(),
          title: parsed.title,
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedDraft))
        
        console.log("✅ Migration complete:", migratedQuestions.length, "questions migrated")
        
        return migratedDraft
      }
    }
    
    return parsed as StoredDraft
  } catch (error) {
    console.error("[v0] Failed to load draft:", error)
    return null
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("[v0] Failed to clear draft:", error)
  }
}
