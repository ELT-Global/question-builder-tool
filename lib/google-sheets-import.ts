/**
 * Google Sheets Import utilities
 * Validates Google Sheets URLs and fetches CSV data
 */

import { csvToQuestions, type CSVImportResult } from "./csv-import"

interface GoogleSheetsValidation {
  valid: boolean
  error?: string
  spreadsheetId?: string
  gid?: string
}

/**
 * Extract spreadsheet ID and GID from Google Sheets URL
 * Supports various Google Sheets URL formats:
 * - https://docs.google.com/spreadsheets/d/{id}/edit#gid={gid}
 * - https://docs.google.com/spreadsheets/d/{id}/edit
 * - https://docs.google.com/spreadsheets/d/{id}
 */
function extractSpreadsheetInfo(url: string): { id: string | null; gid: string | null } {
  try {
    const urlObj = new URL(url)

    // Check if it's a Google Sheets URL
    if (!urlObj.hostname.includes("docs.google.com") || !url.includes("/spreadsheets/")) {
      return { id: null, gid: null }
    }

    // Extract spreadsheet ID from path
    const pathMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    const spreadsheetId = pathMatch ? pathMatch[1] : null

    // Extract GID (sheet ID) from URL
    let gid: string | null = null

    // Try to get from hash (#gid=0)
    const hashMatch = url.match(/#gid=([0-9]+)/)
    if (hashMatch) {
      gid = hashMatch[1]
    } else {
      // Try to get from query parameter (?gid=0)
      const queryMatch = url.match(/[?&]gid=([0-9]+)/)
      if (queryMatch) {
        gid = queryMatch[1]
      }
    }

    return { id: spreadsheetId, gid }
  } catch {
    return { id: null, gid: null }
  }
}

/**
 * Validate Google Sheets URL
 */
export function validateGoogleSheetsUrl(url: string): GoogleSheetsValidation {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: "Please enter a Google Sheets URL" }
  }

  // Check if it's a valid URL
  try {
    new URL(url)
  } catch {
    return { valid: false, error: "Invalid URL format" }
  }

  // Extract spreadsheet info
  const { id, gid } = extractSpreadsheetInfo(url)

  if (!id) {
    return {
      valid: false,
      error: "Invalid Google Sheets URL. Please use a URL like: https://docs.google.com/spreadsheets/d/{id}/edit",
    }
  }

  return { valid: true, spreadsheetId: id, gid: gid || "0" }
}

/**
 * Build CSV export URL for Google Sheets
 */
function buildCsvExportUrl(spreadsheetId: string, gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`
}

/**
 * Fetch CSV data from Google Sheets
 */
async function fetchGoogleSheetsCsv(spreadsheetId: string, gid: string): Promise<string> {
  const csvUrl = buildCsvExportUrl(spreadsheetId, gid)

  try {
    const response = await fetch(csvUrl, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Sheet not found. Please check the URL and try again.")
      } else if (response.status === 403) {
        throw new Error(
          "Access denied. Please make sure the Google Sheet is set to 'Anyone with the link can view' and try again."
        )
      } else {
        throw new Error(`Failed to fetch sheet data (HTTP ${response.status})`)
      }
    }

    const csvText = await response.text()

    // Check if we got HTML instead of CSV (indicates private sheet)
    if (csvText.trim().startsWith("<!DOCTYPE") || csvText.trim().startsWith("<html")) {
      throw new Error(
        "The Google Sheet appears to be private. Please share it with 'Anyone with the link can view' permission."
      )
    }

    if (!csvText || csvText.trim().length === 0) {
      throw new Error("The sheet is empty or contains no data")
    }

    return csvText
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to fetch data from Google Sheets. Please check your internet connection.")
  }
}

/**
 * Import questions from Google Sheets URL
 */
export async function importFromGoogleSheets(url: string): Promise<CSVImportResult> {
  // Validate URL
  const validation = validateGoogleSheetsUrl(url)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    // Fetch CSV data
    const csvText = await fetchGoogleSheetsCsv(validation.spreadsheetId!, validation.gid!)

    // Convert CSV to questions
    const result = csvToQuestions(csvText)

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to parse sheet data",
        warnings: result.warnings,
      }
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import from Google Sheets",
    }
  }
}

/**
 * Check if Google Sheets is accessible (public)
 */
export async function checkGoogleSheetsAccess(url: string): Promise<{ accessible: boolean; error?: string }> {
  const validation = validateGoogleSheetsUrl(url)
  if (!validation.valid) {
    return { accessible: false, error: validation.error }
  }

  try {
    const csvUrl = buildCsvExportUrl(validation.spreadsheetId!, validation.gid!)
    const response = await fetch(csvUrl, { method: "HEAD" })

    if (response.status === 403) {
      return {
        accessible: false,
        error: "Sheet is private. Change sharing settings to 'Anyone with the link can view'.",
      }
    }

    if (!response.ok) {
      return { accessible: false, error: `Unable to access sheet (HTTP ${response.status})` }
    }

    return { accessible: true }
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : "Failed to check sheet access",
    }
  }
}
