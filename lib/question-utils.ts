/**
 * Question utility functions
 * Helper functions for question manipulation and validation
 */

import type { Question, QuestionType } from "./types"

/**
 * Check if a question type is MCQ
 */
export function isMCQType(type: QuestionType): boolean {
  return type === "mcq_single" || type === "mcq_multiple"
}

/**
 * Check if a question type is scenario
 */
export function isScenarioType(type: QuestionType): boolean {
  return type === "scenario"
}

/**
 * Get question type display name
 */
export function getQuestionTypeLabel(type: QuestionType, isScenario?: boolean): string {
  if (isScenario) {
    return "Scenario Description"
  }
  return "Question Text"
}

/**
 * Get placeholder text for question prompt
 */
export function getQuestionPromptPlaceholder(type: QuestionType): string {
  return type === "scenario" ? "Describe the scenario..." : "Enter your question here..."
}

/**
 * Check if options can be added (max 10)
 */
export function canAddOption(currentCount: number): boolean {
  return currentCount < 10
}

/**
 * Check if scenario can add more sub-questions (max 5)
 */
export function canAddSubQuestions(currentCount: number): boolean {
  return currentCount < 5
}

/**
 * Check if images can be added to scenario (max 2)
 */
export function canAddImages(currentCount: number): boolean {
  return currentCount < 2
}

/**
 * Validate if a question has required fields filled
 */
export function hasRequiredFields(question: Question): boolean {
  if (!question.question.trim()) return false

  if (isMCQType(question.type)) {
    if (!question.options || question.options.length === 0) return false
    if (!question.options.some((opt) => opt.correct)) return false
    if (question.marks.correct <= 0) return false
  }

  if (isScenarioType(question.type)) {
    if (!question.subQuestions || question.subQuestions.length === 0) return false
  }

  return true
}

/**
 * Get the count of options in a question
 */
export function getOptionCount(question: Question): number {
  return question.options?.length || 0
}

/**
 * Get the count of sub-questions in a scenario
 */
export function getSubQuestionCount(question: Question): number {
  return question.subQuestions?.length || 0
}

/**
 * Get the count of images in a question
 */
export function getImageCount(question: Question): number {
  return question.images?.length || 0
}

/**
 * Check if a question has any content
 */
export function hasQuestionContent(question: Question): boolean {
  const hasOptions = getOptionCount(question) > 0
  const hasQuestionText = question.question.trim().length > 0
  const hasSubQuestions = getSubQuestionCount(question) > 0
  return hasOptions || hasQuestionText || hasSubQuestions
}
