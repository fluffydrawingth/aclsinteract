import { useState, useRef, useCallback } from 'react'
import { Algorithm, AlgorithmAnnotation } from '../../types/algorithm'

interface Props {
  algorithm: Algorithm
  onAnnotationSelect: (a: AlgorithmAnnotation | null) => void
  selectedAnnotationId: string | null
  highlightedNodeId?: string | null
}

export default function AlgorithmViewer({ algorithm, onAnnotationSelect, selectedAnnotationId, highlightedNodeId }: Props) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const zoom = (delta: number) => setScale((s) => Math.min(4, Math.max(0.3, s + delta)))
  const resetView = () => { setScale(1); setTranslate({ x: 0, y: 0 }) }
  const fitWidth = () => { setScale(1); setTranslate({ x: 0, y: 0 }) }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.annotation-dot')) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y }
  }, [translate])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setTranslate({ x: dragStart.current.tx + dx, y: dragStart.current.ty + dy })
  }, [isDragging])

  const onMouseUp = useCallback(() => setIsDragging(false), [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    zoom(e.deltaY > 0 ? -0.1 : 0.1)
  }, [])

  // Priority: staticImageUrl > imageDataUrl > hasBuiltIn SVG > upload placeholder
  const displayImageSrc = algorithm.staticImageUrl ?? algorithm.imageDataUrl ?? null
  const hasImage = displayImageSrc !== null
  const showBuiltIn = !hasImage && algorithm.hasBuiltIn

  if (!hasImage && !showBuiltIn) {
    return <UploadPlaceholder algorithmTitle={algorithm.title} color={algorithm.color} />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-none flex items-center gap-2 px-3 py-1 bg-navy-900/80 border-b border-slate-800">
        <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
          <button onClick={() => zoom(-0.2)} className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-lg font-bold">−</button>
          <button onClick={resetView} className="px-2 h-7 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-xs font-mono">{Math.round(scale * 100)}%</button>
          <button onClick={() => zoom(0.2)} className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-lg font-bold">+</button>
        </div>
        <button onClick={fitWidth} className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700">Fit</button>
        <button onClick={resetView} className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700">Reset</button>
        <div className="flex-1" />
        <span className="text-slate-600 text-xs hidden lg:block">Drag · Scroll to zoom</span>
        {algorithm.annotations.length > 0 && (
          <span className="text-teal-400 text-xs font-semibold">{algorithm.annotations.length} annotations</span>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden relative bg-white ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease',
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="relative">
            {hasImage ? (
              <img
                src={displayImageSrc!}
                alt={algorithm.title}
                className="object-contain select-none shadow-xl"
                draggable={false}
                style={{ maxHeight: '82vh', maxWidth: '85vw' }}
              />
            ) : (
              <BuiltInAlgorithmSVG highlightedNodeId={highlightedNodeId ?? null} />
            )}

            {/* Annotations overlay */}
            {algorithm.annotations.map((ann, i) => (
              <button
                key={ann.id}
                className="annotation-dot absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 shadow-lg hover:scale-110 z-10"
                style={{
                  left: `${ann.x}%`,
                  top: `${ann.y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: selectedAnnotationId === ann.id ? '#14b8a6' : '#1e293b',
                  borderColor: selectedAnnotationId === ann.id ? '#14b8a6' : '#64748b',
                  color: selectedAnnotationId === ann.id ? 'white' : '#94a3b8',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onAnnotationSelect(selectedAnnotationId === ann.id ? null : ann)
                }}
                title={ann.title}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadPlaceholder({ algorithmTitle, color }: { algorithmTitle: string; color: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: color + '20' }}>
          <svg className="w-10 h-10" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{algorithmTitle}</h3>
        <p className="text-slate-400 text-sm mb-1">ยังไม่มีรูป Algorithm</p>
        <p className="text-slate-500 text-xs">อัปโหลดรูปภาพ Algorithm ผ่านการ์ดใน Algorithm Library</p>
      </div>
    </div>
  )
}

function BuiltInAlgorithmSVG({ highlightedNodeId }: { highlightedNodeId: string | null }) {
  const nodes = [
    { id: 'arrest', label: 'Cardiac Arrest', x: 160, y: 20, w: 180, h: 44, type: 'decision' },
    { id: 'cpr', label: 'Start CPR\n100–120/min', x: 160, y: 90, w: 180, h: 50, type: 'action' },
    { id: 'monitor', label: 'ติด Monitor / Defibrillator', x: 160, y: 166, w: 180, h: 44, type: 'action' },
    { id: 'rhythm', label: 'Rhythm Check\n(ทุก 2 นาที)', x: 160, y: 236, w: 180, h: 50, type: 'decision' },
    { id: 'shock', label: 'VF / pVT\n→ Shock', x: 30, y: 316, w: 140, h: 50, type: 'action' },
    { id: 'noshock', label: 'PEA / Asystole\n→ CPR + Epi', x: 330, y: 316, w: 140, h: 50, type: 'outcome' },
    { id: 'epi', label: 'Epinephrine 1mg\nq3–5 min', x: 30, y: 392, w: 140, h: 50, type: 'drug' },
    { id: 'amio', label: 'Amiodarone 300mg\nor Lidocaine', x: 30, y: 468, w: 140, h: 50, type: 'drug' },
    { id: 'rosc', label: 'ROSC?', x: 30, y: 544, w: 140, h: 44, type: 'outcome' },
    { id: 'hts', label: "H's & T's\nReversible Causes", x: 330, y: 392, w: 140, h: 50, type: 'action' },
  ]

  const edges = [
    { from: 'arrest', to: 'cpr' },
    { from: 'cpr', to: 'monitor' },
    { from: 'monitor', to: 'rhythm' },
    { from: 'rhythm', to: 'shock' },
    { from: 'rhythm', to: 'noshock' },
    { from: 'shock', to: 'epi' },
    { from: 'epi', to: 'amio' },
    { from: 'amio', to: 'rosc' },
    { from: 'noshock', to: 'hts' },
  ]

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  const typeColor: Record<string, string> = {
    decision: '#1e40af',
    action: '#1e3a5f',
    drug: '#581c87',
    outcome: '#14532d',
  }

  const typeBorder: Record<string, string> = {
    decision: '#3b82f6',
    action: '#0ea5e9',
    drug: '#a855f7',
    outcome: '#22c55e',
  }

  return (
    <svg viewBox="0 0 500 620" width="500" height="620" className="select-none">
      <defs>
        <marker id="arrow-b" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#475569" />
        </marker>
      </defs>

      {edges.map((e, i) => {
        const f = nodeMap.get(e.from)
        const t = nodeMap.get(e.to)
        if (!f || !t) return null
        const fx = f.x + f.w / 2
        const fy = f.y + f.h
        const tx = t.x + t.w / 2
        const ty = t.y
        const mid = (fy + ty) / 2
        const d = Math.abs(fx - tx) > 10
          ? `M ${fx} ${fy} C ${fx} ${mid} ${tx} ${mid} ${tx} ${ty}`
          : `M ${fx} ${fy} L ${tx} ${ty}`
        return <path key={i} d={d} stroke="#475569" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-b)" />
      })}

      {nodes.map((node) => {
        const isHighlighted = highlightedNodeId === node.id
        return (
        <g key={node.id}>
          <rect
            x={node.x} y={node.y} width={node.w} height={node.h} rx="8"
            fill={isHighlighted ? (typeBorder[node.type] ?? '#475569') + '40' : (typeColor[node.type] ?? '#1e293b')}
            stroke={isHighlighted ? '#ffffff' : (typeBorder[node.type] ?? '#475569')}
            strokeWidth={isHighlighted ? '2.5' : '1.5'}
          />
          {node.label.split('\n').map((line, i, arr) => (
            <text
              key={i}
              x={node.x + node.w / 2}
              y={node.y + node.h / 2 + (i - (arr.length - 1) / 2) * 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="11"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              {line}
            </text>
          ))}
        </g>
        )
      })}

      {/* Label */}
      <text x="250" y="608" textAnchor="middle" fill="#334155" fontSize="10" fontFamily="Inter, sans-serif">
        ACLS Cardiac Arrest Algorithm — Built-in Placeholder
      </text>
    </svg>
  )
}
