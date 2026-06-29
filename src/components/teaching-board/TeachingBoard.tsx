import { useRef, useState, useCallback, useEffect } from 'react'
import { useTeachingBoard, Slide } from '../../hooks/useTeachingBoard'

interface PointerRipple {
  id: number
  x: number // percentage
  y: number // percentage
}

interface Props {
  board: ReturnType<typeof useTeachingBoard>
}

export default function TeachingBoard({ board }: Props) {
  const { slides, currentSlide, currentIndex, goNext, goPrev, goTo, addSlide, updateSlide, deleteSlide, moveSlide } = board
  const [fullscreen, setFullscreen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => addSlide(file))
  }, [addSlide])

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  // Keyboard navigation (when not fullscreen — fullscreen handles its own)
  useEffect(() => {
    if (fullscreen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fullscreen, goNext, goPrev])

  // Empty state
  if (slides.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUploadFiles(e.target.files)}
        />
        <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          <svg className="w-9 h-9 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-base">Teaching Board</p>
          <p className="text-slate-400 text-sm mt-1">อัพโหลดสไลด์หรือรูปภาพสำหรับสอน</p>
          <p className="text-slate-500 text-xs mt-0.5">รองรับ PNG, JPG, PDF screenshot</p>
        </div>
        <button
          onClick={triggerUpload}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-100 shadow-lg shadow-teal-500/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          อัพโหลดรูปภาพ
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUploadFiles(e.target.files)}
      />

      {/* ── Left: Slide List ─────────────────────────────────── */}
      <div className="w-24 flex-none bg-navy-950 border-r border-slate-800 flex flex-col overflow-hidden">
        {/* Add button */}
        <button
          onClick={triggerUpload}
          className="flex-none flex items-center justify-center gap-1 py-2.5 text-xs font-bold text-teal-400 hover:bg-teal-500/10 border-b border-slate-800 transition-colors"
          title="อัพโหลดรูป"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>

        {/* Thumbnails */}
        <div className="flex-1 overflow-y-auto py-1.5 space-y-1 px-1.5">
          {slides.map((slide, idx) => (
            <SlideThumb
              key={slide.id}
              slide={slide}
              index={idx}
              isActive={idx === currentIndex}
              isFirst={idx === 0}
              isLast={idx === slides.length - 1}
              onClick={() => goTo(idx)}
              onMoveUp={() => moveSlide(slide.id, 'up')}
              onMoveDown={() => moveSlide(slide.id, 'down')}
            />
          ))}
        </div>
      </div>

      {/* ── Right: Main Content ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex-none px-3 py-2 border-b border-slate-800 flex items-center gap-2">
          {/* Navigation */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-slate-300 text-xs font-mono font-bold min-w-[36px] text-center">
            {currentIndex + 1}<span className="text-slate-600">/{slides.length}</span>
          </span>
          <button
            onClick={goNext}
            disabled={currentIndex >= slides.length - 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Delete */}
          <button
            onClick={() => currentSlide && deleteSlide(currentSlide.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="ลบสไลด์นี้"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="เต็มจอ"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* Image area with pointer effect */}
        <SlideView slide={currentSlide} onUpload={triggerUpload} />

        {/* Title + Notes editor */}
        {currentSlide && (
          <div className="flex-none border-t border-slate-800 p-3 space-y-2 bg-navy-950">
            <input
              value={currentSlide.title}
              onChange={(e) => updateSlide(currentSlide.id, { title: e.target.value })}
              placeholder="ชื่อสไลด์..."
              className="w-full bg-transparent text-white font-bold text-sm border border-transparent hover:border-slate-700 focus:border-teal-500 rounded-lg px-2 py-1 focus:outline-none transition-colors placeholder-slate-600"
            />
            <textarea
              value={currentSlide.note}
              onChange={(e) => updateSlide(currentSlide.id, { note: e.target.value })}
              placeholder="Speaker notes — จุดสำคัญที่ต้องพูดถึง..."
              rows={2}
              className="w-full bg-navy-900 text-slate-300 text-xs rounded-lg px-2 py-1.5 border border-slate-700 focus:border-teal-500 focus:outline-none resize-none placeholder-slate-600 transition-colors leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* ── Fullscreen Overlay ────────────────────────────────── */}
      {fullscreen && currentSlide && (
        <FullscreenView
          slides={slides}
          currentIndex={currentIndex}
          currentSlide={currentSlide}
          onClose={() => setFullscreen(false)}
          onNext={goNext}
          onPrev={goPrev}
          onGoTo={goTo}
        />
      )}
    </div>
  )
}

// ── SlideView: image area with pointer ripple ─────────────────────────────────

function SlideView({ slide, onUpload }: { slide: Slide | undefined; onUpload: () => void }) {
  const [ripples, setRipples] = useState<PointerRipple[]>([])
  const areaRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = areaRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const id = nextId.current++
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 900)
  }

  return (
    <div
      ref={areaRef}
      className="flex-1 bg-slate-950 flex items-center justify-center relative min-h-0 overflow-hidden cursor-crosshair"
      onClick={handleClick}
    >
      {(slide?.storageUrl ?? slide?.imageDataUrl) ? (
        <img
          src={slide!.storageUrl ?? slide!.imageDataUrl!}
          alt={slide!.title}
          className="max-w-full max-h-full object-contain pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-700">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <button
            onClick={(e) => { e.stopPropagation(); onUpload() }}
            className="text-xs text-slate-600 hover:text-teal-400 transition-colors underline"
          >
            อัพโหลดรูปภาพ
          </button>
        </div>
      )}

      {ripples.map(r => <PointerRippleEffect key={r.id} x={r.x} y={r.y} />)}
    </div>
  )
}

