/**
 * QuestionsList Component
 * Renders list of question editors
 */

"use client"

import { QuestionEditor } from "@/components/question-editor"
import type { ImageMeta, Question } from "@/lib/types"

interface QuestionsListProps {
  questions: Question[]
  onUpdate: (question: Question) => void
  onDelete: (questionId: string) => void
  onImagesAdd: (imageMetaWithFiles: Array<{ meta: ImageMeta; file: File }>) => void
  onImageRemove: (questionId: string, imageId: string) => void
  imageFilesMap?: Map<string, File>
  totalQuestionCount: number
}

export function QuestionsList({
  questions,
  onUpdate,
  onDelete,
  onImagesAdd,
  onImageRemove,
  imageFilesMap,
  totalQuestionCount,
}: QuestionsListProps) {
  return (
    <>
      {questions.map((question) => (
        <QuestionEditor
          key={question.id}
          question={question}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onImagesAdd={onImagesAdd}
          onImageRemove={onImageRemove}
          imageFilesMap={imageFilesMap}
          totalQuestionCount={totalQuestionCount}
          allQuestions={questions}
        />
      ))}
    </>
  )
}
