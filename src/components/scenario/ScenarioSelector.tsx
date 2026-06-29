import { ScenarioDefinition, ScenarioDifficulty } from '../../types/scenario'
import { getScenariosByTopic } from '../../data/scenarioLibrary'

interface Props {
  topicId: string
  topicColor: string
  onSelect: (scenario: ScenarioDefinition) => void
  onStartBlank: () => void
  onClose: () => void
}

const difficultyLabel: Record<ScenarioDifficulty, { label: string; color: string }> = {
  beginner:     { label: 'Beginner',     color: '#22c55e' },
  intermediate: { label: 'Intermediate', color: '#f59e0b' },
  advanced:     { label: 'Advanced',     color: '#ef4444' },
}

export default function ScenarioSelector({ topicId, topicColor, onSelect, onStartBlank, onClose }: Props) {
  const scenarios = getScenariosByTopic(topicId)

  return (
    <div className="absolute inset-0 z-30 bg-navy-950/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div>
          <h2 className="text-white font-bold text-lg">เลือก Scenario</h2>
          <p className="text-slate-400 text-sm mt-0.5">เลือก teaching case ที่ต้องการสอน</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onStartBlank}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors"
          >
            เริ่มโดยไม่เลือก Case
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Scenario grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {scenarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-slate-600 text-4xl mb-3">📋</div>
            <p className="text-slate-400 text-sm">ยังไม่มี scenario สำหรับ topic นี้</p>
            <button
              onClick={onStartBlank}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: topicColor }}
            >
              เริ่ม Free Play
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scenarios.map((s) => {
              const diff = difficultyLabel[s.difficulty]
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className="text-left p-4 rounded-2xl border border-slate-700/60 bg-navy-900/60 hover:border-slate-500 hover:bg-navy-800/80 transition-all group"
                >
                  {/* Difficulty badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: diff.color, borderColor: diff.color + '40', backgroundColor: diff.color + '15' }}
                    >
                      {diff.label}
                    </span>
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Title */}
                  <div className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-teal-300 transition-colors">
                    {s.title}
                  </div>
                  <div className="text-slate-400 text-[11px] mb-2">{s.titleEn}</div>

                  {/* Description */}
                  <div className="text-slate-400 text-xs leading-relaxed line-clamp-2">{s.description}</div>

                  {/* Objectives preview */}
                  {s.objectives.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-700/50">
                      <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Objectives</div>
                      <div className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                        {s.objectives[0]}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
