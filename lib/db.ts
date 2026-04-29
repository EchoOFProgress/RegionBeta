/**
 * lib/db.ts — Supabase Data Layer
 *
 * Strategy: "offline-first with cloud sync"
 * ─────────────────────────────────────────
 * • localStorage = rychlá cache pro UI (čtení je vždy synchronní)
 * • Supabase = pravda (cloud). Při přihlášení cloud přepíše local.
 * • Každý storage.save() fire-and-forget synchronizuje do Supabase.
 * • Každá akce se loguje do tabulky `activity_log` pro grafy.
 *
 * Schema versioning
 * ─────────────────
 * Každý item v localStorage i v Supabase nese `_schemaVersion`.
 * Při načítání dat se automaticky spustí migrace starých dat.
 */

import { supabase } from "@/lib/supabase"

// ─── Current schema version ──────────────────────────────────────────────────
// Zvedni toto číslo kdykoli změníš strukturu Task/Habit/Challenge/Goal objektu.
export const SCHEMA_VERSION = 1

// ─── Types ───────────────────────────────────────────────────────────────────

export type SyncTable = "tasks" | "habits" | "challenges" | "goals"

export type ActivityEventType =
  | "task_completed"
  | "task_created"
  | "task_deleted"
  | "task_progress"
  | "habit_completed"
  | "habit_created"
  | "habit_deleted"
  | "habit_progress"
  | "challenge_checkin"
  | "challenge_created"
  | "challenge_completed"
  | "challenge_deleted"
  | "challenge_progress"
  | "goal_created"
  | "goal_deleted"
  | "donation_made"

export interface ActivityEvent {
  event_type: ActivityEventType
  item_id?: string
  item_title?: string
  metadata?: Record<string, unknown>  // libovolná extra data (streak, amount, ...)
}

// ─── Schema migration ─────────────────────────────────────────────────────────

/**
 * Spustí migrace nad načtenými daty pokud jsou starší verze.
 * Přidávej sem nové case blogy při každé breaking change.
 */
function migrateItem(item: any): any {
  const version = item._schemaVersion ?? 0

  // Příklad migrace z verze 0 na 1:
  if (version < 1) {
    // v1: přidáváme _schemaVersion field pokud chybí
    item._schemaVersion = 1
  }

  // v2: if (version < 2) { ... }

  item._schemaVersion = SCHEMA_VERSION
  return item
}

export function migrateCollection(items: any[]): any[] {
  return items.map(migrateItem)
}

// ─── Data loading ─────────────────────────────────────────────────────────────

/**
 * Načte všechna data uživatele z Supabase.
 * Vrátí prázdné pole při chybě nebo pokud není přihlášen.
 * Data jsou automaticky migrována na aktuální schema version.
 */
export async function dbLoad(table: SyncTable, userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from(table)
    .select("data")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.warn(`[db] Failed to load ${table}:`, error.message)
    return []
  }

  const raw = (data ?? []).map((row: { data: any }) => row.data)
  return migrateCollection(raw)
}

// ─── Data syncing ─────────────────────────────────────────────────────────────

/**
 * Per-(table,user) mutex — serializuje sync calls aby se delete a upsert
 * nemíchaly mezi souběžnými save() voláními (různé záložky / rychlé změny).
 */
const syncLocks = new Map<string, Promise<void>>()

async function runSerialized(
  key: string,
  fn: () => Promise<void>
): Promise<void> {
  const prev = syncLocks.get(key) ?? Promise.resolve()
  const next = prev.then(fn, fn).catch((err) => {
    console.warn(`[db] sync error on ${key}:`, err)
  })
  syncLocks.set(key, next)
  try {
    await next
  } finally {
    if (syncLocks.get(key) === next) syncLocks.delete(key)
  }
}

/**
 * Synchronizuje kolekci do Supabase.
 * Strategie:
 *   1. Upsert všech aktuálních lokálních itemů (last-write-wins per item via updated_at).
 *   2. Smaže cloud řádky kterých item_id NENÍ v lokální kolekci (tombstone přes diff).
 *   3. Per-table mutex chrání před race condition mezi souběžnými save().
 *
 * Vyžaduje UNIQUE(user_id, item_id) constraint na cílové tabulce.
 */
