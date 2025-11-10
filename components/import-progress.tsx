/**
 * ImportProgress Component
 * Visual progress indicator for ZIP import process
 * Shows progress bar, stage checklist, and animated indicators
 */

"use client"

import { Progress } from "@/components/ui/progress"
import type { ImportStage } from "@/lib/types"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface ImportProgressProps {
  readonly stage: ImportStage
  readonly progress: number
  readonly message: string
}

interface StageInfo {
  id: ImportStage
  label: string
}

const STAGES: StageInfo[] = [
  { id: "reading", label: "Reading ZIP file" },
  { id: "extracting", label: "Extracting contents" },
  { id: "validating-json", label: "Validating question data" },
  { id: "validating-images", label: "Scanning images" },
  { id: "processing", label: "Processing questions" },
  { id: "storing", label: "Saving to storage" },
]

export function ImportProgress({ stage, progress, message }: Readonly<ImportProgressProps>) {
  const getStageStatus = (stageId: ImportStage): "completed" | "current" | "pending" => {
    if (stage === "complete") return "completed"
    if (stage === "error") return "pending"

    const currentIndex = STAGES.findIndex((s) => s.id === stage)
    const stageIndex = STAGES.findIndex((s) => s.id === stageId)

    if (stageIndex < currentIndex) return "completed"
    if (stageIndex === currentIndex) return "current"
    return "pending"
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{message}</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Stage Checklist */}
      <div className="space-y-3">
        {STAGES.map((stageInfo) => {
          const status = getStageStatus(stageInfo.id)

          let textClass = "text-muted-foreground"
          if (status === "completed") {
            textClass = "text-foreground"
          } else if (status === "current") {
            textClass = "font-medium text-foreground"
          }

          return (
            <div key={stageInfo.id} className="flex items-center gap-3">
              <div className="shrink-0">
                {status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {status === "current" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {status === "pending" && <Circle className="h-5 w-5 text-muted-foreground/50" />}
              </div>
              <span className={`text-sm ${textClass}`}>{stageInfo.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
