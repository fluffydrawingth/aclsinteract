import { useState, useMemo } from 'react'
import { scenarioActions, ACTION_LIBRARY_GROUPS } from '../../data/scenarioActions'
import { TimelineEvent } from '../../types/scenario'

interface Props {
  events: TimelineEvent[]
  onAction: (id: string) => void
  scenarioStarted: boolean
}

// Groups shown in the Mx tab — treatment & procedures
const MX_GROUP_IDS = new Set([
  'medication',
  'ht-hypovolemia',
  'ht-acidosis',
  'ht-hypothermia',
  'ht-ptx',
  'ht-tamponade',
  'ht-toxins',
  'ht-thrombosis',
])

export default function MxPanel({ events, onAction, scenarioStarted }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const actionById = useMemo(
    () => Object.fromEntries(scenarioActions.map(a => [a.id, a])),
    []
  )

  const actionCounts: Record<string, number> = {}
  for (const ev of events) {
    actionCounts[ev.actionId] = (actionCounts[ev.actionId] ?? 0) + 1
  }

  const q = search.trim().toLowerCase()

  const groups = useMemo(() => {
    return ACTION_LIBRARY_GROUPS
      .filter(g => MX_GROUP_IDS.has(g.id))
      .map(g => ({
        ...g,
        actions: g.actionIds
          .map(id => actionById[id])
          .filter((a): a is NonNullable<typeof a> => {
            if (!a) return false
            if (!q) return true
            return (
              a.label.toLowerCase().includes(q) ||
              a.labelEn.toLowerCase().includes(q) ||
              a.id.toLowerCase().includes(q)
            )
          }),
      }))
      .filter(g => g.actions.length > 0)
  }, [actionById, q])

  const toggle = (id: string) =>
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div className="h-full flex flex-col bg-navy-950 overflow-hidden">
      {/* Header */}
      <div className="flex-none px-3 py-2 border-b border-slate-800">
        <div className="text-white font-bold text-sm">Management</div>
        <div className="text-slate-500 text-[10px] mt-0.5">Medications · Procedures · 5H5T Treatment</div>
      </div>

      {!scenarioStarted && (
        <div className="flex-none mx-3 mt-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-500 text-xs text-center">
          Start a scenario to use actions
        </div>
      )}

      {/* Search */}
      <div className="flex-none px-3 pt-2 pb-1">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search treatments..."
            className="w-full bg-navy-900 text-slate-200 text-xs rounded-lg pl-8 pr-7 py-1.5 border border-slate-700 focus:border-slate-500 focus:outline-none placeholder-slate-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.length === 0 && (
          <p className="text-slate-600 text-xs italic text-center pt-6">ไม่พบ treatment ที่ค้นหา</p>
        )}
        {groups.map(group => {
          const isCollapsed = collapsed.has(group.id)
          const doneCount = group.actions.filter(a => (actionCounts[a.id] ?? 0) > 0).length
          return (
            <div key={group.id} className="mb-0.5">
              <button
                onClick={() => toggle(group.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/40 transition-colors group"
              >
                <span className="text-base">{group.icon}</span>
                <span className="flex-1 text-left text-slate-400 text-[10px] font-bold uppercase tracking-wider group-hover:text-slate-200 transition-colors leading-tight">
                  {group.label}
                </span>
                {doneCount > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-400/15 text-teal-400 flex-none">
                    {doneCount}/{group.actions.length}
                  </span>
                )}
                <svg className={`w-3 h-3 text-slate-600 transition-transform flex-none ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!isCollapsed && (
                <div className="ml-1 space-y-0.5 mb-1">
                  {group.actions.map(action => {
                    const count = actionCounts[action.id] ?? 0
                    const used = count > 0
                    return (
                      <button
                        key={action.id}
                        onClick={() => onAction(action.id)}
                        disabled={!scenarioStarted}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all duration-100 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed ${
                          used
                            ? 'border-teal-500/25 bg-teal-500/5'
                            : 'border-slate-700/50 bg-navy-900/50 hover:border-slate-600 hover:bg-navy-800/60'
                        }`}
                      >
                        <span className="text-base flex-none w-6 text-center">{action.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-[11px] leading-tight ${used ? 'text-white' : 'text-slate-200'}`}>{action.label}</div>
                          <div className="text-[9px] text-slate-500 leading-tight truncate">{action.labelEn}</div>
                        </div>
                        {used
                          ? count > 1
                            ? <span className="flex-none text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300">×{count}</span>
                            : <svg className="flex-none w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                          : <svg className="flex-none w-3 h-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        }
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
