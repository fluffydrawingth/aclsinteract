import { useRef } from 'react'
import { Algorithm } from '../../types/algorithm'

interface Props {
  algorithm: Algorithm
  isActive: boolean
  onSelect: () => void
  onUpload: (dataUrl: string) => void
  onRemoveImage: () => void
}

export default function AlgorithmCard({ algorithm, isActive, onSelect, onUpload, onRemoveImage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (result) onUpload(result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div
      className={`relative border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200
        ${isActive
          ? 'border-white/30 shadow-lg shadow-black/30 scale-[1.02]'
          : 'border-slate-700/60 hover:border-slate-600'
        }`}
      style={isActive ? { borderColor: algorithm.color + '60' } : {}}
      onClick={onSelect}
    >
      {/* Color accent top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: algorithm.color }} />

      {/* Image area */}
      <div className="bg-navy-900/60 aspect-video flex items-center justify-center relative">
        {algorithm.imageDataUrl ? (
          <img
            src={algorithm.imageDataUrl}
            alt={algorithm.titleEn}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center p-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: algorithm.color + '20' }}
            >
              <svg className="w-5 h-5" style={{ color: algorithm.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            {algorithm.hasBuiltIn ? (
              <p className="text-slate-400 text-xs">Built-in algorithm</p>
            ) : (
              <p className="text-slate-600 text-xs">ยังไม่มีรูปภาพ</p>
            )}
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: algorithm.color }}>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-navy-800 p-3">
        <div className="font-semibold text-white text-sm">{algorithm.title}</div>
        <div className="text-slate-400 text-xs mt-0.5 line-clamp-2">{algorithm.description}</div>

        {/* Upload/Remove controls */}
        <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {algorithm.imageDataUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
          </button>
          {algorithm.imageDataUrl && (
            <button
              onClick={onRemoveImage}
              className="text-xs text-red-500/60 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              ลบรูป
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}
