/**
 * LoadingState Component
 * Loading indicator for image restoration
 */

"use client"

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Restoring images from storage...</p>
      </div>
    </div>
  )
}
