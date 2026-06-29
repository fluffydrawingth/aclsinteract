import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { Drug, allDrugs } from '../data/drugs'
import { RhythmType } from '../types/rhythm'
import { getImage, setImage, deleteImage, allImageKeys } from '../lib/imageStore'

export type EcgImageEntry = {
  imageDataUrl: string
  note: string
  title?: string
  diagnosis?: string
  category?: string
}

// Metadata stored in localStorage (tiny — no image data)
type EcgMeta = Omit<EcgImageEntry, 'imageDataUrl'>
type EcgMetaMap = Partial<Record<RhythmType, EcgMeta>>

export type EcgImageMap = Partial<Record<RhythmType, EcgImageEntry>>

const ECG_META_KEY   = 'acls-ecg-meta'
const ecgImgKey      = (rhythm: RhythmType) => `ecg::${rhythm}`

// Build full EcgImageMap by combining metadata from localStorage
// with image data from IndexedDB cache (sync after initImageStore).
function loadEcgImages(): EcgImageMap {
  let meta: EcgMetaMap = {}
  try {
    const stored = localStorage.getItem(ECG_META_KEY)
    if (stored) {
      // Handle legacy format: old key 'acls-ecg-images' had imageDataUrl embedded.
      // New key 'acls-ecg-meta' has only metadata.
      meta = JSON.parse(stored) as EcgMetaMap
      // Strip any accidental embedded imageDataUrl from old saves
      for (const k of Object.keys(meta)) {
        const m = meta[k as RhythmType] as EcgMeta & { imageDataUrl?: string }
        if (m?.imageDataUrl) {
          // Migrate: move image to IndexedDB, strip from metadata
          setImage(ecgImgKey(k as RhythmType), m.imageDataUrl)
          delete (m as Record<string, unknown>).imageDataUrl
        }
      }
    } else {
      // Try migrating from old combined key
      const legacy = localStorage.getItem('acls-ecg-images')
      if (legacy) {
        const old = JSON.parse(legacy) as EcgImageMap
        for (const [rhythm, entry] of Object.entries(old)) {
          if (entry?.imageDataUrl) {
            setImage(ecgImgKey(rhythm as RhythmType), entry.imageDataUrl)
          }
          meta[rhythm as RhythmType] = {
            note: entry?.note ?? '',
            title: entry?.title,
            diagnosis: entry?.diagnosis,
            category: entry?.category,
          }
        }
        localStorage.setItem(ECG_META_KEY, JSON.stringify(meta))
        localStorage.removeItem('acls-ecg-images')
      }
    }
  } catch { /* ignore */ }

  // Reconstruct full map: metadata + image from IndexedDB cache
  const result: EcgImageMap = {}
  for (const [rhythm, m] of Object.entries(meta)) {
    const img = getImage(ecgImgKey(rhythm as RhythmType))
    if (img) {
      result[rhythm as RhythmType] = { ...m!, imageDataUrl: img }
    }
  }

  // Also pick up any images that are in IDB but whose metadata was lost
  for (const key of allImageKeys()) {
    if (key.startsWith('ecg::')) {
      const rhythm = key.slice('ecg::'.length) as RhythmType
      if (!result[rhythm]) {
        const img = getImage(key)!
        result[rhythm] = { imageDataUrl: img, note: '' }
      }
    }
  }

  return result
}

function saveEcgMeta(map: EcgImageMap) {
  const meta: EcgMetaMap = {}
  for (const [rhythm, entry] of Object.entries(map)) {
    if (entry) {
      const { imageDataUrl: _, ...m } = entry
      meta[rhythm as RhythmType] = m
    }
  }
  try {
    localStorage.setItem(ECG_META_KEY, JSON.stringify(meta))
  } catch {
    console.error('[ECG] Failed to save ECG metadata.')
  }
}

export function useTeachingContent() {
  const [drugs, setDrugs] = useLocalStorage<Drug[]>('acls-content-drugs', allDrugs)
  // ecgImages lives in component state but is initialised from IDB cache + localStorage meta
  const [ecgImages, setEcgImages] = useState<EcgImageMap>(loadEcgImages)

  const updateDrug = useCallback((id: string, updates: Partial<Drug>) => {
    setDrugs((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }, [setDrugs])

  const resetDrugs = useCallback(() => setDrugs(allDrugs), [setDrugs])

  const setEcgImage = useCallback((
    rhythm: RhythmType,
    imageDataUrl: string,
    note: string,
    meta?: Pick<EcgImageEntry, 'title' | 'diagnosis' | 'category'>,
  ) => {
    // Persist image to IndexedDB
    setImage(ecgImgKey(rhythm), imageDataUrl)
    setEcgImages(prev => {
      const next = { ...prev, [rhythm]: { imageDataUrl, note, ...meta } }
      saveEcgMeta(next)
      return next
    })
  }, [])

  const updateEcgMeta = useCallback((
    rhythm: RhythmType,
    meta: Partial<Pick<EcgImageEntry, 'title' | 'diagnosis' | 'category' | 'note'>>,
  ) => {
    setEcgImages(prev => {
      if (!prev[rhythm]) return prev
      const next = { ...prev, [rhythm]: { ...prev[rhythm]!, ...meta } }
      saveEcgMeta(next)
      return next
    })
  }, [])

  const removeEcgImage = useCallback((rhythm: RhythmType) => {
    deleteImage(ecgImgKey(rhythm))
    setEcgImages(prev => {
      const next = { ...prev }
      delete next[rhythm]
      saveEcgMeta(next)
      return next
    })
  }, [])

  return {
    drugs,
    updateDrug,
    resetDrugs,
    ecgImages,
    setEcgImage,
    updateEcgMeta,
    removeEcgImage,
  }
}
