/**
 * usePageHandlers Hook
 * Centralizes all event handlers for the main page
 */

import type { Question } from "@/lib/types"
import { useEffect } from "react"

interface UsePageHandlersProps {
  // Questions data
  questions: Question[]
  title: string
  
  // Question actions
  updateQuestion: (question: Question) => void
  deleteQuestion: (questionId: string) => void
  addQuestions: (questions: Question[]) => void
  clearAll: () => void
  updateTitle: (title: string) => void
  getTotalQuestionCount: (questions: Question[]) => number
  
  // Image actions
  removeImageFromMap: (imageId: string) => void
  clearAllImages: () => void
  
  // Modal states
  showTitlePrompt: boolean
  setShowTitlePrompt: (show: boolean) => void
  setIsTitleDialogOpen: (open: boolean) => void
  setIsClearAllDialogOpen: (open: boolean) => void
  setIsCSVImportModalOpen: (open: boolean) => void
  
  // Validation
  setValidationErrors: (errors: any[]) => void
  setShowValidationDialog: (show: boolean) => void
}

export function usePageHandlers({
  questions,
  title,
  updateQuestion,
  deleteQuestion,
  addQuestions,
  clearAll,
  updateTitle,
  getTotalQuestionCount,
  removeImageFromMap,
  clearAllImages,
  showTitlePrompt,
  setShowTitlePrompt,
  setIsTitleDialogOpen,
  setIsClearAllDialogOpen,
  setIsCSVImportModalOpen,
  setValidationErrors,
  setShowValidationDialog,
}: UsePageHandlersProps) {
  
  // Show title prompt when creating first question
  useEffect(() => {
    if (questions.length === 1 && !title && !showTitlePrompt) {
      setShowTitlePrompt(true)
      setIsTitleDialogOpen(true)
    }
  }, [questions.length, title, showTitlePrompt, setShowTitlePrompt, setIsTitleDialogOpen])

  // Handle title dialog close - set default if closed without saving on first question
  const handleTitleDialogClose = (open: boolean) => {
    if (!open && showTitlePrompt && !title) {
      // User closed the dialog on first question without setting a title
      updateTitle("Section 1")
      setShowTitlePrompt(false)
    }
    setIsTitleDialogOpen(open)
  }

  // Handle question deletion with image cleanup
  const handleDeleteQuestion = (questionId: string) => {
    // First, find the question to clean up its images
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      // Remove main question images
      question.images?.forEach((img) => {
        removeImageFromMap(img.id)
      })

      // Remove sub-question images for scenario type
      if (question.subQuestions) {
        question.subQuestions.forEach((subQ) => {
          subQ.images?.forEach((img) => {
            removeImageFromMap(img.id)
          })
        })
      }
    }
    
    // Then delete the question
    deleteQuestion(questionId)
  }

  // Handle image removal
  const handleImageRemove = (questionId: string, imageId: string) => {
    removeImageFromMap(imageId)
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      updateQuestion({
        ...question,
        images: question.images?.filter((img) => img.id !== imageId),
      })
    }
  }

  // Handle clear all with image cleanup
  const handleClearAll = () => {
    clearAll()
    clearAllImages()
    setIsClearAllDialogOpen(false)
  }

  // Handle title save
  const handleTitleSave = (newTitle: string) => {
    const finalTitle = newTitle.trim() || "Section 1"
    updateTitle(finalTitle)
    setShowTitlePrompt(false)
  }

  // Handle validation errors from export
  const handleValidationError = (errors: any[]) => {
    setValidationErrors(errors)
    setShowValidationDialog(true)
  }

  // Handle CSV import completion
  const handleCSVImportComplete = (importedQuestions: Question[]) => {
    const currentTotal = getTotalQuestionCount(questions)
    const importTotal = getTotalQuestionCount(importedQuestions)
    const newTotal = currentTotal + importTotal

    // Validate 100 question limit
    if (newTotal > 100) {
      const remainingSpace = 100 - currentTotal
      alert(
        `Cannot import ${importTotal} questions. You currently have ${currentTotal} questions.\n\n` +
        `Maximum limit is 100 questions. You can only import ${remainingSpace} more question${remainingSpace === 1 ? '' : 's'}.\n\n` +
        `Please remove some existing questions or reduce the number of questions in your CSV file.`
      )
      return
    }

    addQuestions(importedQuestions)
    setIsCSVImportModalOpen(false)
  }

  return {
    handleTitleDialogClose,
    handleDeleteQuestion,
    handleImageRemove,
    handleClearAll,
    handleTitleSave,
    handleValidationError,
    handleCSVImportComplete,
  }
}
