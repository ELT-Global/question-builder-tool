/**
 * ImageUploader Component
 * Handles multiple image uploads with validation and preview
 * Component-level logic for image management
 */

"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import type { ImageMeta } from "@/lib/types"
import { validateImageFile } from "@/lib/validation"
import { ImageIcon, Upload, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface ImageUploaderProps {
  images: ImageMeta[]
  onImagesChange: (images: ImageMeta[], files: File[]) => void
  onImageRemove: (imageId: string) => void
  imageFiles?: Map<string, File>
  maxImages?: number
}

export function ImageUploader({ images, onImagesChange, onImageRemove, imageFiles, maxImages }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map())
  const urlCacheRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    if (!imageFiles) return

    const newPreviewUrls = new Map<string, string>()
    const urlsToRevoke: string[] = []

    images.forEach((image) => {
      const file = imageFiles.get(image.id)
      if (file) {
        const cachedUrl = urlCacheRef.current.get(image.id)
        if (cachedUrl) {
          newPreviewUrls.set(image.id, cachedUrl)
        } else {
          const url = URL.createObjectURL(file)
          newPreviewUrls.set(image.id, url)
          urlCacheRef.current.set(image.id, url)
        }
      }
    })

    urlCacheRef.current.forEach((url, imageId) => {
      if (!images.find((img) => img.id === imageId)) {
        urlsToRevoke.push(url)
        urlCacheRef.current.delete(imageId)
      }
    })

    urlsToRevoke.forEach((url) => URL.revokeObjectURL(url))

    setPreviewUrls(newPreviewUrls)

    return () => {
      urlCacheRef.current.forEach((url) => URL.revokeObjectURL(url))
      urlCacheRef.current.clear()
    }
  }, [images, imageFiles])

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
      const newImages: ImageMeta[] = []
      const newFiles: File[] = []

      // Check if adding these files would exceed the max limit
      if (maxImages && images.length + files.length > maxImages) {
        alert(`You can only upload a maximum of ${maxImages} images. Currently you have ${images.length} image(s).`)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      for (const file of files) {
        const validation = validateImageFile(file)

        if (!validation.valid) {
          alert(validation.error)
          continue
        }

        const extension = file.name.split(".").pop() || "png"
        const imageId = `${crypto.randomUUID()}.${extension}`

        const imageMeta: ImageMeta = {
          id: imageId,
          name: file.name,
          mime: file.type,
          size: file.size,
        }

        newImages.push(imageMeta)
        newFiles.push(file)
      }

      if (newImages.length > 0) {
        onImagesChange(newImages, newFiles)
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [onImagesChange, maxImages, images.length],
  )

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const isMaxReached = maxImages ? images.length >= maxImages : false

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Images (Optional)
          {maxImages && <span className="ml-1 text-xs text-muted-foreground">({images.length}/{maxImages})</span>}
        </label>
        <Button type="button" variant="outline" size="sm" onClick={handleUploadClick} disabled={isMaxReached}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Images
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => {
            const previewUrl = previewUrls.get(image.id)

            return (
              <div key={image.id} className="group relative rounded-lg border bg-muted/50 p-2">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-background">
                  {previewUrl ? (
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt={image.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-2 truncate text-xs text-muted-foreground" title={image.name}>
                  {image.name}
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => onImageRemove(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
