import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url    = import.meta.env.VITE_SUPABASE_URL    as string | undefined
const key    = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const BUCKET = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined) ?? 'scene-assets'

console.log('[Supabase] url:', url ? url.slice(0, 30) + '…' : 'MISSING')
console.log('[Supabase] key:', key ? key.slice(0, 20) + '…' : 'MISSING')
console.log('[Supabase] bucket:', BUCKET)

// null when env vars are absent — app falls back to localStorage/IndexedDB
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

export const isSupabaseEnabled = () => supabase !== null
