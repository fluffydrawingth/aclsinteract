import { useState, useRef } from 'react'
import { algorithmNodes, AlgorithmNode as NodeData } from '../data/algorithmNodes'
import AlgorithmNodeComponent from './AlgorithmNode'

interface Props {
  onClose: () => void
}

// Build edges from nextIds
function buildEdges(nodes: NodeData[]) {
  const edges: { from: NodeData; to: NodeData; label?: string }[] = []
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  nodes.forEach((node) => {
    node.nextIds.forEach((toId, i) => {
      const target = nodeMap.get(toId)
      if (target) {
        let label: string | undefined
        if (node.id === 'rhythm-check') {
          label = i === 0 ? 'Shockable' : 'Non-Shockable'
        }
        edges.push({ from: node, to: target, label })
      }
    })
  })
  return edges
}

function edgePath(from: NodeData, to: NodeData) {
  const fx = from.x + from.width / 2
  const fy = from.y + from.height
  const tx = to.x + to.width / 2
  const ty = to.y

  if (Math.abs(fx - tx) < 10) {
    return `M ${fx} ${fy} L ${tx} ${ty}`
  }
  const my = (fy + ty) / 2
  return `M ${fx} ${fy} C ${fx} ${my} ${tx} ${my} ${tx} ${ty}`
}

const CANVAS_W = 800
const CANVAS_H = 1100

export default function AlgorithmOverlay({ onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [scale, setScale] = useState(0.75)
  const containerRef = useRef<HTMLDivElement>(null)
  const edges = buildEdges(algorithmNodes)
  const selectedNode = algorithmNodes.find((n) => n.id === selectedId)

  const zoom = (delta: number) => setScale((s) => Math.min(2, Math.max(0.3, s + delta)))
  const reset = () => setScale(0.75)

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-6 py-4 bg-navy-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Cardiac Arrest Algorithm</h2>
            <p className="text-slate-400 text-xs">Click any box to view details · ACLS 2025 Guidelines</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => zoom(-0.15)}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-lg font-bold"
              title="Zoom out"
            >
              −
            </button>
            <button
              onClick={reset}
              className="px-3 h-8 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-xs font-mono"
              title="Reset zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={() => zoom(0.15)}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-lg font-bold"
              title="Zoom in"
            >
              +
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Patient
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-none flex items-center gap-4 px-6 py-2 bg-navy-800/60 border-b border-slate-700/40 text-xs">
        <span className="text-slate-500 font-medium">Legend:</span>
        {[
          { color: 'bg-blue-500/60 border-blue-500', label: 'Action' },
          { color: 'bg-amber-500/60 border-amber-500', label: 'Decision' },
          { color: 'bg-purple-500/60 border-purple-500', label: 'Drug' },
          { color: 'bg-green-500/60 border-green-500', label: 'Outcome' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${item.color} border`} />
            <span className="text-slate-400">{item.label}</span>
          </div>
        ))}
        {selectedId && (
          <button
            onClick={() => setSelectedId(null)}
            className="ml-auto text-slate-400 hover:text-white flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear selection
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Algorithm canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-navy-900/50 flex items-start justify-center p-8"
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              width: CANVAS_W,
              height: CANVAS_H,
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          >
            <svg
              width={CANVAS_W}
              height={CANVAS_H}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              className="overflow-visible"
            >
              {/* Arrow marker */}
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
                </marker>
                <marker id="arrow-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#14b8a6" />
                </marker>
              </defs>

              {/* Edges */}
              {edges.map((edge, i) => {
                const isConnected =
                  selectedId &&
                  (edge.from.id === selectedId || edge.to.id === selectedId)
                const d = edgePath(edge.from, edge.to)
                const mx = (edge.from.x + edge.from.width / 2 + edge.to.x + edge.to.width / 2) / 2
                const my = (edge.from.y + edge.from.height + edge.to.y) / 2

                return (
                  <g key={i}>
                    <path
                      d={d}
                      stroke={isConnected ? '#14b8a6' : '#374151'}
                      strokeWidth={isConnected ? 2 : 1.5}
                      fill="none"
                      markerEnd={isConnected ? 'url(#arrow-selected)' : 'url(#arrow)'}
                      className="transition-all duration-200"
                    />
                    {edge.label && (
                      <text
                        x={mx}
                        y={my}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Nodes */}
              {algorithmNodes.map((node) => (
                <AlgorithmNodeComponent
                  key={node.id}
                  node={node}
                  isSelected={selectedId === node.id}
                  isDimmed={!!selectedId && selectedId !== node.id}
                  onClick={() => setSelectedId((prev) => (prev === node.id ? null : node.id))}
                  scale={scale}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Side panel: node details */}
        <div
          className={`flex-none transition-all duration-300 overflow-hidden ${
            selectedNode ? 'w-80 border-l border-slate-700' : 'w-0'
          } bg-navy-800 flex flex-col`}
        >
          {selectedNode && (
            <>
              <div className="px-5 py-4 border-b border-slate-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{selectedNode.type}</div>
                <h3 className="text-white font-bold text-base leading-snug whitespace-pre-line">{selectedNode.label}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">{selectedNode.explanation}</p>
                <div>
                  <div className="text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1 h-3 bg-teal-400 rounded-full" />
                    Key Points
                  </div>
                  <ul className="space-y-2">
                    {selectedNode.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-none" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-4 border-t border-slate-700">
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-full text-center text-slate-500 hover:text-white text-sm transition-colors py-1"
                >
                  Deselect
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hint bar */}
      <div className="flex-none py-2 text-center text-xs text-slate-600 bg-navy-900 border-t border-slate-800">
        Educational placeholder — replace SVG with official ACLS algorithm artwork when licensed
      </div>
    </div>
  )
}
