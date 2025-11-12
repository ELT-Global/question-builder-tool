"use client"

import { clearAllImagesFromDB, deleteImageFromDB, saveImageToDB } from "@/lib/indexeddb"
import type { ImageFilesMap, Question } from "@/lib/types"
import { useCallback, useEffect, useState } from "react"

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
        
        // Remove main question images
        question.images?.forEach((img) => {
          newMap.delete(img.id)
          deleteImageFromDB(img.id).catch((error) => {
            console.error("[v0] Failed to delete image from IndexedDB:", error)
          })
        })

        // Remove sub-question images for scenario type
        if (question.subQuestions) {
          question.subQuestions.forEach((subQ) => {
            subQ.images?.forEach((img) => {
              newMap.delete(img.id)
              deleteImageFromDB(img.id).catch((error) => {
                console.error("[v0] Failed to delete sub-question image from IndexedDB:", error)
              })
            })
          })
        }

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

  const replaceAllImages = useCallback(async (newImageMap: ImageFilesMap) => {
    // Clear existing images
    await clearAllImagesFromDB().catch((error) => {
      console.error("[v0] Failed to clear images from IndexedDB:", error)
    })

    // Set new image map
    setImageFilesMap(newImageMap)

    // Save all new images to IndexedDB
    const savePromises: Promise<void>[] = []
    for (const [imageId, file] of newImageMap) {
      savePromises.push(
        saveImageToDB(imageId, file).catch((error) => {
          console.error(`[v0] Failed to save image ${imageId} to IndexedDB:`, error)
        }),
      )
    }
    await Promise.all(savePromises)
  }, [])

  return {
    imageFilesMap,
    addImagesToMap,
    removeImageFromMap,
    removeImagesForQuestion,
    clearAllImages,
    replaceAllImages,
    isLoadingImages,
  }
}
