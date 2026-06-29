import { PatientState } from '../../types/scenario'
import PatientStatus from './PatientStatus'

interface Props {
  state: PatientState
  patientLabel?: string
}

export default function PatientScene({ state, patientLabel }: Props) {
  return (
    <div className="h-full relative overflow-hidden">
      {/* Scene viewport — full area */}
      <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
        <RoomElements />
        <BedAndPatient state={state} />
        {state.monitorAttached && <VitalsCard state={state} />}
        {state.ivAccess && <IVPole />}
        {state.rosc && <RoscOverlay />}
        {state.shockDelivered && !state.rosc && <ShockOverlay />}
      </div>

      {/* Status strip — top overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-2 pb-1.5 bg-gradient-to-b from-navy-950/80 to-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-white text-xs font-bold uppercase tracking-wider">สถานะผู้ป่วย</span>
          {patientLabel && <span className="text-slate-400 text-xs">— {patientLabel}</span>}
          {state.cprActive && <span className="ml-auto text-orange-300 text-xs font-bold animate-pulse">● CPR Active</span>}
          {state.rosc && <span className="ml-auto text-green-300 text-xs font-bold">✓ ROSC</span>}
        </div>
        <PatientStatus state={state} />
      </div>
    </div>
  )
}

function RoomElements() {
  return (
    <>
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Window */}
      <div className="absolute top-4 right-6 w-16 h-20 border border-slate-700/30 rounded-sm opacity-20">
        <div className="absolute inset-0 grid grid-cols-2 gap-px p-1">
          <div className="bg-slate-700/20 rounded-sm" />
          <div className="bg-slate-700/20 rounded-sm" />
          <div className="bg-slate-700/20 rounded-sm" />
          <div className="bg-slate-700/20 rounded-sm" />
        </div>
      </div>
      {/* Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700/30" />
    </>
  )
}

function BedAndPatient({ state }: { state: PatientState }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Patient body */}
      <div className="relative mb-4">
        {/* Bed frame */}
        <div className="w-80 h-32 bg-gradient-to-b from-slate-600/80 to-slate-700/80 rounded-2xl border border-slate-500/40 shadow-xl relative">
          {/* Pillow */}
          <div className="absolute left-4 top-4 w-20 h-10 bg-white/10 rounded-lg border border-white/10" />

          {/* Patient torso */}
          <div className={`absolute inset-y-4 left-12 right-8 rounded-xl flex items-center justify-center transition-all duration-500
            ${state.cprActive ? 'bg-orange-400/10 border border-orange-400/20' : 'bg-slate-500/20 border border-slate-500/20'}`}
          >
            {/* CPR animation */}
            {state.cprActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-orange-400/20 animate-ping" />
                <div className="absolute w-6 h-6 rounded-full bg-orange-400/50" />
                <span className="absolute text-orange-400 text-xs font-bold mt-8">CPR</span>
              </div>
            )}

            {/* Defib pads */}
            {state.defibPadsAttached && (
              <>
                <div className="absolute top-1 right-2 w-6 h-6 bg-yellow-400/70 rounded-sm border border-yellow-300/50 text-yellow-900 text-xs flex items-center justify-center font-bold shadow-sm">+</div>
                <div className="absolute bottom-1 left-2 w-6 h-6 bg-red-400/70 rounded-sm border border-red-300/50 text-red-900 text-xs flex items-center justify-center font-bold shadow-sm">−</div>
              </>
            )}
          </div>

          {/* Head */}
          <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-200/20 border border-amber-300/20 flex items-center justify-center">
            {/* O2 mask */}
            {state.oxygenApplied && (
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/60 bg-blue-400/20 flex items-center justify-center">
                <span className="text-blue-400 text-xs font-bold">O₂</span>
              </div>
            )}
          </div>

          {/* Legs */}
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex gap-1.5">
            <div className="w-4 h-16 bg-slate-500/20 rounded border border-slate-500/30" />
            <div className="w-4 h-16 bg-slate-500/20 rounded border border-slate-500/30" />
          </div>

          {/* Bed rails */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-slate-500/40 rounded-l-2xl" />
          <div className="absolute top-0 bottom-0 right-0 w-2 bg-slate-500/40 rounded-r-2xl" />
          {/* Bed legs */}
          <div className="absolute -bottom-5 left-6 w-2 h-5 bg-slate-600 rounded-b" />
          <div className="absolute -bottom-5 right-6 w-2 h-5 bg-slate-600 rounded-b" />
        </div>
      </div>

      {/* Scene label */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-slate-500 text-xs font-medium">
        {state.rosc ? 'ROSC — ฟื้นคืนชีพ' : state.cprActive ? 'CPR Active' : state.isUnresponsive ? 'ไม่รู้สึกตัว' : 'รู้สึกตัว มีชีพจร'}
      </div>
    </div>
  )
}

function VitalsCard({ state }: { state: PatientState }) {
  const showVitals = state.rosc || (state.hasPulse && !state.isUnresponsive)
  const hasCapnography = state.airwayDevice !== 'none'

  return (
    <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-700 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm w-36">
      <div className="bg-slate-800/80 px-2.5 py-1 border-b border-slate-700 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full flex-none ${state.monitorAttached ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
        <span className="text-slate-300 font-mono text-[9px] font-bold tracking-widest">VITALS</span>
      </div>
      <div className="p-2 space-y-1 font-mono">
        <VitalRow label="BP" value={showVitals && state.bloodPressure ? state.bloodPressure : '---'} color="#ef4444" />
        <VitalRow label="PR" value={showVitals && state.heartRate ? String(state.heartRate) : '---'} color="#f97316" />
        <VitalRow label="SpO₂" value={showVitals && state.spo2 ? `${state.spo2}%` : '---'} color="#22c55e" />
        <VitalRow label="EtCO₂" value={hasCapnography ? '35' : '---'} color="#06b6d4" />
      </div>
    </div>
  )
}

function VitalRow({ label, value, color }: { label: string; value: string; color: string }) {
  const isUnknown = value === '---'
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-slate-500 text-[9px] font-bold w-10 flex-none">{label}</span>
      <span className="text-[11px] font-bold tabular-nums" style={{ color: isUnknown ? '#475569' : color }}>
        {value}
      </span>
    </div>
  )
}

function IVPole() {
  return (
    <div className="absolute top-2 left-4">
      <div className="w-1 h-24 bg-slate-500 rounded mx-auto" />
      <div className="w-6 h-1 bg-slate-400 rounded -mt-24 mx-auto" />
      <div className="w-4 h-10 bg-blue-400/20 border border-blue-400/40 rounded-sm mx-auto mt-0" />
    </div>
  )
}

function RoscOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="bg-green-500/20 border border-green-500/40 rounded-2xl px-6 py-3 backdrop-blur-sm">
        <div className="text-green-400 font-bold text-xl text-center">✓ ROSC</div>
        <div className="text-green-300 text-sm text-center">กลับมามีชีพจร</div>
      </div>
    </div>
  )
}

function ShockOverlay() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
      <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl px-4 py-2 backdrop-blur-sm">
        <div className="text-yellow-400 text-sm font-bold">⚡ Shock Delivered — Resume CPR ทันที</div>
      </div>
    </div>
  )
}
