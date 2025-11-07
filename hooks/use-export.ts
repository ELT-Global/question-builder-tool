"use client"

import { useState, useCallback } from "react"
import { buildZip, downloadBlob } from "@/lib/zip"
import type { Question, ImageFilesMap } from "@/lib/types"

export function useExport(questions: Question[], imageFilesMap: ImageFilesMap) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const handleExport = useCallback(
    async (zipName: string) => {
      if (questions.length === 0) {
        alert("No questions to export")
        return
      }

      const blob = await buildZip(questions, imageFilesMap)
      downloadBlob(blob, `${zipName}.zip`)
    },
    [questions, imageFilesMap],
  )

  return {
    isExportModalOpen,
    setIsExportModalOpen,
    handleExport,
  }
}
