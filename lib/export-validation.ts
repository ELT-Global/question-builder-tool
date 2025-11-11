/**
 * Export Validation Utility
 * Validates all questions before export to ensure data completeness
 */

import type { Question, SubQuestion } from "./types"

export interface ValidationError {
  questionIndex: number
  questionId: string
  questionType: string
  field: string
  message: string
  subQuestionIndex?: number
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: string[]
}

/**
 * Validate a single option
 */
function validateOption(
  option: { id: string; text: string; correct: boolean },
  optionIndex: number,
  questionIndex: number,
  questionId: string,
  questionType: string,
  errors: ValidationError[],
  subQuestionIndex?: number,
) {
  if (!option.text || option.text.trim() === "") {
    errors.push({
      questionIndex,
      questionId,
      questionType,
      field: `Option ${optionIndex + 1}`,
      message: `Option ${optionIndex + 1} text is empty`,
      subQuestionIndex,
    })
  }
}

/**
 * Validate MCQ question options
 */
function validateMCQOptions(
  question: Question | SubQuestion,
  questionIndex: number,
  questionId: string,
  questionType: string,
  errors: ValidationError[],
  subQuestionIndex?: number,
) {
  const options = question.options || []

  // Check if options exist
  if (options.length === 0) {
    errors.push({
      questionIndex,
      questionId,
      questionType,
      field: "Options",
      message: "No options added",
      subQuestionIndex,
    })
    return
  }

  // Validate each option
  options.forEach((option, index) => {
    validateOption(option, index, questionIndex, questionId, questionType, errors, subQuestionIndex)
  })

  // Check if at least one option is marked as correct
  const hasCorrectAnswer = options.some((opt) => opt.correct)
  if (!hasCorrectAnswer) {
    errors.push({
      questionIndex,
      questionId,
      questionType,
      field: "Correct Answer",
      message: "No correct answer selected",
      subQuestionIndex,
    })
  }

  // For single choice, ensure only one is correct
  if (question.type === "mcq_single") {
    const correctCount = options.filter((opt) => opt.correct).length
    if (correctCount > 1) {
      errors.push({
        questionIndex,
        questionId,
        questionType,
        field: "Correct Answer",
        message: "Multiple answers selected for single choice question",
        subQuestionIndex,
      })
    }
  }
}

/**
 * Validate marks
 */
function validateMarks(
  question: Question | SubQuestion,
  questionIndex: number,
  questionId: string,
  questionType: string,
  errors: ValidationError[],
  subQuestionIndex?: number,
) {
  const marks = question.marks

  // Correct marks must be set and > 0
  if (!marks.correct || marks.correct <= 0) {
    errors.push({
      questionIndex,
      questionId,
      questionType,
      field: "Correct Marks",
      message: "Correct marks must be greater than 0",
      subQuestionIndex,
    })
  }

  // Wrong marks should be 0 or positive value (not negative)
  if (marks.wrong && marks.wrong < 0) {
    errors.push({
      questionIndex,
      questionId,
      questionType,
      field: "Wrong Marks",
      message: "Wrong marks should be 0 or positive value",
      subQuestionIndex,
    })
  }

  // Partial marks validation for multiple choice
  if (question.type === "mcq_multiple" && marks.partial) {
    if (marks.partial < 0 || marks.partial > marks.correct) {
      errors.push({
        questionIndex,
        questionId,
        questionType,
        field: "Partial Marks",
        message: "Partial marks should be between 0 and correct marks",
        subQuestionIndex,
      })
    }
  }
}

/**
 * Validate a single sub-question
 */
function validateSubQuestion(
  subQuestion: SubQuestion,
  subQuestionIndex: number,
  questionIndex: number,
  questionId: string,
  errors: ValidationError[],
) {
  // Validate question text
  if (!subQuestion.question || subQuestion.question.trim() === "") {
    errors.push({
      questionIndex,
      questionId,
      questionType: "scenario-sub",
      field: "Question Text",
      message: "Question text is empty",
      subQuestionIndex,
    })
  }

  // Validate options
  validateMCQOptions(subQuestion, questionIndex, questionId, "scenario-sub", errors, subQuestionIndex)

  // Validate marks
  validateMarks(subQuestion, questionIndex, questionId, "scenario-sub", errors, subQuestionIndex)
}

/**
 * Validate a single question
 */
function validateQuestion(question: Question, questionIndex: number, errors: ValidationError[]) {
  const questionType = question.type

  // Validate question text
  if (!question.question || question.question.trim() === "") {
    errors.push({
      questionIndex,
      questionId: question.id,
      questionType,
      field: "Question Text",
      message: questionType === "scenario" ? "Scenario description is empty" : "Question text is empty",
    })
  }

  // Validate based on question type
  if (questionType === "mcq_single" || questionType === "mcq_multiple") {
    // Validate MCQ options
    validateMCQOptions(question, questionIndex, question.id, questionType, errors)

    // Validate marks
    validateMarks(question, questionIndex, question.id, questionType, errors)
  } else if (questionType === "scenario") {
    // Validate sub-questions
    const subQuestions = question.subQuestions || []

    if (subQuestions.length === 0) {
      errors.push({
        questionIndex,
        questionId: question.id,
        questionType,
        field: "Sub-Questions",
        message: "No sub-questions added to scenario",
      })
    } else {
      // Validate each sub-question
      subQuestions.forEach((subQuestion, subIndex) => {
        validateSubQuestion(subQuestion, subIndex, questionIndex, question.id, errors)
      })
    }

    // Validate scenario question count matches sub-questions
    if (question.scenarioQuestionCount && question.scenarioQuestionCount !== subQuestions.length) {
      errors.push({
        questionIndex,
        questionId: question.id,
        questionType,
        field: "Sub-Questions Count",
        message: `Expected ${question.scenarioQuestionCount} sub-questions, but found ${subQuestions.length}`,
      })
    }
  }
}

/**
 * Main validation function - validates all questions before export
 */
export function validateQuestionsForExport(questions: Question[]): ValidationResult {
  const errors: ValidationError[] = []

  // Check if there are any questions
  if (questions.length === 0) {
    return {
      valid: false,
      errors: [
        {
          questionIndex: -1,
          questionId: "",
          questionType: "",
          field: "Questions",
          message: "No questions to export",
        },
      ],
    }
  }

  // Validate each question
  questions.forEach((question, index) => {
    validateQuestion(question, index, errors)
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Format validation errors into a readable message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return ""

  const errorMessages = errors.map((error) => {
    const questionLabel = error.questionType === "scenario" ? "Scenario" : "Question"
    const location =
      error.subQuestionIndex !== undefined
        ? `${questionLabel} ${error.questionIndex + 1}, Sub-Question ${error.subQuestionIndex + 1}`
        : `${questionLabel} ${error.questionIndex + 1}`

    return `${location}: ${error.field} - ${error.message}`
  })

  return errorMessages.join("\n")
}

/**
 * Group validation errors by question for better display
 */
export function groupErrorsByQuestion(errors: ValidationError[]): Map<number, ValidationError[]> {
  const grouped = new Map<number, ValidationError[]>()

  errors.forEach((error) => {
    const existing = grouped.get(error.questionIndex) || []
    existing.push(error)
    grouped.set(error.questionIndex, existing)
  })

  return grouped
}
