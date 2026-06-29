import { useEffect, useRef, useState } from 'react'
import { TimelineEvent } from '../../types/scenario'
import { SceneAsset } from '../../types/sceneAsset'

// ── Closed-loop communication config ────────────────────────────────────────

type CLType = 'med' | 'fluid' | 'defib'

interface CLDef {
  order: string    // message spoken by team leader / IV nurse
  confirm: string  // echo back by IV nurse / recorder
  type: CLType
}

const CL_MAP: Record<string, CLDef> = {
  'epinephrine':                { order: 'Epinephrine 1 mg IV push',        confirm: 'Epinephrine 1 mg IV push ค่ะ',        type: 'med'   },
  'amiodarone':                 { order: 'Amiodarone 300 mg IV push',      confirm: 'Amiodarone 300 mg IV push ค่ะ',      type: 'med'   },
  'amiodarone-150':             { order: 'Amiodarone 150 mg IV',           confirm: 'Amiodarone 150 mg IV ค่ะ',           type: 'med'   },
  'lidocaine':                  { order: 'Lidocaine 1.5 mg/kg IV push',   confirm: 'Lidocaine 1.5 mg/kg IV push ค่ะ',   type: 'med'   },
  'atropine':                   { order: 'Atropine 0.5 mg IV push',       confirm: 'Atropine 0.5 mg IV push ค่ะ',       type: 'med'   },
  'adenosine':                  { order: 'Adenosine 6 mg IV rapid push',  confirm: 'Adenosine 6 mg IV rapid push ค่ะ',  type: 'med'   },
  'dopamine-infusion':          { order: 'Dopamine drip 5 mcg/kg/min',    confirm: 'Dopamine drip 5 mcg/kg/min ค่ะ',    type: 'med'   },
  'antiarrhythmic-tachy':       { order: 'Diltiazem / Metoprolol IV',     confirm: 'Diltiazem / Metoprolol IV ค่ะ',     type: 'med'   },
  'iv-access':                  { order: 'เปิด IV line',                       confirm: 'IV เปิดแล้วค่ะ',                       type: 'fluid' },
  'io-access':                  { order: 'เปิด IO access',                     confirm: 'IO เปิดแล้วค่ะ',                       type: 'fluid' },
  'defibrillate':               { order: 'Clear! Shock 200J',                 confirm: 'Clear! ค่ะ',                          type: 'defib' },
  'synchronized-cardioversion': { order: 'Sync cardioversion 100J',           confirm: 'Sync cardioversion 100J ค่ะ',         type: 'defib' },
  'transcutaneous-pacing':      { order: 'TCP — rate 60, output 50mA',        confirm: 'TCP ค่ะ rate 60, output 50mA',        type: 'defib' },
  // Mx tab — IV medications
  'fluid-bolus':                { order: 'NSS 1 L IV rapid bolus',            confirm: 'NSS 1 L IV rapid ค่ะ',                type: 'fluid' },
  'prc-uncrossed':              { order: 'O-neg PRC 2 units IV rapid',        confirm: 'O-neg PRC 2 units IV ค่ะ',            type: 'fluid' },
  'sodium-bicarbonate':         { order: 'NaHCO₃ 1 mEq/kg IV push',          confirm: 'NaHCO₃ 1 mEq/kg IV ค่ะ',            type: 'med'   },
  'calcium-gluconate':          { order: 'Calcium gluconate 1 g IV',          confirm: 'Calcium gluconate 1 g IV ค่ะ',        type: 'med'   },
  'insulin-dextrose':           { order: 'Insulin 10 u + D50W 50 mL IV',     confirm: 'Insulin + D50W IV ค่ะ',               type: 'med'   },
  'magnesium-sulfate':          { order: 'MgSO₄ 2 g IV push',                confirm: 'MgSO₄ 2 g IV ค่ะ',                   type: 'med'   },
  'warm-fluids':                { order: 'Warm NSS 42°C IV infusion',         confirm: 'Warm IV fluid 42°C ค่ะ',              type: 'fluid' },
  'naloxone':                   { order: 'Naloxone 0.4–2 mg IV',              confirm: 'Naloxone IV ค่ะ',                     type: 'med'   },
  'antidote-generic':           { order: 'Specific antidote IV',              confirm: 'Antidote IV ค่ะ',                     type: 'med'   },
  'thrombolytics':              { order: 'Alteplase 50 mg IV bolus',          confirm: 'Alteplase 50 mg IV ค่ะ',              type: 'med'   },
  // Mx tab — procedures
  'needle-decompression':       { order: 'Needle decompression 2nd ICS MCL', confirm: 'Needle decompression ค่ะ',            type: 'defib' },
  'chest-tube-icd':             { order: 'ICD insertion 4th ICS',             confirm: 'ICD insertion ค่ะ',                   type: 'defib' },
  'pericardiocentesis':         { order: 'Pericardiocentesis — subxiphoid',   confirm: 'Pericardiocentesis ค่ะ',              type: 'defib' },
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  order: string
  confirm: string
  type: CLType
  time: string
  phase: 'order' | 'both' | 'gone'
}

