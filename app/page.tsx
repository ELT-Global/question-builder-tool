"use client"

import { ExportModal } from "@/components/export-modal"
import { ImportConfirmationDialog } from "@/components/import-confirmation-dialog"
import { ImportModal } from "@/components/import-modal"
import { QuestionEditor } from "@/components/question-editor"
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
import { Button } from "@/components/ui/button"
import { useExport } from "@/hooks/use-export"
import { useImageFiles } from "@/hooks/use-image-files"
import { useImport } from "@/hooks/use-import"
import { useQuestions } from "@/hooks/use-questions"
import { Download, Edit2, FileText, Plus, Trash2, Upload } from "lucide-react"
import { useEffect, useState } from "react"

export default function QuestionAuthoringPage() {
  const {
    questions,
    title,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearAll,
    replaceAllQuestions,
    updateTitle,
  } = useQuestions()
  const {
    imageFilesMap,
    addImagesToMap,
    removeImageFromMap,
    removeImagesForQuestion,
    clearAllImages,
    replaceAllImages,
    isLoadingImages,
  } = useImageFiles(questions)
  const { isExportModalOpen, setIsExportModalOpen, handleExport } = useExport(questions, imageFilesMap, title)

  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false)
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false)
  const [showTitlePrompt, setShowTitlePrompt] = useState(false)

  // Import hook
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
      replaceAllImages(importedImages).then(() => {
        replaceAllQuestions(importedQuestions, importedTitle)
      })
    },
  })

  // Show title prompt when creating first question
  useEffect(() => {
    if (questions.length === 1 && !title && !showTitlePrompt) {
      setShowTitlePrompt(true)
      setIsTitleDialogOpen(true)
    }
  }, [questions.length, title, showTitlePrompt])

  // Handle question deletion with image cleanup
  const handleDeleteQuestion = (questionId: string) => {
    removeImagesForQuestion(questionId)
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
    updateTitle(newTitle)
    setShowTitlePrompt(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              {/* <Image src="triple-i-logo.svg" alt="Logo" width={150} height={150} /> */}
              <p className="m-0 p-0 text-xs text-muted-foreground">Create and export exam questions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* <TooltipProvider>
              <Tooltip content="Remove all questions"> */}
                <Button
                title="Remove all questions"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClearAllDialogOpen(true)}
                  disabled={questions.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              {/* </Tooltip>
              <Tooltip content="Import questions from ZIP"> */}
                <Button title="Import questions from ZIP" variant="outline" size="sm" onClick={handleImportClick}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import ZIP
                </Button>
              {/* </Tooltip>
              <Tooltip content="Download questions as ZIP"> */}
                <Button
                  title="Download questions as ZIP"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={questions.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export ZIP
                </Button>
              {/* </Tooltip>
              <Tooltip content="Add a new question"> */}
                <Button onClick={createQuestion} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              {/* </Tooltip>
            </TooltipProvider> */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoadingImages && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Restoring images from storage...</p>
            </div>
          </div>
        )}

        {!isLoadingImages && questions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">No questions yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">Create your first question to get started</p>
            <Button onClick={createQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        )}

        {!isLoadingImages && questions.length > 0 && (
          <div className="space-y-6">
            {/* Title Section */}
            <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
              {title ? (
                <div className="flex items-center justify-between gap-3 flex-1">
                  <div className="max-w-324 w-full overflow-x-auto scrollbar-thin">
                    <p className="text-muted-foreground">Question Set Title</p>
                    <h1 className="text-2xl font-bold">{title}</h1>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTitleDialogOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsTitleDialogOpen(true)}
                  className="w-full justify-start text-muted-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add a title for this question set
                </Button>
              )}
            </div>

            {/* Questions */}
            {questions.map((question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={updateQuestion}
                onDelete={handleDeleteQuestion}
                onImagesAdd={addImagesToMap}
                onImageRemove={handleImageRemove}
                imageFilesMap={imageFilesMap}
              />
            ))}
          </div>
        )}
      </main>

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        questionCount={questions.length}
        title={title}
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

      <TitleDialog
        open={isTitleDialogOpen}
        onOpenChange={setIsTitleDialogOpen}
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
