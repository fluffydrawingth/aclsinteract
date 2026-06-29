import { scenarioActions } from '../../data/scenarioActions'
import { ActionCategory } from '../../types/scenario'

interface Props {
  appliedActions: Set<string>
  onAction: (id: string) => void
  warning: string | null
}

const categoryLabels: Record<ActionCategory, string> = {
  assessment: 'การประเมิน',
  resuscitation: 'การช่วยชีวิต',
  device: 'อุปกรณ์',
  medication: 'ยา',
  procedure: 'หัตถการ',
  outcome: 'ผลลัพธ์',
}

const categoryOrder: ActionCategory[] = ['assessment', 'resuscitation', 'device', 'medication', 'procedure', 'outcome']

const categoryColors: Record<ActionCategory, string> = {
  assessment: 'text-blue-400',
  resuscitation: 'text-orange-400',
  device: 'text-purple-400',
  medication: 'text-teal-400',
  procedure: 'text-rose-400',
  outcome: 'text-green-400',
}

export default function ActionPanel({ appliedActions, onAction, warning }: Props) {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-navy-800/50 border-l border-slate-700/40">
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-slate-700/40">
        <h3 className="text-white font-bold text-sm">การดำเนินการ</h3>
        <p className="text-slate-500 text-xs mt-0.5">กดปุ่มเพื่อดำเนินการ — ไม่บังคับลำดับ</p>
      </div>

      {/* Warning banner */}
      {warning && (
        <div className="flex-none mx-3 mt-3 bg-yellow-500/15 border border-yellow-500/40 rounded-xl p-3 text-yellow-300 text-xs leading-relaxed">
          <span className="font-bold">⚠️ หมายเหตุ: </span>{warning}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categoryOrder.map((cat) => {
          const actions = scenarioActions.filter((a) => a.category === cat)
          return (
            <div key={cat}>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${categoryColors[cat]}`}>
                <span className="w-1 h-3 bg-current rounded-full opacity-70" />
                {categoryLabels[cat]}
              </div>
              <div className="space-y-2">
                {actions.map((action) => {
                  const applied = appliedActions.has(action.id)
                  return (
                    <button
                      key={action.id}
                      onClick={() => onAction(action.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 group
                        ${applied
                          ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                          : 'bg-slate-800/60 border-slate-700/40 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-700/60'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg flex-none">{action.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{action.label}</div>
                          <div className="text-xs opacity-60 truncate">{action.labelEn}</div>
                        </div>
                        {applied && (
                          <div className="flex-none">
                            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Applied count */}
      <div className="flex-none px-4 py-2 border-t border-slate-700/40 text-slate-600 text-xs text-center">
        {appliedActions.size} / {scenarioActions.length} การดำเนินการ
      </div>
    </div>
  )
}
