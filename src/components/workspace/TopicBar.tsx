import { TeachingTopic, TeachingTopicId, teachingTopics } from '../../data/teachingTopics'

interface Props {
  activeTopic: TeachingTopic
  onSelectTopic: (id: TeachingTopicId) => void
  scenarioStarted: boolean
  scenarioPaused: boolean
  eventCount: number
  focusedEventIndex: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onPrevEvent: () => void
  onNextEvent: () => void
}

export default function TopicBar({
  activeTopic,
  onSelectTopic,
  scenarioStarted,
  scenarioPaused,
  eventCount,
  focusedEventIndex,
  onStart,
  onPause,
  onResume,
  onReset,
  onPrevEvent,
  onNextEvent,
}: Props) {
  return (
    <div className="fixed left-0 right-0 z-40 h-11 bg-navy-950 border-b border-slate-800 flex items-center gap-0 px-3"
      style={{ top: 48 }}>

      {/* Topic tabs */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
        {teachingTopics.map((topic) => {
          const isActive = activeTopic.id === topic.id
          return (
            <button
              key={topic.id}
              onClick={() => !topic.comingSoon && onSelectTopic(topic.id)}
              disabled={topic.comingSoon}
              className={`flex-none flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                ${topic.comingSoon
                  ? 'text-slate-600 cursor-not-allowed'
                  : isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              style={isActive && !topic.comingSoon ? {
                backgroundColor: topic.color + '20',
                color: topic.color,
                boxShadow: `inset 0 -2px 0 ${topic.color}`,
              } : {}}
              title={topic.comingSoon ? 'Coming soon' : topic.description}
            >
              <span
                className="w-2 h-2 rounded-full flex-none"
                style={{ backgroundColor: topic.comingSoon ? '#334155' : topic.color }}
              />
              {topic.shortTitle}
              {topic.comingSoon && (
                <span className="text-[10px] text-slate-600 border border-slate-700 rounded px-1 py-0.5 leading-none">
                  soon
                </span>
              )}
            </button>
          )
        })}

        {/* Topic description */}
        <span className="text-slate-600 text-xs ml-2 hidden lg:block truncate max-w-xs">
          {activeTopic.description}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-800 mx-2 flex-none" />

      {/* Scenario controls */}
      <div className="flex items-center gap-1.5 flex-none">
        {!scenarioStarted ? (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-teal-500/20"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Scenario
          </button>
        ) : (
          <>
            {/* Prev / Next event */}
            <button
              onClick={onPrevEvent}
              disabled={focusedEventIndex <= 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous event"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-slate-500 text-xs font-mono min-w-[36px] text-center">
              {eventCount > 0 ? `${focusedEventIndex + 1}/${eventCount}` : '0'}
            </span>

            <button
              onClick={onNextEvent}
              disabled={focusedEventIndex >= eventCount - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next event"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="w-px h-4 bg-slate-700 mx-0.5" />

            {/* Pause / Resume */}
            {scenarioPaused ? (
              <button
                onClick={onResume}
                className="flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-teal-500/10 transition-colors border border-teal-500/30"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Resume
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center gap-1 text-slate-400 hover:text-yellow-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors"
                title="Pause scenario"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                Pause
              </button>
            )}

            {/* Reset */}
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-slate-500 hover:text-red-400 text-xs px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              title="Reset scenario"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  )
}
