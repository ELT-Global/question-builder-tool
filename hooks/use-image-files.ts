"use client"

import { useState, useCallback, useEffect } from "react"
import type { ImageFilesMap, Question } from "@/lib/types"
import { saveImageToDB, deleteImageFromDB, clearAllImagesFromDB } from "@/lib/indexeddb"

export function useImageFiles(questions: Question[]) {
  const [imageFilesMap, setImageFilesMap] = useState<ImageFilesMap>(new Map())
  const [isLoadingImages, setIsLoadingImages] = useState(true)

  useEffect(() => {
    const loadImages = async () => {
      try {
        const { loadAllImagesFromDB } = await import("@/lib/indexeddb")
        const restoredImages = await loadAllImagesFromDB()
        setImageFilesMap(restoredImages)
      } catch (error) {
        console.error("[v0] Failed to restore images from IndexedDB:", error)
      } finally {
        setIsLoadingImages(false)
      }
    }

    loadImages()
  }, [])

  const addImagesToMap = useCallback((imageMetaWithFiles: Array<{ meta: any; file: File }>) => {
    setImageFilesMap((prev) => {
      const newMap = new Map(prev)
      imageMetaWithFiles.forEach(({ meta, file }) => {
        newMap.set(meta.id, file)
        saveImageToDB(meta.id, file).catch((error) => {
          console.error("[v0] Failed to save image to IndexedDB:", error)
        })
      })
      return newMap
    })
  }, [])

  const removeImageFromMap = useCallback((imageId: string) => {
    setImageFilesMap((prev) => {
      const newMap = new Map(prev)
      newMap.delete(imageId)
      deleteImageFromDB(imageId).catch((error) => {
        console.error("[v0] Failed to delete image from IndexedDB:", error)
      })
      return newMap
    })
  }, [])

  const removeImagesForQuestion = useCallback(
    (questionId: string) => {
      const question = questions.find((q) => q.id === questionId)
      if (!question) return

      setImageFilesMap((prev) => {
        const newMap = new Map(prev)
        question.images?.forEach((img) => {
          newMap.delete(img.id)
          deleteImageFromDB(img.id).catch((error) => {
            console.error("[v0] Failed to delete image from IndexedDB:", error)
          })
        })
        return newMap
      })
    },
    [questions],
  )

  const clearAllImages = useCallback(() => {
    setImageFilesMap(new Map())
    clearAllImagesFromDB().catch((error) => {
      console.error("[v0] Failed to clear images from IndexedDB:", error)
    })
  }, [])

  return {
    imageFilesMap,
    addImagesToMap,
    removeImageFromMap,
    removeImagesForQuestion,
    clearAllImages,
    isLoadingImages,
  }
}
