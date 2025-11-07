"use client"

import { useState, useEffect, useCallback } from "react"
import { saveDraft, loadDraft, clearDraft } from "@/lib/storage"
import type { Question } from "@/lib/types"

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setQuestions(draft.questions)
    }
  }, [])

  // Auto-save draft when questions change
  useEffect(() => {
    if (questions.length > 0) {
      saveDraft(questions)
    }
  }, [questions])

  // Create new question
  const createQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "mcq_single",
      prompt: "",
      options: [
        { id: crypto.randomUUID(), text: "", correct: false },
        { id: crypto.randomUUID(), text: "", correct: false },
      ],
      marks: { positive: 1, negative: 0, partial: 0 },
      images: [],
      explanation: "",
    }

    setQuestions((prev) => [...prev, newQuestion])
  }, [])

  // Update existing question
  const updateQuestion = useCallback((updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
  }, [])

  // Delete question
  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }, [])

  // Clear all questions
  const clearAll = useCallback(() => {
    setQuestions([])
    clearDraft()
  }, [])

  return {
    questions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearAll,
  }
}
