import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Slide = {
  id: string
  title: string
  note: string
  imageDataUrl: string | null
}

export function useTeachingBoard() {
  const [slides, setSlides] = useLocalStorage<Slide[]>('acls-board-slides', [])
  const [currentIndex, setCurrentIndex] = useState(0)

  // safeIndex always stays in bounds
  const safeIndex = slides.length === 0 ? 0 : Math.min(currentIndex, slides.length - 1)
  const currentSlide = slides[safeIndex] ?? null

  const addSlide = useCallback((imageDataUrl: string | null = null) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: 'Slide',
      note: '',
      imageDataUrl,
    }
    setSlides((prev) => [...prev, newSlide])
    setCurrentIndex(9999) // safeIndex clamps to slides.length - 1
  }, [setSlides])

  const updateSlide = useCallback((id: string, updates: Partial<Omit<Slide, 'id'>>) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [setSlides])

  const deleteSlide = useCallback((id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id))
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
      return next
    })
  }, [setSlides])

  const goNext = useCallback(() => {
    setCurrentIndex((i) => i + 1) // safeIndex clamps
  }, [])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }, [])

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  return {
    slides,
    currentSlide,
    currentIndex: safeIndex,
    goNext,
    goPrev,
    goTo,
    addSlide,
    updateSlide,
    deleteSlide,
    moveSlide,
  }
}
