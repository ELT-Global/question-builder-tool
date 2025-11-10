/**
 * LocalStorage utilities for auto-save functionality
 * Simple, focused functions for draft persistence
 */

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
 * Load draft from localStorage
 */
export function loadDraft(): StoredDraft | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as StoredDraft
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
