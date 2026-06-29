import { supabase, BUCKET } from './supabase'

// Saves any JSON-serialisable value to Supabase Storage as data/{key}.json
// Fire-and-forget — localStorage is already updated before this is called.
export function dataSave(key: string, value: unknown): void {
  if (!supabase) return
  const blob = new Blob([JSON.stringify(value)], { type: 'application/json' })
  supabase.storage.from(BUCKET).upload(`data/${key}.json`, blob, {
    upsert: true,
    contentType: 'application/json',
  })
}

// Loads a value from Supabase Storage. Returns null if not found or Supabase disabled.
export async function dataLoad<T>(key: string): Promise<T | null> {
  if (!supabase) return null
  try {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(`data/${key}.json`)
    const res = await fetch(`${data.publicUrl}?t=${Date.now()}`)
    if (!res.ok) return null
    return await res.json() as T
  } catch {
    return null
  }
}

// All localStorage keys that should be synced via Supabase
export const SYNC_KEYS = [
  'acls-action-overrides',
  'acls-ht-overrides-v1',
  'acls-team-roles-overrides-v1',
  'acls-cause-detail-overrides-v1',
  'acls-custom-scenarios',
  'acls-scenario-assets',
  'acls-content-drugs',
  'acls-ecg-meta',
  'acls-algorithm-data',
  'acls-action-asset-map-v6',
  'acls-scene-assets-v4',
] as const

// On app init: pull all keys from Supabase into localStorage, then fire
// a custom event so any mounted hooks re-read their values.
export async function initSupabaseSync(): Promise<void> {
  if (!supabase) return
  await Promise.all(
    SYNC_KEYS.map(async (key) => {
      const remote = await dataLoad(key)
      if (remote === null) return
      try {
        localStorage.setItem(key, JSON.stringify(remote))
      } catch { /* ignore quota errors */ }
    })
  )
  // Signal all hooks to re-read from localStorage
  window.dispatchEvent(new CustomEvent('acls-supabase-synced'))
}
