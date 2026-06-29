import { useEffect, useRef, useState } from 'react'
import { PatientState, TimelineEvent } from '../../types/scenario'
import { SceneAsset } from '../../types/sceneAsset'
import PatientStatus from './PatientStatus'
import ClosedLoopOverlay from './ClosedLoopOverlay'

interface Props {
  state: PatientState
  patientLabel?: string
  assets: SceneAsset[]
  visibleIds: Set<string>
  events?: TimelineEvent[]
  cprElapsed?: number
  epiElapsedSnapshot?: number | null
  scenarioStarted?: boolean
}

export default function ScenarioCanvas({ state, patientLabel, assets, visibleIds, events = [], cprElapsed = 0, epiElapsedSnapshot = null, scenarioStarted = false }: Props) {
  const sortedAssets = [...assets].sort((a, b) => a.zIndex - b.zIndex)
  const hasImages = assets.some(a => a.imageDataUrl)

  return (
    <div className="relative w-full h-full overflow-hidden bg-navy-950">

      {/* Empty state hint */}
      {!hasImages && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-20 pointer-events-none">
          <div className="text-6xl">🖼</div>
          <div className="text-slate-400 text-sm text-center">
            <div className="font-semibold">ยังไม่มีรูปภาพ</div>
            <div className="text-xs mt-0.5">Admin → Scene Assets → อัปโหลดรูป</div>
          </div>
        </div>
      )}

      {/*
        16:9 asset stage — centred in the available canvas space so % positions
        always match the Layout Editor (which also uses a 16:9 canvas).
        Uses width:100% + aspect-ratio + max-height:100% inside a flex container
        — the browser shrinks both axes proportionally when either constraint is hit.
      */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <div
          className="relative"
          style={{
            aspectRatio: '16/9',
            width: '100%',
            maxHeight: '100%',
          }}
        >
          {sortedAssets.map(asset => {
            const imgSrc = asset.storageUrl ?? asset.imageDataUrl
            if (!visibleIds.has(asset.id) || !imgSrc) return null
            return (
              <img
                key={asset.id}
                src={imgSrc}
                alt={asset.name}
                className="absolute object-contain pointer-events-none"
                style={{
                  left: `${asset.x}%`,
                  top: `${asset.y}%`,
                  width: `${asset.w}%`,
                  height: `${asset.h}%`,
                  transform: `rotate(${asset.rotation}deg)`,
                  opacity: asset.opacity,
                  zIndex: asset.zIndex,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Status strip */}
      <div className="absolute top-0 left-0 right-0 z-40 px-4 pt-3 pb-2 bg-gradient-to-b from-navy-950/90 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-white text-base font-bold uppercase tracking-wider">สถานะผู้ป่วย</span>
          {patientLabel && <span className="text-slate-300 text-sm font-medium">— {patientLabel}</span>}
          {state.cprActive && !state.rosc && (
            <span className="ml-auto text-orange-300 text-sm font-bold animate-pulse">● CPR Active</span>
          )}
          {state.rosc && <span className="ml-auto text-green-300 text-sm font-bold">✓ ROSC</span>}
        </div>
        <PatientStatus state={state} />
      </div>

      {/* Vitals card */}
      {state.monitorAttached && <VitalsCard state={state} />}

      {/* Epi countdown bar — below VITALS monitor, only after first dose */}
      {scenarioStarted && epiElapsedSnapshot !== null && (
        <EpiBar cprElapsed={cprElapsed} epiElapsedSnapshot={epiElapsedSnapshot} />
      )}

      {/* Text callout labels */}
      <TextCallouts state={state} />

      {/* Left-side treatment done log */}
      {events.length > 0 && <TreatmentLog events={events} />}

      {/* Closed-loop communication bubbles */}
      <ClosedLoopOverlay events={events} assets={assets} />

    </div>
  )
}

// ─── CPR heart beat indicator (110 bpm = 545 ms/beat, draggable) ─────────────

const CPR_POS_KEY = 'cpr-heart-position'

function CprHeartBeat() {
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const stored = localStorage.getItem(CPR_POS_KEY)
      if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    return { x: 50, y: 52 }
  })
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; el: HTMLElement } | null>(null)

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const el = (e.currentTarget as HTMLElement).closest('.cpr-heart-root') as HTMLElement | null
    if (!el) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, el }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const parent = dragRef.current.el.offsetParent as HTMLElement | null
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dx = (e.clientX - dragRef.current.startX) / rect.width * 100
      const dy = (e.clientY - dragRef.current.startY) / rect.height * 100
      const nx = Math.max(5, Math.min(95, dragRef.current.origX + dx))
      const ny = Math.max(5, Math.min(90, dragRef.current.origY + dy))
      setPos({ x: nx, y: ny })
    }
    const onUp = () => {
      if (!dragRef.current) return
      setPos(p => {
        localStorage.setItem(CPR_POS_KEY, JSON.stringify(p))
        return p
      })
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return (
    <>
      <style>{`
        @keyframes cpr-beat {
          0%,100% { transform: scale(1); }
          14%      { transform: scale(1.28); }
          28%      { transform: scale(1); }
          42%      { transform: scale(1.14); }
          56%      { transform: scale(1); }
        }
        @keyframes cpr-ring {
          0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
        }
        .cpr-beat { animation: cpr-beat 545ms ease-in-out infinite; }
        .cpr-ring { animation: cpr-ring 545ms ease-out infinite; }
        .cpr-ring-d2 { animation-delay: 180ms; }
      `}</style>
      <div
        className="cpr-heart-root absolute z-20"
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', cursor: 'grab' }}
        onMouseDown={onMouseDown}
      >
        <div className="relative flex flex-col items-center select-none">
          {/* Rings */}
          {[0, 180].map(delay => (
            <div key={delay} className={`cpr-ring absolute${delay ? ' cpr-ring-d2' : ''}`} style={{
              top: '50%', left: '50%',
              width: 64, height: 64, borderRadius: '50%',
              border: `3px solid rgba(239,68,68,${delay ? 0.45 : 0.7})`,
              marginLeft: -32, marginTop: -32,
            }} />
          ))}
          {/* Heart */}
          <div className="cpr-beat" style={{ fontSize: 48, lineHeight: 1, filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.9))' }}>
            ❤️
          </div>
          {/* Label */}
          <div className="text-white font-black text-xs mt-1.5" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}>
            CPR
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Text callouts (informational labels, always rendered from state) ─────────

function TextCallouts({ state }: { state: PatientState }) {
  const [showCallHelp, setShowCallHelp] = useState(false)
  const prevTeamCalled = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (state.teamCalled && !prevTeamCalled.current) {
      setShowCallHelp(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShowCallHelp(false), 6000)
    }
    prevTeamCalled.current = state.teamCalled
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [state.teamCalled])

  return (
    <>
      {state.cprActive && !state.rosc && <CprHeartBeat />}
      {showCallHelp && (() => {
        // Derive call message from actual patient state
        const isArrest = !state.hasPulse || state.isUnresponsive
        const chiefComplaint = isArrest
          ? 'มีคนหมดสติ ไม่รู้สึกตัว'
          : state.consciousness === 'verbal'
            ? 'ผู้ป่วยตอบสนองต่อเสียง — อาการทรุดลง'
            : state.consciousness === 'pain'
              ? 'ผู้ป่วยตอบสนองลดลง — ต้องการความช่วยเหลือด่วน'
              : 'ผู้ป่วยมีอาการผิดปกติด้านหัวใจ'
        const team = isArrest
          ? 'ตามทีม CPR · นำ defibrillator, Emergency cart มาด้วย'
          : 'ตามทีมช่วยเหลือด่วน · นำ monitor, defibrillator, Emergency cart มาด้วย'
        return (
          <div className="absolute pointer-events-none z-20" style={{ left: '50%', top: '15%', transform: 'translateX(-50%)' }}>
            <div className="rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-sm text-center"
              style={{ backgroundColor: '#eab30820', border: '2px solid #eab30870', minWidth: 300 }}>
              <div className="text-yellow-300 font-black text-sm leading-tight mb-1">📢 Call for Help</div>
              <div className="text-white font-bold text-sm leading-snug">{chiefComplaint}</div>
              <div className="text-yellow-200 text-xs leading-snug mt-0.5">{team}</div>
            </div>
          </div>
        )
      })()}
      {state.rosc && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-green-500/15 border border-green-500/30 rounded-2xl px-8 py-4 backdrop-blur-sm">
            <div className="text-green-400 font-black text-2xl text-center">✓ ROSC</div>
            <div className="text-green-300 text-sm text-center mt-1">Return of Spontaneous Circulation</div>
            <div className="text-green-200 text-xs text-center mt-0.5">กลับมามีชีพจร</div>
          </div>
        </div>
      )}
    </>
  )
}



