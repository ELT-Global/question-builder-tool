"use client"

import { ExportModal } from "@/components/export-modal"
import { QuestionEditor } from "@/components/question-editor"
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
import { Tooltip } from "@/components/ui/tooltip"
import { TooltipProvider } from "@/components/ui/tooltip-provider"; // New import for TooltipProvider
import { useExport } from "@/hooks/use-export"
import { useImageFiles } from "@/hooks/use-image-files"
import { useQuestions } from "@/hooks/use-questions"
import { Download, FileText, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export default function QuestionAuthoringPage() {
  const { questions, createQuestion, updateQuestion, deleteQuestion, clearAll } = useQuestions()
  const {
    imageFilesMap,
    addImagesToMap,
    removeImageFromMap,
    removeImagesForQuestion,
    clearAllImages,
    isLoadingImages,
  } = useImageFiles(questions)
  const { isExportModalOpen, setIsExportModalOpen, handleExport } = useExport(questions, imageFilesMap)

  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="items- flex flex-col ">
              <Image src="triple-i-logo.svg" alt="Logo" width={150} height={150}/>
              <p className="text-xs text-muted-foreground m-0 p-0">Create and export exam questions</p>
            </div>
            <div className="">
              {/* <h1 className="text-lg font-semibold m-0 p-0">Question Authoring</h1> */}
              
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              {" "}
              {/* New TooltipProvider wrapper */}
              <Tooltip content="Remove all questions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClearAllDialogOpen(true)}
                  disabled={questions.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </Tooltip>
              <Tooltip content="Download questions as ZIP">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={questions.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export ZIP
                </Button>
              </Tooltip>
              <Tooltip content="Add a new question">
                <Button onClick={createQuestion} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </Tooltip>
            </TooltipProvider>{" "}
            {/* End of TooltipProvider wrapper */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoadingImages ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Restoring images from storage...</p>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">No questions yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">Create your first question to get started</p>
            <Button onClick={createQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
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
