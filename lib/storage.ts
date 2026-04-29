/**
 * lib/storage.ts — Local Storage + Cloud Sync
 *
 * Každé storage.save() pro tasks/habits/challenges/goals:
 *   1. Uloží do localStorage (okamžitě, synchronně).
 *   2. Fire-and-forget synchronizuje do Supabase (asynchronně).
 *
 * Pokud uživatel není přihlášen, cloud sync se přeskočí.
 */

import { dbSync, migrateCollection, SCHEMA_VERSION } from "@/lib/db"
import { supabase } from "@/lib/supabase"

const SYNCABLE_TABLES = new Set(["tasks", "habits", "challenges", "goals"])

async function syncToCloud(key: string, data: any[]): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await dbSync(key as any, user.id, data)
  } catch (err) {
    console.warn(`[storage] Cloud sync failed for "${key}":`, err)
  }
}

export const storage = {
  /**
   * Uloží data do localStorage.
   * Pro syncable tables také fire-and-forget synchronizuje do Supabase.
   *
   * @param options.skipSync — když true, jen lokální zápis (použij když data
   *                           právě dorazila z cloudu, jinak vznikne round-trip).
   */
  save: (key: string, data: any, options?: { skipSync?: boolean }): void => {
    try {
      if (typeof window === "undefined") return
      localStorage.setItem(key, JSON.stringify(data))
      if (
        !options?.skipSync &&
        SYNCABLE_TABLES.has(key) &&
        Array.isArray(data)
      ) {
        syncToCloud(key, data)
      }
    } catch (error) {
      console.error(`[storage] save("${key}") failed:`, error)
    }
  },

  /**
   * Načte data z localStorage.
   * Automaticky spustí schema migrace na načtených datech.
   */
  load: (key: string, defaultValue: any): any => {
    try {
      if (typeof window === "undefined") return defaultValue
      const raw = localStorage.getItem(key)
      if (!raw) return defaultValue
      const parsed = JSON.parse(raw)
      // Migruj kolekce (arrays) automaticky
      if (Array.isArray(parsed) && SYNCABLE_TABLES.has(key)) {
        return migrateCollection(parsed)
      }
      return parsed
    } catch (error) {
      console.error(`[storage] load("${key}") failed:`, error)
      return defaultValue
    }
  },

  remove: (key: string): void => {
    try {
      if (typeof window !== "undefined") localStorage.removeItem(key)
    } catch (error) {
      console.error(`[storage] remove("${key}") failed:`, error)
    }
  },

  clear: (): void => {
    try {
      if (typeof window !== "undefined") localStorage.clear()
    } catch (error) {
      console.error("[storage] clear() failed:", error)
    }
  },
}

// ─── Export / Import JSON ─────────────────────────────────────────────────────

export const exportData = () => {
  const data = {
    schemaVersion: SCHEMA_VERSION,
    tasks: storage.load("tasks", []),
    habits: storage.load("habits", []),
    challenges: storage.load("challenges", []),
    goals: storage.load("goals", []),
    exportDate: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `region-beta-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const importData = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch {
        reject(new Error("Invalid JSON file"))
      }
    }
    reader.onerror = () => reject(new Error("Error reading file"))
    reader.readAsText(file)
  })
}
