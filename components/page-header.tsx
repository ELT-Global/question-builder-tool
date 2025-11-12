/**
 * PageHeader Component
 * Header with logo, import/export actions, and navigation
 */

"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Download, FileSpreadsheet, FileText, Plus, Trash2, Upload } from "lucide-react"
import Image from "next/image"

interface PageHeaderProps {
  questionsCount: number
  onCreateQuestion: () => void
  onClearAll: () => void
  onImportZIP: () => void
  onImportCSV: () => void
  onExport: () => void
}

export function PageHeader({
  questionsCount,
  onCreateQuestion,
  onClearAll,
  onImportZIP,
  onImportCSV,
  onExport,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <Image src="triple-i-logo.svg" alt="Triple i Logo" width={150} height={150} />
              <p className="m-0 p-0 text-xs text-muted-foreground">Create and export exam questions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              title="Remove all questions"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              disabled={questionsCount === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>

            {/* Import Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button title="Import questions" variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onImportZIP}>
                  <FileText className="mr-2 h-4 w-4" />
                  Import from ZIP
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onImportCSV}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Import from CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              title="Download questions as ZIP"
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={questionsCount === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export ZIP
            </Button>
            <Button onClick={onCreateQuestion} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Image src="triple-i-logo.svg" alt="Logo" width={120} height={120} />
              <p className="m-0 p-0 text-xs text-muted-foreground text-center">Create and export exam questions</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              title="Remove all questions"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              disabled={questionsCount === 0}
              className="w-full"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              <span className="text-xs">Clear All</span>
            </Button>

            {/* Import Dropdown Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="mr-1 h-4 w-4" />
                  <span className="text-xs">Import</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onImportZIP}>
                  <FileText className="mr-2 h-4 w-4" />
                  From ZIP
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onImportCSV}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  From CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              title="Download questions as ZIP"
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={questionsCount === 0}
              className="w-full"
            >
              <Download className="mr-1 h-4 w-4" />
              <span className="text-xs">Export</span>
            </Button>
            <Button onClick={onCreateQuestion} size="sm" className="w-full">
              <Plus className="mr-1 h-4 w-4" />
              <span className="text-xs">Add Question</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
