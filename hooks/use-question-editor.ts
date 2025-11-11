/**
 * Custom hook for QuestionEditor component
 * Manages question state and business logic
 */

"use client"

import type { ImageMeta, Option, Question, QuestionType, SubQuestion } from "@/lib/types"
import { useEffect, useState } from "react"

interface UseQuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  allQuestions: Question[]
}

export function useQuestionEditor({ question, onUpdate, allQuestions }: UseQuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState<Question>(question)
  const [hasContent, setHasContent] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [pendingType, setPendingType] = useState<QuestionType | null>(null)

  // Sync with prop changes
  useEffect(() => {
    setLocalQuestion(question)
  }, [question])

  // Check if question has content
  useEffect(() => {
    const hasOptions = (localQuestion.options?.length || 0) > 0
    const hasPrompt = localQuestion.prompt.trim().length > 0
    const hasSubQuestions = (localQuestion.subQuestions?.length || 0) > 0
    setHasContent(hasOptions || hasPrompt || hasSubQuestions)
  }, [localQuestion.options, localQuestion.prompt, localQuestion.subQuestions])

  // Update a field in the question
  const updateField = <K extends keyof Question>(field: K, value: Question[K]) => {
    const updated = { ...localQuestion, [field]: value }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  // Update marks
  const updateMarks = (field: "positive" | "negative" | "partial", value: string) => {
    const numValue = Number.parseFloat(value) || 0
    const updated = {
      ...localQuestion,
      marks: { ...localQuestion.marks, [field]: numValue },
    }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  // Add a new option
  const addOption = () => {
    const currentOptions = localQuestion.options || []
    if (currentOptions.length >= 10) {
      alert("You can only add a maximum of 10 options per question.")
      return
    }
    const newOption: Option = {
      id: crypto.randomUUID(),
      text: "",
      correct: false,
    }
    const options = [...currentOptions, newOption]
    updateField("options", options)
  }

  // Update an option
  const updateOption = (optionId: string, field: keyof Option, value: string | boolean) => {
    if (field === "correct" && value === true && localQuestion.type === "mcq_single") {
      // For single choice, uncheck all others
      const options =
        localQuestion.options?.map((opt) => ({
          ...opt,
          correct: opt.id === optionId,
        })) || []
      updateField("options", options)
    } else {
      const options =
        localQuestion.options?.map((opt) => (opt.id === optionId ? { ...opt, [field]: value } : opt)) || []
      updateField("options", options)
    }
  }

  // Remove an option
  const removeOption = (optionId: string) => {
    const options = localQuestion.options?.filter((opt) => opt.id !== optionId) || []
    updateField("options", options)
  }

  // Handle images change
  const handleImagesChange = (newImages: ImageMeta[], files: File[]) => {
    const updated = {
      ...localQuestion,
      images: [...(localQuestion.images || []), ...newImages],
    }
    setLocalQuestion(updated)
    onUpdate(updated)
    return newImages.map((meta, index) => ({ meta, file: files[index] }))
  }

  // Generate sub-questions for scenario
  const generateSubQuestions = () => {
    const count = localQuestion.scenarioQuestionCount || 0
    
    // Validate max sub-questions per scenario
    if (count > 5) {
      alert("A scenario can have a maximum of 5 sub-questions.")
      updateField("scenarioQuestionCount", 5)
      return
    }

    // Calculate total questions excluding current scenario's sub-questions
    const otherQuestionsTotal = allQuestions.reduce((total, q) => {
      if (q.id === question.id) return total
      if (q.type === "scenario" && q.subQuestions) {
        return total + q.subQuestions.length
      }
      return total + 1
    }, 0)

    const newTotal = otherQuestionsTotal + count

    // Validate total question limit
    if (newTotal > 100) {
      const maxAllowed = 100 - otherQuestionsTotal
      alert(
        `Adding ${count} sub-questions would exceed the maximum limit of 100 total questions. You can add a maximum of ${maxAllowed} sub-questions to stay within the limit.`
      )
      return
    }

    // Create sub-questions
    const subQuestions: SubQuestion[] = Array.from({ length: count }, () => ({
      id: crypto.randomUUID(),
      type: "mcq_single",
      prompt: "",
      options: [],
      marks: { positive: 1, negative: 0, partial: 0 },
    }))
    updateField("subQuestions", subQuestions)
  }

  // Update a sub-question
  const updateSubQuestion = (updatedSubQuestion: SubQuestion) => {
    const subQuestions =
      localQuestion.subQuestions?.map((sq) => (sq.id === updatedSubQuestion.id ? updatedSubQuestion : sq)) || []
    updateField("subQuestions", subQuestions)
  }

  // Delete a sub-question
  const deleteSubQuestion = (subQuestionId: string) => {
    const subQuestions = localQuestion.subQuestions?.filter((sq) => sq.id !== subQuestionId) || []
    updateField("subQuestions", subQuestions)
  }

  // Reset question to default state
  const resetQuestion = () => {
    const resetQuestion: Question = {
      ...localQuestion,
      type: pendingType || localQuestion.type,
      prompt: "",
      options: [],
      explanation: "",
      scenarioQuestionCount: undefined,
      subQuestions: undefined,
    }
    setLocalQuestion(resetQuestion)
    onUpdate(resetQuestion)
    setShowResetConfirm(false)
    setPendingType(null)
  }

  // Handle question type change
  const handleTypeChange = (newType: QuestionType) => {
    if (hasContent && localQuestion.type !== newType) {
      setPendingType(newType)
      setShowResetConfirm(true)
    } else {
      updateField("type", newType)
    }
  }

  return {
    localQuestion,
    hasContent,
    showResetConfirm,
    setShowResetConfirm,
    pendingType,
    setPendingType,
    updateField,
    updateMarks,
    addOption,
    updateOption,
    removeOption,
    handleImagesChange,
    generateSubQuestions,
    updateSubQuestion,
    deleteSubQuestion,
    resetQuestion,
    handleTypeChange,
  }
}
