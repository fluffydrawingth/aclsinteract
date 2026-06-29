import { useState } from 'react'
import { RhythmType } from '../../types/rhythm'
import { rhythmLibrary } from '../../data/rhythmLibrary'
import { EcgImageMap } from '../../hooks/useTeachingContent'
import EcgWaveform from './EcgWaveform'
import DefibrillationFlow from './DefibrillationFlow'
import EcgLightbox from '../ecg/EcgLightbox'

interface Props {
  monitorAttached: boolean
  rhythmVisible: boolean
  selectedRhythm: RhythmType
  rhythmRevealed: boolean
  rhythmOrder: RhythmType[]
  ecgImages?: EcgImageMap
  heartRate?: number | null
  onSetRhythm: (r: RhythmType) => void
  onRevealRhythm: () => void
  onApplyAction: (id: string) => void
}

export default function MonitorPanel({
  monitorAttached,
  rhythmVisible,
  selectedRhythm,
  rhythmRevealed,
  rhythmOrder,
  ecgImages,
  heartRate,
  onSetRhythm,
  onRevealRhythm,
  onApplyAction,
}: Props) {
  const [showDefib, setShowDefib] = useState(false)
  const [showRhythmPicker, setShowRhythmPicker] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const rhythmInfo = rhythmLibrary[selectedRhythm]
  const isShockable = rhythmInfo.isShockable
  const realEcgEntry = ecgImages?.[selectedRhythm]

  const hrDisplay = () => {
    if (heartRate != null) return String(heartRate)
    if (!monitorAttached || !rhythmVisible) return '--'
    if (isShockable) return '---'
    switch (rhythmInfo.id) {
      case 'SINUS_BRADY': return '38'
      case 'SVT':         return '185'
      case 'AF_RVR':      return '145'
      case 'CHB':         return '30'
      case 'AV_BLOCK':    return '45'
      default:            return '72'
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-navy-950">

      {/* ECG Lightbox */}
      {lightboxOpen && realEcgEntry && (
        <EcgLightbox
          imageUrl={realEcgEntry.imageDataUrl}
          title={realEcgEntry.title || rhythmInfo.nameEn}
          subtitle={realEcgEntry.diagnosis || rhythmInfo.nameThai}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ── Monitor screen ─────────────────────────────── */}
      <div className="flex-none">
        {/* Status bar */}
        <div className="bg-slate-900 px-2.5 py-1.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${monitorAttached ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-slate-200 font-mono text-[10px] font-semibold">
              {monitorAttached ? 'CONNECTED' : 'NO SIGNAL'}
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">LEAD II</span>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="text-red-400 font-bold">HR: {hrDisplay()}</span>
            <span className="text-cyan-400">SpO2: {monitorAttached ? (isShockable ? '--' : '98') : '--'}</span>
          </div>
        </div>

        {/* ECG canvas */}
        <div className="bg-slate-950 px-2 h-28 flex items-center justify-center relative overflow-hidden">
          {!monitorAttached ? (
            <p className="text-slate-600 text-xs font-mono text-center leading-relaxed">
              ยังไม่ได้ติด Monitor<br/>คลิก "ติด Monitor" ใน Actions
            </p>
          ) : (
            <EcgWaveform rhythm={selectedRhythm} color={rhythmInfo.color} width={280} height={80} animated />
          )}

          {/* ECG grid */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* Zoom button — opens real uploaded ECG fullscreen */}
          {realEcgEntry && monitorAttached && (
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/40 transition-colors"
              title="Zoom real ECG"
            >
              🔍 Zoom
            </button>
          )}
        </div>

        {/* Rhythm reveal — student-facing */}
        {monitorAttached && (
          <div className="border-t border-slate-800 px-3 py-2 flex items-center justify-between bg-slate-900/50">
            {rhythmRevealed ? (
              <>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm leading-tight truncate" style={{ color: rhythmInfo.color }}>
                    {rhythmInfo.nameThai}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5 leading-snug">{rhythmInfo.descriptionThai}</div>
                </div>
                <div className={`flex-none ml-2 px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  isShockable
                    ? 'bg-red-500/20 border-red-500/50 text-red-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  {isShockable ? '⚡ Shock' : 'Non-Shock'}
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-between gap-2">
                <div>
                  <p className="text-white text-xs font-medium">ให้ผู้เรียนอ่าน rhythm ก่อน</p>
                  <p className="text-slate-500 text-[10px] mt-0.5 italic">"คลื่นนี้คืออะไร?"</p>
                </div>
                <button
                  onClick={onRevealRhythm}
                  className="flex-none font-bold px-3 py-1.5 rounded-lg text-xs bg-teal-500 hover:bg-teal-400 text-white transition-colors"
                >
                  เฉลย
                </button>
              </div>
            )}
          </div>
        )}

        {/* Defibrillate button */}
        {monitorAttached && rhythmRevealed && isShockable && (
          <div className="px-2.5 pb-2.5">
            <button
              onClick={() => setShowDefib(true)}
              className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/25"
            >
              <span>⚡</span> Defibrillate 200J
            </button>
          </div>
        )}
      </div>

      {/* ── Rhythm selector (compact toggle) ─────────────── */}
      <div className="flex-none border-t border-slate-800">
        <button
          onClick={() => setShowRhythmPicker((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rhythmInfo.color }} />
            <span>
              Rhythm
              {rhythmRevealed && (
                <span style={{ color: rhythmInfo.color }}> · {rhythmInfo.nameEn}</span>
              )}
            </span>
          </span>
          <svg className={`w-3.5 h-3.5 transition-transform ${showRhythmPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showRhythmPicker && (
          <div className="px-2 pb-2 overflow-y-auto" style={{ maxHeight: '14rem' }}>
            <div className={`grid gap-1 ${rhythmOrder.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {rhythmOrder.map((r) => {
                const info = rhythmLibrary[r]
                const isSelected = selectedRhythm === r
                const hasRealEcg = !!(ecgImages?.[r])
                return (
                  <button
                    key={r}
                    onClick={() => { onSetRhythm(r); onApplyAction('rhythm-check'); setShowRhythmPicker(false) }}
                    className={`py-1.5 px-1.5 rounded-lg text-[10px] font-semibold border transition-all text-center leading-tight relative
                      ${isSelected
                        ? 'text-white'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500 bg-slate-800/50'
                      }`}
                    style={isSelected ? { borderColor: info.color + '80', color: info.color, backgroundColor: info.color + '18' } : {}}
                  >
                    {info.nameEn.split(' ').slice(0, 2).join(' ')}
                    {hasRealEcg && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-navy-950 text-[7px] flex items-center justify-center text-white">📷</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showDefib && (
        <DefibrillationFlow
          onComplete={() => { setShowDefib(false); onApplyAction('defibrillate') }}
          onCancel={() => setShowDefib(false)}
        />
      )}
    </div>
  )
}
