"use client"

import type { ImageFilesMap, Question } from "@/lib/types"
import { buildZip, downloadBlob } from "@/lib/zip"
import { useCallback, useState } from "react"

export function useExport(questions: Question[], imageFilesMap: ImageFilesMap, title?: string) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const handleExport = useCallback(
    async (zipName: string) => {
      if (questions.length === 0) {
        alert("No questions to export")
        return
      }

      const blob = await buildZip(questions, imageFilesMap, title)
      downloadBlob(blob, `${zipName}.zip`)
    },
    [questions, imageFilesMap, title],
  )

  return {
    isExportModalOpen,
    setIsExportModalOpen,
    handleExport,
  }
}
