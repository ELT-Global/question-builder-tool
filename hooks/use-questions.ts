"use client"

import { clearDraft, loadDraft, saveDraft } from "@/lib/storage"
import type { Question } from "@/lib/types"
import { useCallback, useEffect, useState } from "react"

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [title, setTitle] = useState<string>("")

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setQuestions(draft.questions)
      setTitle(draft.title || "")
    }
  }, [])

  // Auto-save draft when questions or title change
  useEffect(() => {
    if (questions.length > 0) {
      saveDraft(questions, title)
    }
  }, [questions, title])

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
    setTitle("")
    clearDraft()
  }, [])

  // Replace all questions (used for import)
  const replaceAllQuestions = useCallback((newQuestions: Question[], newTitle?: string) => {
    setQuestions(newQuestions)
    setTitle(newTitle || "")
    saveDraft(newQuestions, newTitle)
  }, [])

  // Update title
  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle)
    saveDraft(questions, newTitle)
  }, [questions])

  return {
    questions,
    title,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearAll,
    replaceAllQuestions,
    updateTitle,
  }
}
