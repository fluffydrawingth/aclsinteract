import { useState, useMemo } from 'react'
import { scenarioActions, ACTION_LIBRARY_GROUPS } from '../../data/scenarioActions'
import { TeachingTopic, commonBaseActionIds } from '../../data/teachingTopics'
import { ScenarioDefinition, TimelineEvent } from '../../types/scenario'

interface Props {
  activeTopic: TeachingTopic
  selectedScenario: ScenarioDefinition | null
  events: TimelineEvent[]
  onAction: (id: string) => void
  scenarioStarted: boolean
  scenarioPaused: boolean
  onStart: () => void
  startTime: number | null
  onShowHtCauses?: () => void
  onShowUnstable?: () => void
}

const QUICK_ACTION_IDS = [
  'check-responsiveness',
  'check-pulse',
  'call-team',
  'start-cpr',
  'apply-oxygen',
  'attach-monitor',
  'rhythm-check',
  'defibrillate',
  'iv-access',
  'epinephrine',
  'airway-ett',
  'capnography',
  'attach-3lead',
  'amiodarone',
  'antiarrhythmic-tachy',
]

// Communication actions always shown as their own section (not buried in More)
const COMMUNICATION_IDS = ['assign-roles', 'closed-loop']

// Groups hidden from More Actions — they live in the Mx tab instead
const MX_GROUP_IDS = new Set([
  'medication', 'ht-hypovolemia', 'ht-acidosis', 'ht-hypothermia',
  'ht-ptx', 'ht-tamponade', 'ht-toxins', 'ht-thrombosis',
])

