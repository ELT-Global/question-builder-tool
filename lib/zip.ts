/**
 * ZIP generation utilities using JSZip
 * Handles building the export package with JSON + images
 */

import JSZip from "jszip"
import type { ExportData, ImageFilesMap, Question } from "./types"

/**
 * Build a ZIP file containing questions JSON and all images in an images folder
 * @param questions - Array of questions to export
 * @param imageFilesMap - Map of image IDs to File objects
 * @param title - Optional title for the question set
 * @returns Blob containing the ZIP file
 */
export async function buildZip(
  questions: Question[],
  imageFilesMap: ImageFilesMap,
  title?: string,
): Promise<Blob> {
  const zip = new JSZip()

  // Create export data structure
  const exportData: ExportData = {
    meta: {
      generatedAt: new Date().toISOString(),
      version: "1.0",
      title,
    },
    questions,
  }

  zip.file("questions.json", JSON.stringify(exportData, null, 2))

  const imagesFolder = zip.folder("images")

  if (imagesFolder) {
    for (const [imageId, file] of imageFilesMap.entries()) {
      imagesFolder.file(imageId, file)
    }
  }

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: "blob" })
  return blob
}

/**
 * Trigger download of a Blob with specified filename
 * @param blob - The Blob to download
 * @param filename - Desired filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
