import { useState } from 'react'
import { Algorithm, AlgorithmAnnotation } from '../../types/algorithm'
import AlgorithmCard from './AlgorithmCard'
import AlgorithmViewer from './AlgorithmViewer'

interface Props {
  algorithms: Algorithm[]
  activeAlgorithmId: string
  onSetActive: (id: string) => void
  onUpload: (id: string, dataUrl: string) => void
  onRemoveImage: (id: string) => void
  onAddAnnotation: (id: string, annotation: AlgorithmAnnotation) => void
  onRemoveAnnotation: (algorithmId: string, annotationId: string) => void
  highlightedNodeId?: string | null
}

export default function AlgorithmLibrary({
  algorithms,
  activeAlgorithmId,
  onSetActive,
  onUpload,
  onRemoveImage,
  onAddAnnotation,
  onRemoveAnnotation,
  highlightedNodeId,
}: Props) {
  const [viewMode, setViewMode] = useState<'library' | 'viewer'>('viewer')
  const [selectedAnnotation, setSelectedAnnotation] = useState<AlgorithmAnnotation | null>(null)
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false)

  const activeAlgorithm = algorithms.find((a) => a.id === activeAlgorithmId) ?? algorithms[0]

  const handleAnnotationAdd = (x: number, y: number) => {
    if (!isAddingAnnotation) return
    const ann: AlgorithmAnnotation = {
      id: `ann-${Date.now()}`,
      x, y,
      title: 'Teaching Point',
      explanation: 'เพิ่มคำอธิบายที่นี่',
      keyPoints: [],
      discussionQuestion: '',
    }
    onAddAnnotation(activeAlgorithmId, ann)
    setIsAddingAnnotation(false)
  }

  void handleAnnotationAdd

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Library sidebar */}
      {viewMode === 'library' && (
        <div className="w-72 flex-none bg-navy-800 border-r border-slate-700/60 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
            <h3 className="text-white font-bold text-sm">Algorithm Library</h3>
            <button
              onClick={() => setViewMode('viewer')}
              className="text-slate-400 hover:text-white text-xs transition-colors"
            >
              ปิด ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {algorithms.map((alg) => (
              <AlgorithmCard
                key={alg.id}
                algorithm={alg}
                isActive={alg.id === activeAlgorithmId}
                onSelect={() => { onSetActive(alg.id); setViewMode('viewer') }}
                onUpload={(url) => onUpload(alg.id, url)}
                onRemoveImage={() => onRemoveImage(alg.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Center: Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Viewer header */}
        <div className="flex-none flex items-center gap-3 px-4 py-1.5 bg-navy-800/80 border-b border-slate-700/40">
          <button
            onClick={() => setViewMode((m) => m === 'library' ? 'viewer' : 'library')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Library
          </button>

          <div className="h-4 w-px bg-slate-700" />

          {/* Algorithm selector tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
            {algorithms.map((alg) => (
              <button
                key={alg.id}
                onClick={() => onSetActive(alg.id)}
                className={`flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                  ${activeAlgorithmId === alg.id
                    ? 'text-white'
                    : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
                  }`}
                style={activeAlgorithmId === alg.id ? { backgroundColor: alg.color + '30', color: alg.color } : {}}
              >
                {alg.titleEn}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm viewer */}
        <div className="flex-1 overflow-hidden">
          <AlgorithmViewer
            algorithm={activeAlgorithm}
            onAnnotationSelect={setSelectedAnnotation}
            selectedAnnotationId={selectedAnnotation?.id ?? null}
            highlightedNodeId={highlightedNodeId}
          />
        </div>
      </div>

      {/* Right: Annotation detail panel */}
      {selectedAnnotation && (
        <div className="w-72 flex-none bg-navy-800 border-l border-slate-700/60 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Annotation Detail</span>
            <button
              onClick={() => setSelectedAnnotation(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-navy-900/60 border border-slate-700/40 rounded-xl p-3">
              <div className="text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">Teaching Point</div>
              <div className="text-white font-bold text-sm">{selectedAnnotation.title}</div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">{selectedAnnotation.explanation}</p>

            {selectedAnnotation.keyPoints.length > 0 && (
              <div>
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Key Points</div>
                <ul className="space-y-2">
                  {selectedAnnotation.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-none" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedAnnotation.discussionQuestion && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                <div className="text-yellow-400 text-xs font-semibold mb-1">คำถามผู้เรียน</div>
                <p className="text-yellow-200 text-sm italic">{selectedAnnotation.discussionQuestion}</p>
              </div>
            )}

            <button
              onClick={() => {
                onRemoveAnnotation(activeAlgorithmId, selectedAnnotation.id)
                setSelectedAnnotation(null)
              }}
              className="w-full py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-sm transition-colors border border-transparent hover:border-red-500/20"
            >
              ลบ Annotation นี้
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
