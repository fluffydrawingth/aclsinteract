import { TeachingStep } from '../data/teachingSteps'

interface Props {
  step: TeachingStep
}

export default function PatientScene({ step }: Props) {
  const { patientState } = step

  return (
    <div className="w-full max-w-2xl">
      {/* Scene card */}
      <div className="bg-navy-800 border border-slate-700/60 rounded-3xl p-6 shadow-2xl">
        {/* Scene header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-xl">{step.title}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{step.description}</p>
          </div>
          <StepBadge id={step.id} />
        </div>

        {/* Patient illustration */}
        <div className="relative bg-navy-900/60 rounded-2xl p-6 min-h-[260px] flex items-center justify-center mb-4 border border-slate-700/40 overflow-hidden">
          {/* Room background details */}
          <RoomBackground />

          {/* Patient on bed */}
          <PatientFigure patientState={patientState} />

          {/* Monitor */}
          {patientState.monitorAttached && <MonitorDisplay rhythm={patientState.rhythm} />}
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-4 gap-2">
          <StatusBadge label="Breathing" active={patientState.breathing} danger={!patientState.breathing} />
          <StatusBadge label="Pulse" active={patientState.pulse} danger={!patientState.pulse} />
          <StatusBadge label="CPR" active={patientState.cprActive} accent />
          <StatusBadge label="Monitor" active={patientState.monitorAttached} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <StatusBadge label="Oxygen" active={patientState.oxygenApplied} />
          <StatusBadge label="IV Access" active={patientState.ivAccess} />
          <StatusBadge
            label={patientState.rhythm ? `Rhythm: ${patientState.rhythm}` : 'No Rhythm'}
            active={patientState.rhythmVisible}
            danger={patientState.rhythm === 'VF' || patientState.rhythm === 'PVT' || patientState.rhythm === 'ASYSTOLE'}
          />
        </div>
      </div>
    </div>
  )
}

function StepBadge({ id }: { id: number }) {
  return (
    <div className="flex-none bg-teal-500/20 border border-teal-500/40 rounded-xl px-3 py-1.5 text-center">
      <div className="text-teal-400 font-bold text-lg leading-none">{id}</div>
      <div className="text-teal-500/70 text-xs">Step</div>
    </div>
  )
}

