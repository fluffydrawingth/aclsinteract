import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  imageUrl: string
  title: string
  subtitle?: string
  onClose: () => void
}

export default function EcgLightbox({ imageUrl, title, subtitle, onClose }: Props) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const dragRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z * 1.2, 10))
      if (e.key === '-') setZoom(z => Math.max(z / 1.2, 0.25))
      if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.15 : 0.87
    setZoom(z => Math.min(Math.max(z * factor, 0.25), 10))
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setDragging(true)
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.x),
      y: dragRef.current.panY + (e.clientY - dragRef.current.y),
    })
  }, [dragging])

  const stopDrag = () => setDragging(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const zoomIn  = () => setZoom(z => Math.min(z * 1.3, 10))
  const zoomOut = () => setZoom(z => Math.max(z / 1.3, 0.25))
  const reset   = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] bg-black/97 flex flex-col select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Header */}
      <div className="flex-none flex items-center gap-3 px-4 py-3 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm leading-tight truncate">{title}</div>
          {subtitle && <div className="text-slate-400 text-xs mt-0.5 truncate">{subtitle}</div>}
        </div>

        <div className="flex items-center gap-1.5 flex-none">
          {/* Zoom out */}
          <button
            onClick={zoomOut}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition-colors"
            title="Zoom out (−)"
          >−</button>

          {/* Zoom level */}
          <button
            onClick={reset}
            className="text-slate-300 text-xs font-mono w-14 text-center py-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Reset zoom (0)"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom in */}
          <button
            onClick={zoomIn}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition-colors"
            title="Zoom in (+)"
          >+</button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Fullscreen (F11)"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/40 text-white flex items-center justify-center transition-colors"
            title="Close (Esc)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image canvas */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <img
          src={imageUrl}
          alt={title}
          draggable={false}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.08s ease',
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Footer hint */}
      <div className="flex-none py-2 text-center text-slate-700 text-[10px] font-mono">
        Scroll to zoom · Drag to pan · press 0 to reset · Esc to close
      </div>
    </div>
  )
}
