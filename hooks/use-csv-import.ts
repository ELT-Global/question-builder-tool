/**
 * Custom hook for managing CSV import workflow and state
 */

"use client"

import { csvToQuestions, readCSVFile, validateCSVFile } from "@/lib/csv-import"
import { importFromGoogleSheets, validateGoogleSheetsUrl } from "@/lib/google-sheets-import"
import type { Question } from "@/lib/types"
import { useCallback, useState } from "react"

type ImportSource = "file" | "link"

interface ImportState {
  selectedFile: File | null
  googleSheetsUrl: string
  previewQuestions: Question[]
  error: string | null
  warnings: string[]
  isProcessing: boolean
  showPreview: boolean
  activeTab: ImportSource
}

export function useCSVImportState() {
  const [state, setState] = useState<ImportState>({
    selectedFile: null,
    googleSheetsUrl: "",
    previewQuestions: [],
    error: null,
    warnings: [],
    isProcessing: false,
    showPreview: false,
    activeTab: "file",
  })

  // Reset all state
  const resetState = useCallback(() => {
    setState({
      selectedFile: null,
      googleSheetsUrl: "",
      previewQuestions: [],
      error: null,
      warnings: [],
      isProcessing: false,
      showPreview: false,
      activeTab: "file",
    })
  }, [])

  // Reset to input state (keep tab)
  const resetToInput = useCallback(() => {
    setState((prev) => ({
      ...prev,
      previewQuestions: [],
      showPreview: false,
      error: null,
      warnings: [],
    }))
  }, [])

  // Set active tab
  const setActiveTab = useCallback((tab: ImportSource) => {
    setState((prev) => ({ ...prev, activeTab: tab }))
  }, [])

  // Set Google Sheets URL
  const setGoogleSheetsUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, googleSheetsUrl: url }))
  }, [])

  // Handle CSV file selection and processing
  const processCSVFile = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      error: null,
      warnings: [],
      previewQuestions: [],
      showPreview: false,
    }))

    // Validate file
    const validation = validateCSVFile(file)
    if (!validation.valid) {
      setState((prev) => ({ ...prev, error: validation.error || "Invalid file" }))
      return
    }

    setState((prev) => ({ ...prev, selectedFile: file, isProcessing: true }))

    try {
      // Read and parse CSV
      const content = await readCSVFile(file)
      const result = csvToQuestions(content)

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          error: result.error || "Failed to parse CSV",
          warnings: result.warnings || [],
          isProcessing: false,
        }))
        return
      }

      // Show preview
      setState((prev) => ({
        ...prev,
        previewQuestions: result.questions || [],
        warnings: result.warnings || [],
        showPreview: true,
        isProcessing: false,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to process CSV",
        isProcessing: false,
      }))
    }
  }, [])

  // Handle Google Sheets URL import
  const processGoogleSheetsUrl = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      error: null,
      warnings: [],
      previewQuestions: [],
      showPreview: false,
    }))

    // Validate URL
    const validation = validateGoogleSheetsUrl(state.googleSheetsUrl)
    if (!validation.valid) {
      setState((prev) => ({
        ...prev,
        error: validation.error || "Invalid Google Sheets URL",
      }))
      return
    }

    setState((prev) => ({ ...prev, isProcessing: true }))

    try {
      const result = await importFromGoogleSheets(state.googleSheetsUrl)

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          error: result.error || "Failed to import from Google Sheets",
          warnings: result.warnings || [],
          isProcessing: false,
        }))
        return
      }

      // Show preview
      setState((prev) => ({
        ...prev,
        previewQuestions: result.questions || [],
        warnings: result.warnings || [],
        showPreview: true,
        isProcessing: false,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to import from Google Sheets",
        isProcessing: false,
      }))
    }
  }, [state.googleSheetsUrl])

  return {
    state,
    resetState,
    resetToInput,
    setActiveTab,
    setGoogleSheetsUrl,
    processCSVFile,
    processGoogleSheetsUrl,
  }
}

/**
 * Simple hook for modal open/close state
 * Used by parent components to control the modal visibility
 */
export function useCSVImport() {
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState(false)

  return {
    isCSVImportModalOpen,
    setIsCSVImportModalOpen,
  }
}
