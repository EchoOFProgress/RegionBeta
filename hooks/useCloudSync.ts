"use client"

/**
 * hooks/useCloudSync.ts
 *
 * Při přihlášení uživatele:
 * 1. Stáhne jeho data z Supabase (všechny tabulky).
 * 2. Provede schema migrace (migrateCollection).
 * 3. Uloží do localStorage — aplikace se automaticky překreslí.
 *
 * Při odhlášení:
 * Vyčistí localStorage od uživatelských dat (pro případ sdíleného zařízení).
 */

import { useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbLoad, migrateCollection } from "@/lib/db"
import { storage } from "@/lib/storage"

const SYNCABLE_TABLES = ["tasks", "habits", "challenges", "goals"] as const
type SyncTable = typeof SYNCABLE_TABLES[number]

function dispatchUpdate(table: string, items: any[]) {
  window.dispatchEvent(
    new CustomEvent(`${table}Updated`, { detail: items })
  )
}

export function useCloudSync() {
  const { user } = useAuth()
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    // ── Přihlášení nového uživatele ──────────────────────────────────────────
    if (user && lastUserId.current !== user.id) {
      lastUserId.current = user.id

      const pull = async () => {
        console.log("[cloudSync] Pulling data for user:", user.id)

        for (const table of SYNCABLE_TABLES) {
          try {
            const cloudItems = await dbLoad(table as SyncTable, user.id)

            if (cloudItems.length > 0) {
              // Cloud data jsou migrována uvnitř dbLoad → jen uložíme
              storage.save(table, cloudItems)
              dispatchUpdate(table, cloudItems)
              console.log(`[cloudSync] ✓ ${table}: ${cloudItems.length} items`)
            } else {
              // Žádná cloud data → zkusíme zachovat localStorage data
              // a hned je nahrát do cloudu
              const local = storage.load(table, [])
              if (local.length > 0) {
                const migrated = migrateCollection(local)
                storage.save(table, migrated)
                // storage.save automaticky volá dbSync → local data se nahrají
                console.log(
                  `[cloudSync] ↑ ${table}: uploading ${local.length} local items`
                )
              }
            }
          } catch (err) {
            console.warn(`[cloudSync] Failed to sync ${table}:`, err)
          }
        }
      }

      pull()
    }

    // ── Odhlášení ─────────────────────────────────────────────────────────────
    if (!user && lastUserId.current !== null) {
      console.log("[cloudSync] User logged out — clearing local data")
      for (const table of SYNCABLE_TABLES) {
        storage.remove(table)
        dispatchUpdate(table, [])
      }
      lastUserId.current = null
    }
  }, [user])
}
