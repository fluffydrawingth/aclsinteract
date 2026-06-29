import { useState, useCallback } from 'react'

export type PanelId = 'algorithm' | 'notes' | 'drugs' | 'hsts' | 'timer' | 'board'

export type Panel = {
  id: PanelId
  isOpen: boolean
  x: number
  y: number
  width: number
  height: number
  isDocked: boolean
  isMinimized: boolean
  zIndex: number
}

const defaultPanels: Panel[] = [
  { id: 'algorithm', isOpen: false, x: 50,  y: 60, width: 660, height: 600, isDocked: false, isMinimized: false, zIndex: 10 },
  { id: 'notes',     isOpen: false, x: 60,  y: 60, width: 340, height: 420, isDocked: false, isMinimized: false, zIndex: 10 },
  { id: 'drugs',     isOpen: false, x: 60,  y: 80, width: 620, height: 520, isDocked: false, isMinimized: false, zIndex: 10 },
  { id: 'hsts',      isOpen: false, x: 60,  y: 80, width: 660, height: 500, isDocked: false, isMinimized: false, zIndex: 10 },
  { id: 'timer',     isOpen: false, x: 440, y: 80, width: 400, height: 420, isDocked: false, isMinimized: false, zIndex: 10 },
  { id: 'board',     isOpen: false, x: 100, y: 60, width: 700, height: 560, isDocked: false, isMinimized: false, zIndex: 10 },
]

let topZ = 20

export function usePanelManager() {
  const [panels, setPanels] = useState<Panel[]>(defaultPanels)

  const bringToFront = useCallback((id: PanelId) => {
    topZ += 1
    setPanels((prev) => prev.map((p) => p.id === id ? { ...p, zIndex: topZ } : p))
  }, [])

  const togglePanel = useCallback((id: PanelId) => {
    setPanels((prev) => prev.map((p) => {
      if (p.id !== id) return p
      if (!p.isOpen) {
        topZ += 1
        return { ...p, isOpen: true, isMinimized: false, zIndex: topZ }
      }
      return { ...p, isOpen: false }
    }))
  }, [])

  const openPanel = useCallback((id: PanelId) => {
    topZ += 1
    setPanels((prev) => prev.map((p) =>
      p.id === id ? { ...p, isOpen: true, isMinimized: false, zIndex: topZ } : p
    ))
  }, [])

  const closePanel = useCallback((id: PanelId) => {
    setPanels((prev) => prev.map((p) => p.id === id ? { ...p, isOpen: false } : p))
  }, [])

  const minimizePanel = useCallback((id: PanelId) => {
    setPanels((prev) => prev.map((p) => p.id === id ? { ...p, isMinimized: !p.isMinimized } : p))
  }, [])

  const dockPanel = useCallback((id: PanelId) => {
    setPanels((prev) => prev.map((p) => p.id === id ? { ...p, isDocked: !p.isDocked } : p))
  }, [])

  const movePanel = useCallback((id: PanelId, x: number, y: number) => {
    setPanels((prev) => prev.map((p) => p.id === id ? { ...p, x, y, isDocked: false } : p))
  }, [])

  const panel = (id: PanelId) => panels.find((p) => p.id === id)!

  return { panels, panel, togglePanel, openPanel, closePanel, minimizePanel, dockPanel, movePanel, bringToFront }
}
