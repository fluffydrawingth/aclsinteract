interface Props {
  label: string
  findings: string[]
  teachingNote?: string
  warning?: string
  onDismiss: () => void
}

export default function FindingsPanel({ label, findings, teachingNote, warning, onDismiss }: Props) {
  return (
    <div className="absolute z-20 w-52" style={{ top: '14rem', right: '0.75rem' }}>
      <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b"
          style={{ backgroundColor: 'rgba(20,184,166,0.12)', borderColor: 'rgba(20,184,166,0.25)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse flex-none" />
            <span className="text-teal-300 font-bold text-xs leading-tight">{label}</span>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-500 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
          >✕</button>
        </div>

        <div className="px-3 py-2.5 space-y-1.5 max-h-64 overflow-y-auto">
          {/* Findings bullets */}
          {findings.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-teal-500 text-[10px] mt-0.5 flex-none">→</span>
              <span className="text-white text-xs leading-snug">{f}</span>
            </div>
          ))}

          {/* Warning */}
          {warning && (
            <div className="px-2.5 py-1.5 rounded-lg mt-1"
              style={{ backgroundColor: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <span className="text-yellow-300 text-[10px] font-semibold">⚠️ </span>
              <span className="text-yellow-200 text-[10px]">{warning}</span>
            </div>
          )}

          {/* Teaching note */}
          {teachingNote && (
            <div className="px-2.5 py-1.5 rounded-lg mt-1"
              style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <p className="text-blue-300 text-[10px] font-semibold mb-0.5">Teaching Note</p>
              <p className="text-blue-200 text-[10px] leading-relaxed">{teachingNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
