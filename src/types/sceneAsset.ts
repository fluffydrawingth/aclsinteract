export type AssetCategory = 'patient' | 'team' | 'assessment' | 'treatment' | 'equipment' | 'effects'

export const ASSET_CATEGORIES: { id: AssetCategory; label: string }[] = [
  { id: 'patient',    label: 'Patient / Background' },
  { id: 'team',       label: 'Team Members' },
  { id: 'assessment', label: 'Assessment Overlays' },
  { id: 'treatment',  label: 'Treatment / Airway' },
  { id: 'equipment',  label: 'Equipment' },
  { id: 'effects',    label: 'Visual Effects' },
]

export type SceneAsset = {
  id: string
  name: string
  category: AssetCategory
  imageDataUrl?: string      // base64 — local IndexedDB fallback
  storageUrl?: string        // Supabase Storage public URL — takes priority over imageDataUrl
  x: number                  // % of canvas width from left
  y: number                  // % of canvas height from top
  w: number                  // % of canvas width
  h: number                  // % of canvas height
  rotation: number           // degrees
  opacity: number            // 0–1
  zIndex: number
  defaultVisible: boolean    // shown on scene load (before any action)
}

export type ShowEntry = { id: string; duration?: number } // duration ms = auto-hide

export type ActionAssetMapping = Record<string, {
  show: ShowEntry[]
  hide: string[]
}>
