/**
 * ZIP Import utilities
 * Handles ZIP file extraction, validation, and data processing
 */

import JSZip from "jszip"
import type { ExportData, ImageMeta, ImportValidationResult, Question } from "./types"
import { exportDataSchema } from "./validation"

/**
 * Extract and parse ZIP file
 */
export async function extractZipFile(file: File): Promise<JSZip> {
  const zip = new JSZip()
  const loadedZip = await zip.loadAsync(file)
  return loadedZip
}

/**
 * Validate ZIP structure (must have questions.json)
 */
export function validateZipStructure(zip: JSZip): ImportValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for questions.json
  const questionsFile = zip.file("questions.json")
  if (!questionsFile) {
    errors.push("Missing required file: questions.json")
    return { valid: false, errors, warnings }
  }

  // Check for images folder (optional but warn if missing)
  const imagesFolder = zip.folder("images")
  if (!imagesFolder) {
    warnings.push("No images folder found in ZIP")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate and parse questions.json content
 */
export async function validateQuestionsJSON(zip: JSZip): Promise<{
  valid: boolean
  data?: ExportData
  errors: string[]
}> {
  const errors: string[] = []

  try {
    const questionsFile = zip.file("questions.json")
    if (!questionsFile) {
      errors.push("questions.json file not found")
      return { valid: false, errors }
    }

    const content = await questionsFile.async("string")

    // Parse JSON
    let parsedData: unknown
    try {
      parsedData = JSON.parse(content)
    } catch {
      errors.push("Invalid JSON format in questions.json")
      return { valid: false, errors }
    }

    // Validate against schema
    const result = exportDataSchema.safeParse(parsedData)
    if (!result.success) {
      errors.push("Invalid data structure in questions.json")
      for (const err of result.error.errors) {
        errors.push(`${err.path.join(".")}: ${err.message}`)
      }
      return { valid: false, errors }
    }

    return {
      valid: true,
      data: result.data,
      errors: [],
    }
  } catch {
    errors.push("Failed to read questions.json")
    return { valid: false, errors }
  }
}

/**
 * Validate that all referenced images exist in ZIP
 */
export function validateImagesInZip(zip: JSZip, questions: Question[]): ImportValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const referencedImages = new Set<string>()

  // Collect all referenced images from questions
  const collectImages = (images?: ImageMeta[]) => {
    if (images) {
      for (const img of images) {
        referencedImages.add(img.id)
      }
    }
  }

  for (const question of questions) {
    collectImages(question.images)

    // Check sub-questions for scenario types
    if (question.subQuestions) {
      for (const subQ of question.subQuestions) {
        collectImages(subQ.images)
      }
    }
  }

  // Check if referenced images exist in ZIP
  for (const imageId of referencedImages) {
    const imagePath = `images/${imageId}`
    const imageFile = zip.file(imagePath)

    if (!imageFile) {
      errors.push(`Referenced image not found in ZIP: ${imageId}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Extract all images from ZIP into a Map
 */
export async function extractImagesFromZip(zip: JSZip, questions: Question[]): Promise<Map<string, File>> {
  const imageMap = new Map<string, File>()
  const referencedImages = new Set<string>()

  // Collect all referenced images
  const collectImages = (images?: ImageMeta[]) => {
    if (images) {
      for (const img of images) {
        referencedImages.add(img.id)
      }
    }
  }

  for (const question of questions) {
    collectImages(question.images)
    if (question.subQuestions) {
      for (const subQ of question.subQuestions) {
        collectImages(subQ.images)
      }
    }
  }

  // Extract only referenced images
  const imagePromises = Array.from(referencedImages).map(async (imageId) => {
    const imagePath = `images/${imageId}`
    const imageFile = zip.file(imagePath)

    if (imageFile) {
      try {
        const blob = await imageFile.async("blob")
        const imageMeta = findImageMetaById(questions, imageId)

        if (imageMeta) {
          const file = new File([blob], imageMeta.name, { type: imageMeta.mime })
          imageMap.set(imageId, file)
        }
      } catch (error) {
        console.error(`Failed to extract image: ${imageId}`, error)
      }
    }
  })

  await Promise.all(imagePromises)
  return imageMap
}

/**
 * Helper to find image metadata by ID
 */
function findImageMetaById(questions: Question[], imageId: string): ImageMeta | null {
  for (const question of questions) {
    const found = question.images?.find((img) => img.id === imageId)
    if (found) return found

    // Check sub-questions
    if (question.subQuestions) {
      for (const subQ of question.subQuestions) {
        const subFound = subQ.images?.find((img) => img.id === imageId)
        if (subFound) return subFound
      }
    }
  }
  return null
}

/**
 * Process imported questions - regenerate all IDs to prevent conflicts
 */
export function processImportedQuestions(questions: Question[]): Question[] {
  return questions.map((question) => {
    // Generate new question ID
    const newQuestionId = crypto.randomUUID()

    // Process options if MCQ
    const newOptions = question.options?.map((option) => {
      const newOptionId = crypto.randomUUID()
      return {
        ...option,
        id: newOptionId,
      }
    })

    // Process images
    const newImages = question.images?.map((image) => {
      const extension = image.id.split(".").pop() || "png"
      const newImageId = `${crypto.randomUUID()}.${extension}`
      return {
        ...image,
        id: newImageId,
      }
    })

    // Process sub-questions for scenario type
    const newSubQuestions = question.subQuestions?.map((subQ) => {
      const newSubQuestionId = crypto.randomUUID()

      const newSubOptions = subQ.options.map((option) => {
        const newOptionId = crypto.randomUUID()
        return {
          ...option,
          id: newOptionId,
        }
      })

      const newSubImages = subQ.images?.map((image) => {
        const extension = image.id.split(".").pop() || "png"
        const newImageId = `${crypto.randomUUID()}.${extension}`
        return {
          ...image,
          id: newImageId,
        }
      })

      return {
        ...subQ,
        id: newSubQuestionId,
        options: newSubOptions,
        images: newSubImages,
      }
    })

    return {
      ...question,
      id: newQuestionId,
      options: newOptions,
      images: newImages,
      subQuestions: newSubQuestions,
    }
  })
}

/**
 * Create image map with new IDs after processing
 */
export function remapImageFiles(
  originalImageMap: Map<string, File>,
  originalQuestions: Question[],
  processedQuestions: Question[],
): Map<string, File> {
  const newImageMap = new Map<string, File>()

  // Build old ID to new ID mapping
  const idMapping = new Map<string, string>()

  for (let index = 0; index < originalQuestions.length; index++) {
    const oldQ = originalQuestions[index]
    const newQ = processedQuestions[index]

    // Map main question images
    if (oldQ.images) {
      for (let imgIndex = 0; imgIndex < oldQ.images.length; imgIndex++) {
        const oldImg = oldQ.images[imgIndex]
        const newImg = newQ.images?.[imgIndex]
        if (newImg) {
          idMapping.set(oldImg.id, newImg.id)
        }
      }
    }

    // Map sub-question images
    if (oldQ.subQuestions) {
      for (let subIndex = 0; subIndex < oldQ.subQuestions.length; subIndex++) {
        const oldSubQ = oldQ.subQuestions[subIndex]
        const newSubQ = newQ.subQuestions?.[subIndex]
        if (oldSubQ.images) {
          for (let imgIndex = 0; imgIndex < oldSubQ.images.length; imgIndex++) {
            const oldImg = oldSubQ.images[imgIndex]
            const newImg = newSubQ?.images?.[imgIndex]
            if (newImg) {
              idMapping.set(oldImg.id, newImg.id)
            }
          }
        }
      }
    }
  }

  // Remap files with new IDs
  for (const [oldId, file] of originalImageMap) {
    const newId = idMapping.get(oldId)
    if (newId) {
      newImageMap.set(newId, file)
    }
  }

  return newImageMap
}
