import { HtCause, allHtCauses } from '../data/htCauses'
import { dataSave } from './supabaseDataSync'

// ─── H's & T's overrides ────────────────────────────────────────────────────

const HT_KEY = 'acls-ht-overrides-v1'

export type HtOverride = Partial<Pick<HtCause, 'nameThai' | 'nameEn' | 'treatmentThai'>> & { imageDataUrl?: string }

export function loadHtOverrides(): Record<string, HtOverride> {
  try {
    const s = localStorage.getItem(HT_KEY)
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

export function saveHtOverrides(map: Record<string, HtOverride>): void {
  localStorage.setItem(HT_KEY, JSON.stringify(map))
  dataSave(HT_KEY, map)
}

export function getAllHtCausesWithOverrides(): HtCause[] {
  const overrides = loadHtOverrides()
  return allHtCauses.map(c => ({ ...c, ...overrides[c.id] }))
}

// ─── Team Roles overrides ────────────────────────────────────────────────────

const ROLES_KEY = 'acls-team-roles-overrides-v1'

export type RoleId = 'leader' | 'compressor' | 'airway' | 'iv' | 'monitor' | 'recorder'

export interface RoleOverride {
  title?: string
  titleEn?: string
  responsibilities?: string[]
  imageDataUrl?: string
}

export function loadRoleOverrides(): Record<string, RoleOverride> {
  try {
    const s = localStorage.getItem(ROLES_KEY)
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

export function saveRoleOverrides(map: Record<string, RoleOverride>): void {
  localStorage.setItem(ROLES_KEY, JSON.stringify(map))
  dataSave(ROLES_KEY, map)
}