function RoomBackground() {
  return (
    <>
      {/* Window */}
      <div className="absolute top-3 right-4 w-16 h-20 border-2 border-slate-600/40 rounded-sm opacity-30">
        <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-0.5">
          <div className="bg-slate-600/20 rounded-sm" />
          <div className="bg-slate-600/20 rounded-sm" />
          <div className="bg-slate-600/20 rounded-sm" />
          <div className="bg-slate-600/20 rounded-sm" />
        </div>
      </div>
      {/* Floor line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-600/30" />
    </>
  )
}

function PatientFigure({ patientState }: { patientState: TeachingStep['patientState'] }) {
  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Bed */}
      <div className="relative w-80 h-28 bg-gradient-to-b from-slate-600 to-slate-700 rounded-xl shadow-lg border border-slate-500/50">
        {/* Pillow */}
        <div className="absolute left-3 top-3 w-20 h-10 bg-slate-300/20 rounded-lg border border-slate-400/20" />

        {/* Patient body */}
        <div className={`absolute inset-y-3 left-10 right-10 rounded-lg flex items-center transition-all duration-500 ${patientState.cprActive ? 'animate-pulse' : ''}`}>
          {/* Body outline */}
          <div className="relative w-full">
            {/* Torso */}
            <div className="mx-auto w-24 h-16 bg-slate-400/30 rounded-xl border border-slate-400/40 flex items-center justify-center relative">
              {/* CPR compression indicator */}
              {patientState.cprActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-500/40 animate-ping" />
                  <div className="absolute w-6 h-6 rounded-full bg-red-500/60" />
                </div>
              )}
              {/* Defibrillator pads */}
              {patientState.monitorAttached && (
                <>
                  <div className="absolute -top-2 -right-4 w-5 h-5 bg-yellow-400/80 rounded border border-yellow-300 text-yellow-900 text-xs flex items-center justify-center font-bold">+</div>
                  <div className="absolute -bottom-2 -left-4 w-5 h-5 bg-red-400/80 rounded border border-red-300 text-red-900 text-xs flex items-center justify-center font-bold">-</div>
                </>
              )}
            </div>

            {/* Head */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-amber-200/30 rounded-full border border-amber-300/30 flex items-center justify-center">
              {/* O2 mask */}
              {patientState.oxygenApplied && (
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/60 bg-blue-400/20" />
              )}
            </div>

            {/* Legs */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex gap-1">
              <div className="w-5 h-12 bg-slate-400/20 rounded border border-slate-400/30" />
              <div className="w-5 h-12 bg-slate-400/20 rounded border border-slate-400/30" />
            </div>

            {/* IV line */}
            {patientState.ivAccess && (
              <div className="absolute -top-6 right-2">
                <div className="w-1 h-8 bg-blue-300/60 rounded" />
                <div className="w-4 h-5 bg-blue-400/30 border border-blue-400/50 rounded-sm -mt-1" />
              </div>
            )}
          </div>
        </div>

        {/* Bed rails */}
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-slate-500/50 rounded-l-xl border-r border-slate-400/30" />
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-slate-500/50 rounded-r-xl border-l border-slate-400/30" />

        {/* Bed legs */}
        <div className="absolute -bottom-4 left-4 w-2 h-4 bg-slate-600 rounded-b" />
        <div className="absolute -bottom-4 right-4 w-2 h-4 bg-slate-600 rounded-b" />
      </div>

      {/* IV pole */}
      {patientState.ivAccess && (
        <div className="absolute -top-10 right-4 w-1 h-20 bg-slate-500 rounded" >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-slate-400 rounded" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-8 bg-blue-400/30 border border-blue-400/50 rounded-sm" />
        </div>
      )}
    </div>
  )
}

function MonitorDisplay({ rhythm }: { rhythm?: string | null }) {
  const colors: Record<string, string> = {
    VF: '#ef4444',
    PVT: '#f97316',
    ASYSTOLE: '#6b7280',
    PEA: '#eab308',
    ROSC: '#22c55e',
  }

  const color = rhythm ? (colors[rhythm] ?? '#14b8a6') : '#14b8a6'

  return (
    <div className="absolute top-2 right-2 w-36 h-20 bg-slate-900 rounded-lg border border-slate-600 overflow-hidden shadow-lg">
      <div className="bg-slate-800 px-2 py-0.5 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">ECG</span>
        <span className="text-xs font-bold" style={{ color }}>{rhythm ?? '---'}</span>
      </div>
      <div className="p-1 h-12 flex items-center">
        {rhythm ? (
          <EcgWaveform rhythm={rhythm} color={color} />
        ) : (
          <div className="w-full h-px bg-teal-400/60 mx-2" />
        )}
      </div>
      <div className="px-2 flex justify-between text-xs font-mono">
        <span className="text-red-400">❤ --</span>
        <span className="text-green-400">SpO2 --</span>
      </div>
    </div>
  )
}

function EcgWaveform({ rhythm, color }: { rhythm: string; color: string }) {
  const paths: Record<string, string> = {
    VF: 'M0,20 C5,5 8,35 12,8 C15,3 18,35 22,12 C26,3 30,30 34,6 C38,2 42,32 46,10 C50,3 54,28 58,15 C62,5 66,30 70,10 C74,2 78,28 82,18 C86,8 90,30 94,12 C98,4 102,26 106,20 C110,10 114,28 118,15 C122,4 126,22 130,18 C134,12 138,25 142,18',
    PVT: 'M0,20 L10,20 L12,5 L14,35 L16,5 L18,20 L30,20 L32,5 L34,35 L36,5 L38,20 L50,20 L52,5 L54,35 L56,5 L58,20 L70,20 L72,5 L74,35 L76,5 L78,20 L90,20 L92,5 L94,35 L96,5 L98,20 L110,20 L112,5 L114,35 L116,5 L118,20 L130,20 L132,5 L134,35 L136,5 L138,20',
    ASYSTOLE: 'M0,20 L142,20',
    PEA: 'M0,20 L15,20 L17,10 L19,22 L21,8 L23,20 L38,20 L40,10 L42,22 L44,8 L46,20 L61,20 L63,10 L65,22 L67,8 L69,20 L84,20 L86,10 L88,22 L90,8 L92,20 L107,20 L109,10 L111,22 L113,8 L115,20 L130,20 L132,10 L134,22 L136,8 L138,20',
    ROSC: 'M0,20 L20,20 L22,20 L24,5 L26,30 L28,20 L30,20 L34,18 L38,20 L58,20 L60,20 L62,5 L64,30 L66,20 L68,20 L72,18 L76,20 L96,20 L98,5 L100,30 L102,20 L106,18 L110,20 L130,20',
  }

  const d = paths[rhythm] ?? `M0,20 L142,20`

  return (
    <svg viewBox="0 0 142 40" className="w-full h-full" preserveAspectRatio="none">
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function StatusBadge({
  label,
  active,
  danger = false,
  accent = false,
}: {
  label: string
  active: boolean
  danger?: boolean
  accent?: boolean
}) {
  let cls = 'bg-slate-800/60 border-slate-700 text-slate-500'
  if (active && danger) cls = 'bg-red-500/20 border-red-500/50 text-red-400'
  else if (active && accent) cls = 'bg-orange-500/20 border-orange-500/50 text-orange-400'
  else if (active) cls = 'bg-teal-500/20 border-teal-500/50 text-teal-400'

  return (
    <div className={`border rounded-lg px-2 py-1.5 text-center text-xs font-medium transition-all duration-300 ${cls}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${active ? (danger ? 'bg-red-400' : accent ? 'bg-orange-400' : 'bg-teal-400') : 'bg-slate-600'}`} />
      {label}
    </div>
  )
}
