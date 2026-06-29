import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { supabase, BUCKET } from '../lib/supabase'

export type Slide = {
  id: string
  title: string
  note: string
  imageDataUrl: string | null
  storageUrl?: string
}

const INDEX_PATH = 'board-slides/index.json'

async function saveIndex(slides: Slide[]) {
  if (!supabase) return
  // Strip base64 data before saving to keep the JSON small
  const meta = slides.map(({ imageDataUrl: _, ...s }) => s)
  const blob = new Blob([JSON.stringify(meta)], { type: 'application/json' })
  await supabase.storage.from(BUCKET).upload(INDEX_PATH, blob, { upsert: true, contentType: 'application/json' })
}

async function loadIndex(): Promise<Slide[] | null> {
  if (!supabase) return null
  try {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(INDEX_PATH)
    const res = await fetch(`${data.publicUrl}?t=${Date.now()}`) // bust cache
    if (!res.ok) return null
    const meta: Omit<Slide, 'imageDataUrl'>[] = await res.json()
    return meta.map(s => ({ ...s, imageDataUrl: null }))
  } catch {
    return null
  }
}

async function uploadSlideToSupabase(slideId: string, file: File): Promise<string | null> {
  if (!supabase) return null
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `board-slides/${slideId}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) { console.error('[TeachingBoard] upload error', error); return null }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => resolve(ev.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function useTeachingBoard() {
  const [slides, setSlides] = useLocalStorage<Slide[]>('acls-board-slides', [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [synced, setSynced] = useState(false)

  // On mount: load from Supabase index (overrides localStorage on other devices)
  useEffect(() => {
    loadIndex().then(remote => {
      if (remote) setSlides(remote)
      setSynced(true)
    }).catch(() => setSynced(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const safeIndex = slides.length === 0 ? 0 : Math.min(currentIndex, slides.length - 1)
  const currentSlide = slides[safeIndex] ?? null

  const addSlide = useCallback(async (file: File) => {
    const id = `slide-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const [imageDataUrl, storageUrl] = await Promise.all([
      readFileAsDataUrl(file),
      uploadSlideToSupabase(id, file),
    ])
    const newSlide: Slide = {
      id,
      title: 'Slide',
      note: '',
      imageDataUrl: storageUrl ? null : imageDataUrl,
      storageUrl: storageUrl ?? undefined,
    }
    setSlides((prev) => {
      const next = [...prev, newSlide]
      saveIndex(next)
      return next
    })
    setCurrentIndex(9999)
  }, [setSlides])

  const updateSlide = useCallback((id: string, updates: Partial<Omit<Slide, 'id'>>) => {
    setSlides((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      saveIndex(next)
      return next
    })
  }, [setSlides])

  const deleteSlide = useCallback((id: string) => {
    setSlides((prev) => {
      const next = prev.filter((s) => s.id !== id)
      saveIndex(next)
      return next
    })
    setCurrentIndex((ci) => Math.max(0, ci - 1))
  }, [setSlides])

  const moveSlide = useCallback((id: string, direction: 'up' | 'down') => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx === -1) return prev
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      saveIndex(next)
      return next
    })
  }, [setSlides])

  const goNext = useCallback(() => { setCurrentIndex((i) => i + 1) }, [])
  const goPrev = useCallback(() => { setCurrentIndex((i) => Math.max(0, i - 1)) }, [])
  const goTo = useCallback((index: number) => { setCurrentIndex(index) }, [])

  return {
    slides,
    currentSlide,
    currentIndex: safeIndex,
    synced,
    goNext,
    goPrev,
    goTo,
    addSlide,
    updateSlide,
    deleteSlide,
    moveSlide,
  }
}