interface Props {
  events: TimelineEvent[]
  assets: SceneAsset[]
}

// ── Position helpers ─────────────────────────────────────────────────────────

function assetPos(assets: SceneAsset[], id: string, fallback: { x: number; y: number }) {
  const a = assets.find(x => x.id === id)
  return a ? { x: a.x + a.w / 2, y: a.y + a.h / 2 } : fallback
}

// ── Bubble component ─────────────────────────────────────────────────────────

function Bubble({ text, time, side, visible, color }: {
  text: string; time: string; side: 'left' | 'right'; visible: boolean; color: string
}) {
  return (
    <div
      className="flex flex-col gap-0.5 pointer-events-none transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(6px)' }}
    >
      <div
        className="rounded-2xl px-3 py-2 shadow-xl backdrop-blur-sm max-w-[10rem] text-left"
        style={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}10 100%)`,
          border: `1.5px solid ${color}55`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${color}22`,
        }}
      >
        <p className="text-white text-[11px] font-semibold leading-snug">{text}</p>
        <p className="text-[9px] mt-0.5 font-mono" style={{ color: color + 'cc' }}>{time}</p>
      </div>
      {/* Tail */}
      <div className={`w-2.5 h-2 ${side === 'left' ? 'ml-4' : 'ml-auto mr-4'}`}
        style={{ borderLeft: side === 'left' ? `8px solid ${color}44` : '8px solid transparent',
                 borderRight: side === 'left' ? '8px solid transparent' : `8px solid ${color}44`,
                 borderTop: `6px solid ${color}44`, width: 0, height: 0 }} />
    </div>
  )
}

// ── Main overlay ─────────────────────────────────────────────────────────────

export default function ClosedLoopOverlay({ events, assets }: Props) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const prevLen = useRef(0)

  useEffect(() => {
    if (events.length <= prevLen.current) { prevLen.current = events.length; return }
    const latest = events[events.length - 1]
    prevLen.current = events.length

    const def = CL_MAP[latest.actionId]
    if (!def) return

    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const id = `${latest.actionId}-${Date.now()}`

    const notif: Notification = { id, order: def.order, confirm: def.confirm, type: def.type, time, phase: 'order' }
    setNotifs(prev => [...prev.slice(-2), notif]) // keep max 3 on screen

    // After 1.5s show confirmation echo
    setTimeout(() => {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, phase: 'both' } : n))
    }, 1500)

    // After 5s remove
    setTimeout(() => {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, phase: 'gone' } : n))
    }, 5000)
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => n.id !== id))
    }, 5500)
  }, [events])

  if (notifs.length === 0) return null

  // Positions for order (IV pole / defib) and confirm (recorder)
  const ivPos    = assetPos(assets, 'iv-pole',        { x: 78, y: 22 })
  const defibPos = assetPos(assets, 'monitor-machine', { x: 80, y: 18 })
  const recPos   = assetPos(assets, 'recorder',        { x: 18, y: 68 })

  return (
    <>
      {notifs.map(n => {
        const orderPos = n.type === 'defib' ? defibPos : ivPos
        const gone = n.phase === 'gone'

        return (
          <div key={n.id} className="contents">
            {/* Order bubble — near IV pole or defib */}
            <div className="absolute z-30 pointer-events-none" style={{ left: `${orderPos.x}%`, top: `${orderPos.y}%`, transform: 'translate(-50%, -110%)' }}>
              <Bubble text={`"${n.order} เวลานี้"`} time={n.time} side="right" visible={!gone} color="#14b8a6" />
            </div>

            {/* Confirm bubble — near recorder */}
            <div className="absolute z-30 pointer-events-none" style={{ left: `${recPos.x}%`, top: `${recPos.y}%`, transform: 'translate(-50%, -110%)' }}>
              <Bubble text={`"${n.confirm} เวลานี้"`} time={n.time} side="left" visible={!gone && n.phase === 'both'} color="#a78bfa" />
            </div>
          </div>
        )
      })}
    </>
  )
}
