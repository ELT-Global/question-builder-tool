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
      console.log(`💾 Draft saved: ${questions.length} questions`)
    } else {
      // Clear draft when no questions exist
      clearDraft()
      console.log("🧹 Draft cleared (no questions)")
    }
  }, [questions, title])

  // Calculate total question count (including sub-questions in scenarios)
  const getTotalQuestionCount = useCallback((questionsList: Question[]) => {
    return questionsList.reduce((total, question) => {
      if (question.type === "scenario" && question.subQuestions) {
        return total + question.subQuestions.length
      }
      return total + 1
    }, 0)
  }, [])

  // Create new question
  const createQuestion = useCallback(() => {
    const currentTotal = getTotalQuestionCount(questions)
    if (currentTotal >= 100) {
      alert("You have reached the maximum limit of 100 questions. Please remove some questions before adding more.")
      return false
    }

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "mcq_single",
      question: "",
      options: [
        { id: crypto.randomUUID(), text: "", correct: false },
        { id: crypto.randomUUID(), text: "", correct: false },
      ],
      marks: { correct: 1, wrong: 0, partial: 0 },
      images: [],
      solution: "",
    }

    setQuestions((prev) => [...prev, newQuestion])
    return true
  }, [questions, getTotalQuestionCount])

  // Update existing question
  const updateQuestion = useCallback((updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
  }, [])

  // Delete question
  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== questionId)
      console.log(`🗑️ Question deleted. Remaining: ${filtered.length}`)
      return filtered
    })
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

  // Add multiple questions (used for CSV import - appends)
  const addQuestions = useCallback((newQuestions: Question[]) => {
    setQuestions((prev) => [...prev, ...newQuestions])
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
    addQuestions,
    updateTitle,
    getTotalQuestionCount,
  }
}