// ─── Epi countdown bar ────────────────────────────────────────────────────────

function EpiBar({ cprElapsed, epiElapsedSnapshot }: { cprElapsed: number; epiElapsedSnapshot: number }) {
  const TARGET = 240
  const secondsSince = cprElapsed - epiElapsedSnapshot
  const remaining = Math.max(TARGET - secondsSince, 0)
  const pct = Math.min((secondsSince / TARGET) * 100, 100)
  const due = secondsSince >= TARGET
  const soon = secondsSince >= TARGET - 30
  const remMins = Math.floor(remaining / 60)
  const remSecs = remaining % 60

  return (
    <div className="absolute right-3 w-36 z-10" style={{ top: 'calc(3.5rem + 124px)' }}>
      <div className={`rounded-lg overflow-hidden border backdrop-blur-sm ${due ? 'border-red-500/60 bg-red-950/70' : 'border-purple-700/50 bg-slate-900/80'}`}>
        <div className="relative h-5 flex items-center px-2 gap-1.5">
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${due ? 'bg-red-500/50' : soon ? 'bg-orange-500/40' : 'bg-purple-600/35'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`relative text-[9px] font-bold flex-none ${due ? 'text-red-400' : 'text-purple-400'}`}>💉</span>
          <span className={`relative font-mono text-[9px] font-bold ${due ? 'text-red-300 animate-pulse' : soon ? 'text-orange-300' : 'text-slate-300'}`}>
            {due ? '⚠ Epi ใหม่!' : `${remMins}:${String(remSecs).padStart(2, '0')} → Epi`}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Vitals card ──────────────────────────────────────────────────────────────

function VitalsCard({ state }: { state: PatientState }) {
  const showVitals = state.rosc || (state.hasPulse && !state.isUnresponsive)
  const hasCapnography = ['bvm', 'lma', 'ett'].includes(state.airwayDevice)

  return (
    <div className="absolute top-14 right-3 bg-slate-900/95 border border-slate-700 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm w-36 z-10">
      <div className="bg-slate-800/80 px-2.5 py-1 border-b border-slate-700 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full flex-none bg-green-400 animate-pulse" />
        <span className="text-slate-300 font-mono text-[9px] font-bold tracking-widest">VITALS</span>
      </div>
      <div className="p-2 space-y-1 font-mono">
        <VRow label="BP"    value={showVitals && state.bloodPressure ? state.bloodPressure : '---'} color="#ef4444" />
        <VRow label="PR"    value={showVitals && state.heartRate ? String(state.heartRate) : '---'} color="#f97316" />
        <VRow label="SpO₂"  value={showVitals && state.spo2 ? `${state.spo2}%` : '---'} color="#22c55e" />
        <VRow label="EtCO₂" value={hasCapnography ? (state.rosc ? '42' : state.cprActive ? '10' : '35') : '---'} color="#06b6d4" />
      </div>
    </div>
  )
}

function VRow({ label, value, color }: { label: string; value: string; color: string }) {
  const dim = value === '---'
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-slate-500 text-[9px] font-bold w-10 flex-none">{label}</span>
      <span className="text-[11px] font-bold tabular-nums" style={{ color: dim ? '#475569' : color }}>{value}</span>
    </div>
  )
}

// ─── Left-side treatment log ──────────────────────────────────────────────────

// Actions that are too generic to show individually (assessment steps, not treatments)
const SKIP_IN_LOG = new Set([
  'check-responsiveness', 'check-pulse', 'check-breathing', 'rhythm-check',
  'call-team', 'assess-symptoms-brady', 'assess-stability',
])

function TreatmentLog({ events }: { events: TimelineEvent[] }) {
  // Build log: deduplicate non-defib by actionId; defib shows each occurrence with ordinal
  const seen = new Set<string>()
  const items: Array<{ key: string; icon: string; label: string; type?: 'defib' | 'epi' }> = []
  let defibCount = 0
  let epiCount = 0

  for (const e of events) {
    if (SKIP_IN_LOG.has(e.actionId)) continue
    if (e.actionId === 'defibrillate') {
      defibCount++
      items.push({ key: `defib-${defibCount}`, icon: e.icon, label: `Defibrillation ${defibCount}`, type: 'defib' })
    } else if (e.actionId === 'epinephrine') {
      epiCount++
      items.push({ key: `epi-${epiCount}`, icon: e.icon, label: `Epinephrine ${epiCount}`, type: 'epi' })
    } else {
      if (seen.has(e.actionId)) continue
      seen.add(e.actionId)
      items.push({ key: e.actionId, icon: e.icon, label: e.label })
    }
  }

  if (items.length === 0) return null

  return (
    <div
      className="absolute z-10 flex flex-col gap-1 pointer-events-none"
      style={{ left: '0.75rem', top: '4.5rem', maxWidth: '11rem' }}
    >
      {items.map(item => (
        <div
          key={item.key}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md"
          style={{
            background: item.type === 'defib'
              ? 'linear-gradient(135deg,rgba(239,68,68,0.20) 0%,rgba(239,68,68,0.08) 100%)'
              : item.type === 'epi'
                ? 'linear-gradient(135deg,rgba(168,85,247,0.22) 0%,rgba(168,85,247,0.08) 100%)'
                : 'linear-gradient(135deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.04) 100%)',
            border: item.type === 'defib'
              ? '1px solid rgba(239,68,68,0.35)'
              : item.type === 'epi'
                ? '1px solid rgba(168,85,247,0.40)'
                : '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          <span className="text-sm leading-none flex-none">{item.icon}</span>
          <span className="text-[10px] font-semibold leading-tight truncate" style={{
            color: item.type === 'defib' ? '#fca5a5' : item.type === 'epi' ? '#d8b4fe' : 'white'
          }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