export async function dbSync(
  table: SyncTable,
  userId: string,
  items: any[]
): Promise<void> {
  await runSerialized(`${table}:${userId}`, async () => {
    const versionedItems = items.map((item) => ({
      ...item,
      _schemaVersion: SCHEMA_VERSION,
    }))

    const nowIso = new Date().toISOString()
    const localItemIds = versionedItems.map((item) => String(item.id))

    // 1. Upsert aktuálních itemů
    if (versionedItems.length > 0) {
      const rows = versionedItems.map((item) => ({
        user_id: userId,
        item_id: String(item.id),
        data: item,
        updated_at: nowIso,
      }))

      const { error: upsertError } = await supabase
        .from(table)
        .upsert(rows, { onConflict: "user_id,item_id" })

      if (upsertError) {
        console.warn(`[db] Failed to upsert ${table}:`, upsertError.message)
        return
      }
    }

    // 2. Smaž cloud řádky které už lokálně neexistují (tombstone via diff)
    let deleteQuery = supabase.from(table).delete().eq("user_id", userId)
    if (localItemIds.length > 0) {
      // PostgREST: hodnoty pro filtr `in` se obalují závorkami a oddělují čárkou.
      // Item IDs jsou bezpečné stringy (timestamp/uuid), ale přesto escape uvozovky uvnitř.
      const escaped = localItemIds.map((id) => `"${id.replace(/"/g, '\\"')}"`)
      deleteQuery = deleteQuery.not("item_id", "in", `(${escaped.join(",")})`)
    }

    const { error: delError } = await deleteQuery
    if (delError) {
      console.warn(`[db] Failed to prune ${table}:`, delError.message)
    }
  })
}

// ─── Activity logging ─────────────────────────────────────────────────────────

/**
 * Zaloguje akci uživatele do tabulky `activity_log`.
 * Volej toto kdykoli uživatel dokončí task, habit atd.
 * Data jsou pak dostupná pro grafy a analytiku.
 */
export async function logActivity(event: ActivityEvent): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return  // nepřihlášený uživatel — nic nelogujeme

    const { error } = await supabase.from("activity_log").insert({
      user_id: user.id,
      event_type: event.event_type,
      item_id: event.item_id ?? null,
      item_title: event.item_title ?? null,
      metadata: event.metadata ?? {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.warn("[db] Failed to log activity:", error.message)
    }
  } catch (err) {
    console.warn("[db] logActivity error:", err)
  }
}

/**
 * Načte activity log uživatele pro grafy.
 * `days` = kolik dní zpět načíst (default 30).
 */
export async function getActivityLog(
  days = 30
): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })

  if (error) {
    console.warn("[db] Failed to load activity log:", error.message)
    return []
  }

  return data ?? []
}

// ─── Donations ────────────────────────────────────────────────────────────────

export async function dbRecordDonation(params: {
  sessionId: string
  amount: number
  currency: string
  userId?: string
}): Promise<void> {
  const { error } = await supabase.from("donations").upsert(
    {
      session_id: params.sessionId,
      amount: params.amount,
      currency: params.currency,
      user_id: params.userId ?? null,
      created_at: new Date().toISOString(),
    },
    { onConflict: "session_id" }
  )
  if (error) console.warn("[db] Failed to record donation:", error.message)
}

export async function dbGetDonationTotals(): Promise<{
  totalCZK: number
  totalUSD: number
}> {
  const { data, error } = await supabase
    .from("donations")
    .select("amount, currency")

  if (error || !data) return { totalCZK: 0, totalUSD: 0 }

  let totalCZK = 0
  let totalUSD = 0
  for (const row of data) {
    const amount = row.amount / 100
    if (row.currency === "czk") totalCZK += amount
    else if (row.currency === "usd") totalUSD += amount
  }
  return { totalCZK, totalUSD }
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function dbSubmitFeedback(type: "bug" | "idea", content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Authentication required" }

    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      type,
      content,
      created_at: new Date().toISOString()
    })

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.warn("[db] Failed to submit feedback:", err.message)
    return { success: false, error: err.message }
  }
}