// ── Pointer ripple animation ──────────────────────────────────────────────────

function PointerRippleEffect({ x, y }: { x: number; y: number }) {
  return (
    <>
      <style>{`
        @keyframes ripple-inner {
          0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.4); }
          25%  { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes ripple-ring {
          0%   { opacity: 0.85; transform: translate(-50%, -50%) scale(0.4); }
          100% { opacity: 0;    transform: translate(-50%, -50%) scale(4.5); }
        }
      `}</style>
      <div
        className="absolute pointer-events-none"
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        {/* Solid dot */}
        <div style={{
          position: 'absolute', width: 20, height: 20,
          borderRadius: '50%',
          border: '2.5px solid #ef4444',
          boxShadow: '0 0 8px #ef444488',
          animation: 'ripple-inner 0.85s ease-out forwards',
        }} />
        {/* Ring 1 */}
        <div style={{
          position: 'absolute', width: 20, height: 20,
          borderRadius: '50%',
          border: '2px solid #ef444499',
          animation: 'ripple-ring 0.85s ease-out forwards',
        }} />
        {/* Ring 2 (delayed) */}
        <div style={{
          position: 'absolute', width: 20, height: 20,
          borderRadius: '50%',
          border: '1.5px solid #ef444455',
          animation: 'ripple-ring 0.85s ease-out 0.18s forwards',
        }} />
      </div>
    </>
  )
}

// ── SlideThumb ────────────────────────────────────────────────────────────────

function SlideThumb({
  slide,
  index,
  isActive,
  isFirst,
  isLast,
  onClick,
  onMoveUp,
  onMoveDown,
}: {
  slide: Slide
  index: number
  isActive: boolean
  isFirst: boolean
  isLast: boolean
  onClick: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div
      className={`relative group rounded-lg overflow-hidden cursor-pointer transition-all border ${
        isActive
          ? 'border-teal-500 ring-1 ring-teal-500/30'
          : 'border-slate-700/60 hover:border-slate-500'
      }`}
      onClick={onClick}
    >
      {/* Thumbnail image */}
      <div className="aspect-video bg-slate-900 flex items-center justify-center">
        {(slide.storageUrl ?? slide.imageDataUrl) ? (
          <img src={slide.storageUrl ?? slide.imageDataUrl!} alt={slide.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
          </svg>
        )}
      </div>
      {/* Slide number */}
      <div className="px-1 py-0.5 text-center">
        <span className={`text-[10px] font-bold ${isActive ? 'text-teal-400' : 'text-slate-500'}`}>
          {index + 1}
        </span>
      </div>
      {/* Reorder buttons (show on hover) */}
      <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isFirst && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp() }}
            className="w-4 h-4 rounded bg-slate-800/90 text-slate-300 hover:text-white flex items-center justify-center text-[10px] transition-colors"
            title="ขึ้น"
          >
            ↑
          </button>
        )}
        {!isLast && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown() }}
            className="w-4 h-4 rounded bg-slate-800/90 text-slate-300 hover:text-white flex items-center justify-center text-[10px] transition-colors"
            title="ลง"
          >
            ↓
          </button>
        )}
      </div>
    </div>
  )
}

// ── FullscreenView ────────────────────────────────────────────────────────────

function FullscreenView({
  slides,
  currentIndex,
  currentSlide,
  onClose,
  onNext,
  onPrev,
  onGoTo,
}: {
  slides: Slide[]
  currentIndex: number
  currentSlide: Slide
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  onGoTo: (i: number) => void
}) {
  const [ripples, setRipples] = useState<PointerRipple[]>([])
  const areaRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNext, onPrev, onClose])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = areaRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const id = nextId.current++
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 900)
  }

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col"
      style={{ zIndex: 200 }}
    >
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-base">{currentSlide.title}</span>
          <span className="text-slate-500 text-sm font-mono">{currentIndex + 1} / {slides.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex >= slides.length - 1}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/30 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main image with ripple */}
      <div
        ref={areaRef}
        className="flex-1 flex items-center justify-center p-6 min-h-0 relative cursor-crosshair"
        onClick={handleClick}
      >
        {(currentSlide.storageUrl ?? currentSlide.imageDataUrl) ? (
          <img
            src={currentSlide.storageUrl ?? currentSlide.imageDataUrl!}
            alt={currentSlide.title}
            className="max-w-full max-h-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="text-slate-600 text-xl">No image</div>
        )}

        {ripples.map(r => <PointerRippleEffect key={r.id} x={r.x} y={r.y} />)}
      </div>

      {/* Speaker note */}
      {currentSlide.note && (
        <div className="flex-none px-6 py-3 bg-black/60 border-t border-white/10">
          <p className="text-slate-300 text-sm leading-relaxed">{currentSlide.note}</p>
        </div>
      )}

      {/* Slide strip (bottom) */}
      {slides.length > 1 && (
        <div className="flex-none flex gap-2 px-6 py-3 bg-black/40 border-t border-white/5 overflow-x-auto">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => onGoTo(idx)}
              className={`flex-none w-14 aspect-video rounded overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-teal-400 opacity-100' : 'border-white/10 opacity-50 hover:opacity-80'
              }`}
            >
              {(s.storageUrl ?? s.imageDataUrl) ? (
                <img src={s.storageUrl ?? s.imageDataUrl!} alt={s.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <span className="text-slate-600 text-[10px]">{idx + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
