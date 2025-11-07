/**
 * IndexedDB utilities for persistent image storage
 * Stores images as base64 to survive tab closures
 */

const DB_NAME = "question-authoring-db"
const DB_VERSION = 1
const IMAGE_STORE = "images"

interface StoredImage {
  id: string
  base64: string
  name: string
  mime: string
  size: number
}

/**
 * Initialize IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: "id" })
      }
    }
  })
}

/**
 * Convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Convert base64 string to File object
 */
export function base64ToFile(base64: string, filename: string, mime: string): File {
  const arr = base64.split(",")
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

/**
 * Save image to IndexedDB as base64
 */
export async function saveImageToDB(id: string, file: File): Promise<void> {
  try {
    const db = await openDB()
    const base64 = await fileToBase64(file)

    const storedImage: StoredImage = {
      id,
      base64,
      name: file.name,
      mime: file.type,
      size: file.size,
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGE_STORE], "readwrite")
      const store = transaction.objectStore(IMAGE_STORE)
      const request = store.put(storedImage)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("[v0] Failed to save image to IndexedDB:", error)
    throw error
  }
}

/**
 * Load image from IndexedDB and convert back to File
 */
export async function loadImageFromDB(id: string): Promise<File | null> {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGE_STORE], "readonly")
      const store = transaction.objectStore(IMAGE_STORE)
      const request = store.get(id)

      request.onsuccess = () => {
        const storedImage = request.result as StoredImage | undefined
        if (storedImage) {
          const file = base64ToFile(storedImage.base64, storedImage.name, storedImage.mime)
          resolve(file)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("[v0] Failed to load image from IndexedDB:", error)
    return null
  }
}

/**
 * Load all images from IndexedDB
 */
export async function loadAllImagesFromDB(): Promise<Map<string, File>> {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGE_STORE], "readonly")
      const store = transaction.objectStore(IMAGE_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        const storedImages = request.result as StoredImage[]
        const imageMap = new Map<string, File>()

        for (const storedImage of storedImages) {
          const file = base64ToFile(storedImage.base64, storedImage.name, storedImage.mime)
          imageMap.set(storedImage.id, file)
        }

        resolve(imageMap)
      }

      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("[v0] Failed to load images from IndexedDB:", error)
    return new Map()
  }
}

/**
 * Delete image from IndexedDB
 */
export async function deleteImageFromDB(id: string): Promise<void> {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGE_STORE], "readwrite")
      const store = transaction.objectStore(IMAGE_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("[v0] Failed to delete image from IndexedDB:", error)
  }
}

/**
 * Clear all images from IndexedDB
 */
export async function clearAllImagesFromDB(): Promise<void> {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGE_STORE], "readwrite")
      const store = transaction.objectStore(IMAGE_STORE)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("[v0] Failed to clear images from IndexedDB:", error)
  }
}
