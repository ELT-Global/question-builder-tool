/**
 * Custom hook for managing ZIP import workflow
 * Handles file processing, validation, progress tracking, and state management
 */

"use client"

import type { ImageFilesMap, ImportStage, ImportState, Question } from "@/lib/types"
import { validateZipFile } from "@/lib/validation"
import {
    extractImagesFromZip,
    extractZipFile,
    processImportedQuestions,
    remapImageFiles,
    validateImagesInZip,
    validateQuestionsJSON,
    validateZipStructure,
} from "@/lib/zip-import"
import { useCallback, useState } from "react"

const STAGE_MESSAGES: Record<ImportStage, string> = {
  idle: "",
  reading: "Reading ZIP file...",
  extracting: "Extracting contents...",
  "validating-json": "Validating question data...",
  "validating-images": "Scanning images...",
  processing: "Processing questions...",
  storing: "Saving to storage...",
  complete: "Import successful!",
  error: "Import failed",
}

interface UseImportProps {
  existingQuestions: Question[]
  onImportComplete: (questions: Question[], images: ImageFilesMap, title?: string) => void
}

export function useImport({ existingQuestions, onImportComplete }: UseImportProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const [importState, setImportState] = useState<ImportState>({
    stage: "idle",
    progress: 0,
    message: "",
  })

  // Update import progress
  const updateProgress = useCallback((stage: ImportStage, progress: number, error?: string) => {
    setImportState({
      stage,
      progress,
      message: STAGE_MESSAGES[stage],
      error,
    })
  }, [])

  // Handle import button click
  const handleImportClick = useCallback(() => {
    if (existingQuestions.length > 0) {
      setShowOverwriteWarning(true)
    } else {
      setIsImportModalOpen(true)
    }
  }, [existingQuestions.length])

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      if (existingQuestions.length > 0) {
        setPendingFile(file)
        setShowOverwriteWarning(true)
      } else {
        setPendingFile(file)
        setIsImportModalOpen(true)
      }
    },
    [existingQuestions.length],
  )

  // Confirm overwrite and proceed
  const confirmOverwrite = useCallback(() => {
    setShowOverwriteWarning(false)
    setIsImportModalOpen(true)
  }, [])

  // Cancel import
  const cancelImport = useCallback(() => {
    setIsImportModalOpen(false)
    setShowOverwriteWarning(false)
    setPendingFile(null)
    setImportState({
      stage: "idle",
      progress: 0,
      message: "",
    })
  }, [])

  // Process ZIP file
  const processZipFile = useCallback(
    async (file: File) => {
      try {
        // Stage 1: Validate file (10%)
        updateProgress("reading", 10)
        await new Promise((resolve) => setTimeout(resolve, 300)) // Small delay for UI

        const fileValidation = validateZipFile(file)
        if (!fileValidation.valid) {
          updateProgress("error", 10, fileValidation.error)
          return
        }

        // Stage 2: Extract ZIP (20%)
        updateProgress("extracting", 20)
        await new Promise((resolve) => setTimeout(resolve, 300))

        const zip = await extractZipFile(file)

        // Stage 3: Validate structure (30%)
        const structureValidation = validateZipStructure(zip)
        if (!structureValidation.valid) {
          updateProgress("error", 30, structureValidation.errors.join(", "))
          return
        }

        // Stage 4: Validate JSON (40%)
        updateProgress("validating-json", 40)
        await new Promise((resolve) => setTimeout(resolve, 300))

        const jsonValidation = await validateQuestionsJSON(zip)
        if (!jsonValidation.valid) {
          updateProgress("error", 40, jsonValidation.errors.join(", "))
          return
        }

        const exportData = jsonValidation.data!

        // Stage 5: Validate images (60%)
        updateProgress("validating-images", 60)
        await new Promise((resolve) => setTimeout(resolve, 300))

        const imageValidation = validateImagesInZip(zip, exportData.questions)
        if (!imageValidation.valid) {
          updateProgress("error", 60, imageValidation.errors.join(", "))
          return
        }

        // Stage 6: Process questions (75%)
        updateProgress("processing", 75)
        await new Promise((resolve) => setTimeout(resolve, 300))

        const processedQuestions = processImportedQuestions(exportData.questions)

        // Stage 7: Extract and remap images (85%)
        const originalImageMap = await extractImagesFromZip(zip, exportData.questions)
        const remappedImageMap = remapImageFiles(originalImageMap, exportData.questions, processedQuestions)

        // Stage 8: Store (90%)
        updateProgress("storing", 90)
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Stage 9: Complete (100%)
        updateProgress("complete", 100)
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Call completion handler
        onImportComplete(processedQuestions, remappedImageMap, exportData.meta.title)

        // Close modal after short delay
        setTimeout(() => {
          setIsImportModalOpen(false)
          setPendingFile(null)
          setImportState({
            stage: "idle",
            progress: 0,
            message: "",
          })
        }, 1000)
      } catch (error) {
        console.error("[Import] Failed to process ZIP:", error)
        updateProgress("error", importState.progress, error instanceof Error ? error.message : "Unknown error occurred")
      }
    },
    [importState.progress, onImportComplete, updateProgress],
  )

  return {
    isImportModalOpen,
    setIsImportModalOpen,
    showOverwriteWarning,
    setShowOverwriteWarning,
    importState,
    pendingFile,
    handleImportClick,
    handleFileSelect,
    confirmOverwrite,
    cancelImport,
    processZipFile,
  }
}
