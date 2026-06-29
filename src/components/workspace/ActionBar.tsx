import { useState } from 'react'
import { scenarioActions } from '../../data/scenarioActions'
import { ActionCategory } from '../../types/scenario'

interface Props {
  appliedActions: Set<string>
  topicActionIds: string[]
  onAction: (id: string) => void
  warning: string | null
  scenarioStarted: boolean
  scenarioPaused: boolean
}

const categories: { id: ActionCategory; label: string; color: string }[] = [
  { id: 'assessment',    label: 'ประเมิน',   color: '#3b82f6' },
  { id: 'resuscitation', label: 'ช่วยชีวิต', color: '#f97316' },
  { id: 'device',        label: 'อุปกรณ์',   color: '#8b5cf6' },
  { id: 'medication',    label: 'ยา',        color: '#14b8a6' },
  { id: 'outcome',       label: 'ผลลัพธ์',   color: '#22c55e' },
]

export default function ActionBar({
  appliedActions,
  topicActionIds,
  onAction,
  warning,
  scenarioStarted,
  scenarioPaused,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<ActionCategory>('assessment')

  // Only show actions relevant to the current topic
  const topicActions = scenarioActions.filter((a) => topicActionIds.includes(a.id))
  const categoryActions = topicActions.filter((a) => a.category === activeCategory)
  const cat = categories.find((c) => c.id === activeCategory)!

  // Which categories have actions in this topic
  const activeCats = categories.filter((c) =>
    topicActions.some((a) => a.category === c.id)
  )

  const isPaused = scenarioStarted && scenarioPaused

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-navy-950/97 border-t border-slate-800 backdrop-blur-sm">
      {/* Warning banner */}
      {warning && (
        <div className="px-4 py-2 bg-yellow-500/15 border-b border-yellow-500/30 text-yellow-200 text-xs font-medium">
          ⚠️ {warning}
        </div>
      )}

      {/* Paused overlay message */}
      {isPaused && (
        <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          Scenario หยุดชั่วคราว — กด Resume เพื่อดำเนินต่อ
        </div>
      )}

      <div className="flex items-stretch h-20">
        {/* Category tabs */}
        <div className="flex-none flex flex-col border-r border-slate-800">
          {activeCats.map((c) => {
            const count = topicActions.filter((a) => a.category === c.id && appliedActions.has(a.id)).length
            const total = topicActions.filter((a) => a.category === c.id).length
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex-1 px-3 text-left text-xs font-semibold transition-all border-l-2 min-w-[72px]
                  ${activeCategory === c.id ? 'text-white' : 'text-slate-400 hover:text-slate-200 border-transparent'}`}
                style={activeCategory === c.id ? { borderColor: c.color, color: c.color } : {}}
              >
                <div className="flex items-center justify-between gap-1">
                  <span>{c.label}</span>
                  {count > 0 && (
                    <span className="text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                      style={{ backgroundColor: c.color + '30', color: c.color }}>
                      {count}
                    </span>
                  )}
                  {count === 0 && total > 0 && (
                    <span className="text-[10px] text-slate-600">{total}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex-1 flex items-center gap-2 px-3 overflow-x-auto scrollbar-hide">
          {categoryActions.length === 0 ? (
            <p className="text-slate-600 text-sm italic">ไม่มีการดำเนินการในหมวดนี้</p>
          ) : (
            categoryActions.map((action) => {
              const applied = appliedActions.has(action.id)
              return (
                <button
                  key={action.id}
                  onClick={() => onAction(action.id)}
                  className={`flex-none flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-150 hover:scale-[1.03] active:scale-100
                    ${applied
                      ? 'border-teal-500/50 text-teal-300'
                      : 'border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white'
                    }`}
                  style={applied
                    ? { backgroundColor: cat.color + '15', borderColor: cat.color + '50', color: cat.color }
                    : { backgroundColor: 'rgba(15,23,42,0.7)' }
                  }
                >
                  <span className="text-lg">{action.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm leading-none whitespace-nowrap">{action.label}</div>
                    <div className="text-xs opacity-60 mt-0.5 whitespace-nowrap">{action.labelEn}</div>
                  </div>
                  {applied && (
                    <svg className="w-4 h-4 flex-none opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Progress count */}
        <div className="flex-none px-3 flex items-center border-l border-slate-800">
          <div className="text-center">
            <div className="text-white font-bold text-lg leading-none">{appliedActions.size}</div>
            <div className="text-slate-500 text-xs">/{topicActions.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
