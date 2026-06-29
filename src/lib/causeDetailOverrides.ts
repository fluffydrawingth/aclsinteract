import { dataSave } from './supabaseDataSync'

const KEY = 'acls-cause-detail-overrides-v1'

export interface CauseDetailOverride {
  findings?: string[]
  treatment?: string[]
}

export function loadCauseDetailOverrides(): Record<string, CauseDetailOverride> {
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

export function saveCauseDetailOverrides(map: Record<string, CauseDetailOverride>): void {
  localStorage.setItem(KEY, JSON.stringify(map))
  dataSave(KEY, map)
}
