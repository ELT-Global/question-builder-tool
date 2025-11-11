/**
 * MCQOptions Component
 * Manages multiple choice question options
 */

"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Option } from "@/lib/types"
import { Info, Plus, Trash2 } from "lucide-react"

interface MCQOptionsProps {
  options: Option[]
  onAdd: () => void
  onUpdate: (optionId: string, field: keyof Option, value: string | boolean) => void
  onRemove: (optionId: string) => void
  maxReached: boolean
}

export function MCQOptions({ options, onAdd, onUpdate, onRemove, maxReached }: MCQOptionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Answers</Label>
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute left-0 top-6 z-10 hidden w-48 rounded-md bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md group-hover:block">
              Select correct answers by checking the boxes
            </div>
          </div>
          <span className="text-xs text-muted-foreground">({options.length}/10)</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={maxReached}>
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>

      {options.map((option, index) => (
        <div key={option.id} className="flex items-start gap-2">
          <Checkbox
            checked={option.correct}
            onCheckedChange={(checked) => onUpdate(option.id, "correct", checked === true)}
            className="mt-2"
          />
          <Input
            value={option.text}
            onChange={(e) => onUpdate(option.id, "text", e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="flex-1"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(option.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
