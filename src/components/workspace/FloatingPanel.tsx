import { useRef, useCallback } from 'react'
import { PanelId } from '../../hooks/usePanelManager'

interface Props {
  id: PanelId
  title: string
  icon: React.ReactNode
  isOpen: boolean
  isMinimized: boolean
  isDocked: boolean
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  onClose: () => void
  onMinimize: () => void
  onDock: () => void
  onMove: (x: number, y: number) => void
  onFocus: () => void
  children: React.ReactNode
  accentColor?: string
  dockSide?: 'left' | 'right'
}

// Dock rail width
const DOCK_WIDTH = 300
const TOOLBAR_H = 48
const ACTION_H = 88
const TIMELINE_H = 72

export default function FloatingPanel({
  title, icon, isOpen, isMinimized, isDocked,
  x, y, width, height, zIndex,
  onClose, onMinimize, onDock, onMove, onFocus,
  children, accentColor = '#14b8a6', dockSide = 'left',
}: Props) {
  const dragOrigin = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  const onHeaderMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: x, py: y }

    const handleMove = (ev: MouseEvent) => {
      if (!dragOrigin.current) return
      const nx = dragOrigin.current.px + (ev.clientX - dragOrigin.current.mx)
      const ny = dragOrigin.current.py + (ev.clientY - dragOrigin.current.my)
      onMove(Math.max(0, nx), Math.max(TOOLBAR_H, ny))
    }
    const handleUp = () => {
      dragOrigin.current = null
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [x, y, onMove])

  if (!isOpen) return null

  // Docked: stick to left or right edge
  const dockedStyle: React.CSSProperties = isDocked ? {
    position: 'fixed',
    ...(dockSide === 'left' ? { left: 0 } : { right: 0 }),
    top: TOOLBAR_H,
    width: DOCK_WIDTH,
    height: `calc(100vh - ${TOOLBAR_H + ACTION_H + TIMELINE_H}px)`,
    zIndex,
  } : {
    position: 'fixed',
    left: x,
    top: y,
    width,
    height: isMinimized ? 40 : height,
    zIndex,
  }

  return (
    <div
      style={dockedStyle}
      className="flex flex-col bg-navy-800 border border-slate-700/70 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
      onMouseDown={onFocus}
    >
      {/* Header */}
      <div
        className={`flex-none flex items-center gap-2 px-3 h-10 border-b border-slate-700/60 select-none ${isDocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ background: `linear-gradient(90deg, ${accentColor}18, transparent)` }}
        onMouseDown={onHeaderMouseDown}
      >
        <span className="text-base">{icon}</span>
        <span className="text-white font-semibold text-sm flex-1 truncate">{title}</span>

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          {/* Dock toggle */}
          <button
            onClick={onDock}
            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700/60 rounded transition-colors"
            title={isDocked ? 'Undock' : `Dock to ${dockSide}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isDocked ? 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' : 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18'} />
            </svg>
          </button>
          {/* Minimize */}
          <button
            onClick={onMinimize}
            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700/60 rounded transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
            </svg>
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Close"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  )
}
