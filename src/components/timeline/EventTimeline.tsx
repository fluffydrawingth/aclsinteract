import { useRef, useEffect, useState } from 'react'
import { TimelineEvent } from '../../types/scenario'

interface Props {
  events: TimelineEvent[]
  startTime: number | null
  focusedIndex?: number
  onClickEvent?: (index: number) => void
}

function formatElapsed(start: number, now: number): string {
  const secs = Math.floor((now - start) / 1000)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function EventTimeline({ events, startTime, focusedIndex = -1, onClickEvent }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(() => Date.now())

  // Tick every second to keep elapsed time live
  useEffect(() => {
    if (!startTime) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [startTime])

  // Auto-scroll to focused event
  useEffect(() => {
    if (focusedIndex < 0 || !scrollRef.current) return
    const el = scrollRef.current.querySelector(`[data-event-index="${focusedIndex}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [focusedIndex])

  return (
    <div className="h-full bg-navy-950 border-t border-slate-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-slate-800/60 flex-none">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Timeline</span>
          {startTime && (
            <span className="text-teal-400 text-[11px] font-mono">
              {formatElapsed(startTime, now)}
            </span>
          )}
        </div>
        <span className="text-slate-600 text-[11px]">{events.length} เหตุการณ์</span>
      </div>

      {/* Events */}
      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide px-4 py-2">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-700 text-xs italic">
              กด Start Scenario แล้วเลือกการดำเนินการเพื่อเริ่มบันทึก Timeline
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-0 min-w-max h-full">
            {events.map((event, i) => {
              const isFocused = i === focusedIndex
              return (
                <div key={event.id} className="flex items-center" data-event-index={i}>
                  <button
                    onClick={() => onClickEvent?.(i)}
                    className="flex flex-col items-center gap-0.5 group px-1 transition-all"
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                      ${isFocused
                        ? 'bg-teal-500 border-teal-400 text-white scale-110 shadow-lg shadow-teal-500/30'
                        : 'bg-teal-500/10 border-teal-600/50 text-teal-400 group-hover:border-teal-500 group-hover:bg-teal-500/20'
                      }`}>
                      {i + 1}
                    </div>
                    <span className={`text-[11px] whitespace-nowrap max-w-[84px] text-center leading-tight
                      ${isFocused ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-slate-200'}`}>
                      {event.label}
                    </span>
                    {startTime && (
                      <span className="text-slate-600 text-[10px] font-mono">
                        +{formatElapsed(startTime, event.timestamp)}
                      </span>
                    )}
                  </button>
                  {i < events.length - 1 && (
                    <div className={`w-6 h-px mx-0.5 flex-none ${i < focusedIndex ? 'bg-teal-500/60' : 'bg-slate-700'}`} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
