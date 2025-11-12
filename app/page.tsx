"use client"

import { CSVImportModal } from "@/components/csv-import-modal"
import { EmptyState } from "@/components/empty-state"
import { ExportModal } from "@/components/export-modal"
import { ImportConfirmationDialog } from "@/components/import-confirmation-dialog"
import { ImportModal } from "@/components/import-modal"
import { LoadingState } from "@/components/loading-state"
import { PageHeader } from "@/components/page-header"
import { QuestionCountBadge } from "@/components/question-count-badge"
import { QuestionSetHeader } from "@/components/question-set-header"
import { QuestionsList } from "@/components/questions-list"
import { TitleDialog } from "@/components/title-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ValidationErrorsDialog } from "@/components/validation-errors-dialog"
import { useCSVImport } from "@/hooks/use-csv-import"
import { useExport } from "@/hooks/use-export"
import { useImageFiles } from "@/hooks/use-image-files"
import { useImport } from "@/hooks/use-import"
import { usePageHandlers } from "@/hooks/use-page-handlers"
import { useQuestions } from "@/hooks/use-questions"
import { useState } from "react"

export default function QuestionAuthoringPage() {
  const {
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
  } = useQuestions()

  const totalQuestionCount = getTotalQuestionCount(questions)
  const {
    imageFilesMap,
    addImagesToMap,
    removeImageFromMap,
    clearAllImages,
    replaceAllImages,
    isLoadingImages,
  } = useImageFiles(questions)
  const { isExportModalOpen, setIsExportModalOpen, handleExport } = useExport(questions, imageFilesMap, title)

  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false)
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false)
  const [showTitlePrompt, setShowTitlePrompt] = useState(false)
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [showValidationDialog, setShowValidationDialog] = useState(false)

  // ZIP Import hook
  const {
    isImportModalOpen,
    setIsImportModalOpen,
    showOverwriteWarning,
    setShowOverwriteWarning,
    importState,
    pendingFile,
    handleImportClick,
    confirmOverwrite,
    cancelImport,
    processZipFile,
  } = useImport({
    existingQuestions: questions,
    onImportComplete: (importedQuestions, importedImages, importedTitle) => {
      // Calculate total questions in import
      const importTotal = getTotalQuestionCount(importedQuestions)
      
      // For ZIP import, we replace all questions, so just check if import exceeds 100
      if (importTotal > 100) {
        alert(
          `Cannot import ZIP file. The file contains ${importTotal} questions, which exceeds the maximum limit of 100 questions.\n\n` +
          `Please reduce the number of questions in the ZIP file before importing.`
        )
        setIsImportModalOpen(false)
        return
      }

      replaceAllImages(importedImages).then(() => {
        replaceAllQuestions(importedQuestions, importedTitle)
      })
    },
  })

  // CSV Import hook
  const { isCSVImportModalOpen, setIsCSVImportModalOpen } = useCSVImport()

  // Centralized event handlers
  const {
    handleTitleDialogClose,
    handleDeleteQuestion,
    handleImageRemove,
    handleClearAll,
    handleTitleSave,
    handleValidationError,
    handleCSVImportComplete,
  } = usePageHandlers({
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
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation and actions */}
      <PageHeader
        questionsCount={questions.length}
        onCreateQuestion={createQuestion}
        onClearAll={() => setIsClearAllDialogOpen(true)}
        onImportZIP={handleImportClick}
        onImportCSV={() => setIsCSVImportModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
      />

      {/* Main content area */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading state */}
        {isLoadingImages && <LoadingState />}

        {/* Empty state */}
        {!isLoadingImages && questions.length === 0 && <EmptyState onCreateQuestion={createQuestion} />}

        {/* Questions list */}
        {!isLoadingImages && questions.length > 0 && (
          <div className="space-y-6">
            <QuestionSetHeader title={title} onEditTitle={() => setIsTitleDialogOpen(true)} />
            <QuestionCountBadge totalCount={totalQuestionCount} />
            <QuestionsList
              questions={questions}
              onUpdate={updateQuestion}
              onDelete={handleDeleteQuestion}
              onImagesAdd={addImagesToMap}
              onImageRemove={handleImageRemove}
              imageFilesMap={imageFilesMap}
              totalQuestionCount={totalQuestionCount}
            />
          </div>
        )}
      </main>

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        onValidationError={handleValidationError}
        questions={questions}
        questionCount={questions.length}
        title={title}
      />

      <ValidationErrorsDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        errors={validationErrors}
      />

      <ImportModal
        open={isImportModalOpen}
        onOpenChange={(open) => {
          setIsImportModalOpen(open)
          if (!open) cancelImport()
        }}
        onImport={processZipFile}
        importState={importState}
        pendingFile={pendingFile}
      />

      <ImportConfirmationDialog
        open={showOverwriteWarning}
        onOpenChange={setShowOverwriteWarning}
        onConfirm={confirmOverwrite}
        existingQuestionCount={questions.length}
      />

      <CSVImportModal
        open={isCSVImportModalOpen}
        onOpenChange={setIsCSVImportModalOpen}
        onImport={handleCSVImportComplete}
      />

      <TitleDialog
        open={isTitleDialogOpen}
        onOpenChange={handleTitleDialogClose}
        onSave={handleTitleSave}
        initialTitle={title}
        isFirstQuestion={showTitlePrompt}
      />

      <AlertDialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete all questions?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all questions and uploaded images. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Delete All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
