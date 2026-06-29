import { dataSave } from './supabaseDataSync'

const STORAGE_KEY = 'acls-action-overrides'

export type ActionTeachingOverride = {
  findings?: string[]
  teachingNote?: string
  warning?: string
}

export function loadActionOverrides(): Record<string, ActionTeachingOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveActionOverrides(overrides: Record<string, ActionTeachingOverride>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  dataSave(STORAGE_KEY, overrides)
}
