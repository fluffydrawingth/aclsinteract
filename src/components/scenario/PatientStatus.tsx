import { PatientState } from '../../types/scenario'

interface Props {
  state: PatientState
}

type Badge = { label: string; active: boolean; danger?: boolean; accent?: boolean }

export default function PatientStatus({ state }: Props) {
  const badges: Badge[] = [
    { label: 'หายใจ', active: state.isBreathing, danger: !state.isBreathing },
    { label: 'ชีพจร', active: state.hasPulse, danger: !state.hasPulse },
    { label: 'CPR', active: state.cprActive, accent: true },
    { label: 'Oxygen', active: state.oxygenApplied },
    { label: 'IV/IO', active: state.ivAccess },
    { label: 'Monitor', active: state.monitorAttached },
    { label: 'Defib Pads', active: state.defibPadsAttached },
    ...(state.rosc ? [{ label: 'ROSC ✓', active: true }] : []),
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <StatusBadge key={b.label} {...b} />
      ))}
    </div>
  )
}

function StatusBadge({ label, active, danger = false, accent = false }: Badge) {
  let cls = 'bg-slate-800/60 border-slate-700/60 text-slate-600'
  let dotCls = 'bg-slate-700'

  if (active && danger) {
    cls = 'bg-red-500/15 border-red-500/40 text-red-400'
    dotCls = 'bg-red-400'
  } else if (active && accent) {
    cls = 'bg-orange-500/15 border-orange-500/40 text-orange-400'
    dotCls = 'bg-orange-400 animate-pulse'
  } else if (active) {
    cls = 'bg-teal-500/15 border-teal-500/40 text-teal-400'
    dotCls = 'bg-teal-400'
  }

  return (
    <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${cls}`}>
      <span className={`w-2.5 h-2.5 rounded-full flex-none ${dotCls}`} />
      {label}
    </div>
  )
}