export default function ScenarioActionPanel({
  activeTopic,
  selectedScenario,
  events,
  onAction,
  scenarioStarted,
  scenarioPaused,
  onStart,
  onShowHtCauses,
  onShowUnstable,
}: Props) {
  const [showMore, setShowMore] = useState(false)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const topicActionIds = selectedScenario?.actionIds ?? activeTopic.scenarioActionIds
  const allActionIds = useMemo(
    () => new Set([...commonBaseActionIds, ...topicActionIds]),
    [topicActionIds]
  )

  const actionById = useMemo(
    () => Object.fromEntries(scenarioActions.map((a) => [a.id, a])),
    []
  )

  const actionCounts: Record<string, number> = {}
  for (const ev of events) {
    actionCounts[ev.actionId] = (actionCounts[ev.actionId] ?? 0) + 1
  }

  const quickActions = useMemo(() => {
    const quick = QUICK_ACTION_IDS
      .map(id => actionById[id])
      .filter((a): a is NonNullable<typeof a> => !!a && allActionIds.has(a.id))
    const quickIds = new Set(quick.map(a => a.id))
    const topicExtra = topicActionIds
      .filter(id => !quickIds.has(id))
      .map(id => actionById[id])
      .filter((a): a is NonNullable<typeof a> => !!a)
      .slice(0, Math.max(0, 10 - quick.length))
    return [...quick, ...topicExtra]
  }, [allActionIds, actionById, topicActionIds])

  const quickIds = useMemo(() => new Set(quickActions.map(a => a.id)), [quickActions])

  // Communication section — always visible above "More"
  const commActions = useMemo(() =>
    COMMUNICATION_IDS.map(id => actionById[id]).filter((a): a is NonNullable<typeof a> => !!a && allActionIds.has(a.id)),
    [allActionIds, actionById]
  )
  const commIds = useMemo(() => new Set(commActions.map(a => a.id)), [commActions])

  const q = search.trim().toLowerCase()
  const moreGroups = useMemo(() => {
    return ACTION_LIBRARY_GROUPS
      .filter(group => !MX_GROUP_IDS.has(group.id))
      .map((group) => {
        const actions = group.actionIds
          .map((id) => actionById[id])
          .filter((a): a is NonNullable<typeof a> => {
            if (!a || !allActionIds.has(a.id)) return false
            // hide from More if already in quick or comm sections
            if (!q && (quickIds.has(a.id) || commIds.has(a.id))) return false
            if (!q) return true
            return (
              a.label.toLowerCase().includes(q) ||
              a.labelEn.toLowerCase().includes(q) ||
              a.id.toLowerCase().includes(q)
            )
          })
        return { ...group, actions }
      }).filter((g) => g.actions.length > 0)
  }, [allActionIds, actionById, q, quickIds, commIds])

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const totalCount = events.length
  const showUnstableBtn = activeTopic.id === 'bradycardia' || activeTopic.id === 'tachycardia'
  const showHtBtn = activeTopic.htCauseIds && activeTopic.htCauseIds.length > 0

  return (
    <div className="h-full flex flex-col bg-navy-950 overflow-hidden">

      {/* Header */}
      <div className="flex-none px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-white font-bold text-sm">Actions</div>
          <div className="text-xs mt-0.5 font-medium truncate" style={{ color: activeTopic.color }}>
            {selectedScenario?.title ?? activeTopic.shortTitle}
          </div>
        </div>
        <div className="text-right flex-none ml-2">
          <div className="text-white font-bold text-lg leading-none">{totalCount}</div>
          <div className="text-slate-500 text-[10px]">done</div>
        </div>
      </div>

      {/* Start banner */}
      {!scenarioStarted && (
        <div className="flex-none mx-3 mt-2.5">
          <button
            onClick={onStart}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: activeTopic.color }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            Start Scenario
          </button>
        </div>
      )}

      {scenarioPaused && (
        <div className="flex-none mx-3 mt-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-medium flex items-center gap-2">
          <svg className="w-3 h-3 flex-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          Paused
        </div>
      )}

      <div className="flex-1 overflow-y-auto">

        {/* ── Quick Actions ── */}
        <div className="px-2 pt-2 pb-1 space-y-1">
          {quickActions.map((action) => {
            const count = actionCounts[action.id] ?? 0
            const used = count > 0
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-100 active:scale-[0.98] ${
                  used
                    ? 'border-teal-500/40 bg-teal-500/10'
                    : 'border-slate-700 bg-navy-900/60 hover:border-slate-500 hover:bg-navy-800/70'
                }`}
              >
                <span className="text-xl flex-none w-7 text-center leading-none">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-xs leading-tight ${used ? 'text-teal-200' : 'text-slate-100'}`}>
                    {action.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate leading-tight">{action.labelEn}</div>
                </div>
                <div className="flex-none">
                  {used ? (
                    count > 1
                      ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-400/25 text-teal-300">×{count}</span>
                      : <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Checklist trigger buttons ── */}
        {(showUnstableBtn || showHtBtn) && (
          <div className="px-2 pb-1 flex flex-col gap-1">
            {showUnstableBtn && (
              <button
                onClick={onShowUnstable}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] border-orange-500/40 bg-orange-500/8 hover:bg-orange-500/15"
              >
                <span className="text-xl flex-none w-7 text-center leading-none">⚠️</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight text-orange-200">ประเมิน Unstable Signs</div>
                  <div className="text-[10px] text-slate-500 leading-tight">Hemodynamic instability checklist</div>
                </div>
                <svg className="w-3.5 h-3.5 text-orange-600 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {showHtBtn && (
              <button
                onClick={onShowHtCauses}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] border-purple-500/40 bg-purple-500/8 hover:bg-purple-500/15"
              >
                <span className="text-xl flex-none w-7 text-center leading-none">🔍</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight text-purple-200">5H 5T — Reversible Causes</div>
                  <div className="text-[10px] text-slate-500 leading-tight">Identify & rule out causes</div>
                </div>
                <svg className="w-3.5 h-3.5 text-purple-600 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* ── Communication ── */}
        {commActions.length > 0 && (
          <div className="px-2 pb-1">
            <p className="text-slate-600 text-[9px] font-bold uppercase tracking-wider px-1 pb-0.5">📢 Communication</p>
            <div className="space-y-0.5">
              {commActions.map((action) => {
                const count = actionCounts[action.id] ?? 0
                const used = count > 0
                return (
                  <button
                    key={action.id}
                    onClick={() => onAction(action.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all duration-100 active:scale-[0.99] ${
                      used ? 'border-teal-500/25 bg-teal-500/5' : 'border-slate-700/50 bg-navy-900/50 hover:border-slate-600 hover:bg-navy-800/60'
                    }`}
                  >
                    <span className="text-base flex-none w-6 text-center">{action.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-[11px] leading-tight truncate ${used ? 'text-white' : 'text-slate-200'}`}>{action.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{action.labelEn}</div>
                    </div>
                    {used
                      ? <svg className="flex-none w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        )}

        {/* ── More Actions ── */}
        <div className="px-2 pt-1 pb-0.5">
          <button
            onClick={() => setShowMore(v => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/30 hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
          >
            <span>More Actions</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${showMore ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showMore && (
          <div className="px-2 pb-3">
            <div className="relative mt-1.5 mb-2">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actions..."
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

            <div className="space-y-0.5">
              {moreGroups.length === 0 && (
                <p className="text-slate-600 text-xs italic text-center pt-3">ไม่พบ action ที่ค้นหา</p>
              )}
              {moreGroups.map((group) => {
                const isCollapsed = collapsed.has(group.id)
                const groupDoneCount = group.actions.filter(a => (actionCounts[a.id] ?? 0) > 0).length
                return (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/40 transition-colors group"
                    >
                      <span className="text-sm">{group.icon}</span>
                      <span className="flex-1 text-left text-slate-500 text-[10px] font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">
                        {group.label}
                      </span>
                      {groupDoneCount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-400/15 text-teal-400">
                          {groupDoneCount}/{group.actions.length}
                        </span>
                      )}
                      <svg className={`w-3 h-3 text-slate-700 transition-transform flex-none ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {!isCollapsed && (
                      <div className="ml-1 space-y-0.5 mb-1">
                        {group.actions.map((action) => {
                          const count = actionCounts[action.id] ?? 0
                          const used = count > 0
                          return (
                            <button
                              key={action.id}
                              onClick={() => onAction(action.id)}
                              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all duration-100 active:scale-[0.99] ${
                                used
                                  ? 'border-teal-500/25 bg-teal-500/5'
                                  : 'border-slate-700/50 bg-navy-900/50 hover:border-slate-600 hover:bg-navy-800/60'
                              }`}
                            >
                              <span className="text-base flex-none w-6 text-center">{action.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold text-[11px] leading-tight truncate ${used ? 'text-white' : 'text-slate-200'}`}>{action.label}</div>
                                <div className="text-[10px] text-slate-500 truncate">{action.labelEn}</div>
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
        )}
      </div>
    </div>
  )
}
