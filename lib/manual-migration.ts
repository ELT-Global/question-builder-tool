/**
 * Manual Migration Script
 * Run this once to migrate all stored data from old format to new format
 * 
 * How to use:
 * 1. Open browser console (F12)
 * 2. Import this function
 * 3. Run: migrateAllStoredData()
 */

import { migrateDraftFromStorage } from "./migrate-data"

/**
 * Migrate all stored data (localStorage and IndexedDB)
 */
export function migrateAllStoredData(): void {
  console.log("🚀 Starting migration of all stored data...")
  
  // Migrate localStorage draft
  const draft = migrateDraftFromStorage()
  if (draft) {
    console.log("✅ LocalStorage draft migrated successfully")
  } else {
    console.log("ℹ️ No draft data found in localStorage or already in new format")
  }
  
  // Migrate IndexedDB (if you have image files stored there)
  migrateIndexedDB()
}

/**
 * Migrate IndexedDB data
 */
async function migrateIndexedDB(): Promise<void> {
  try {
    const dbName = "question-images"
    const request = indexedDB.open(dbName)
    
    request.onsuccess = () => {
      const db = request.result
      console.log("✅ IndexedDB checked (no migration needed for image files)")
      db.close()
    }
    
    request.onerror = () => {
      console.log("ℹ️ No IndexedDB found or not accessible")
    }
  } catch (error) {
    console.error("❌ Error checking IndexedDB:", error)
  }
}

// Export for manual use
if (typeof window !== "undefined") {
  // @ts-ignore - Expose globally for manual migration
  window.migrateAllStoredData = migrateAllStoredData
  console.log("📦 Migration utility loaded. Run 'migrateAllStoredData()' in console to migrate data.")
}
