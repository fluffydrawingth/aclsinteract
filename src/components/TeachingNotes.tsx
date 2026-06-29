import { TeachingStep } from '../data/teachingSteps'

interface Props {
  step: TeachingStep
}

export default function TeachingNotes({ step }: Props) {
  return (
    <div className="flex-none w-72 bg-navy-800 border-l border-slate-700/60 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/60 flex items-center gap-2">
        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="text-white font-semibold text-sm">Teaching Notes</span>
      </div>

      {/* Notes content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step info */}
        <div className="bg-navy-900/60 border border-slate-700/40 rounded-xl p-3">
          <div className="text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">Step {step.id}</div>
          <div className="text-white font-semibold text-sm">{step.title}</div>
        </div>

        {/* Key teaching points */}
        <div>
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-teal-400 rounded-full inline-block" />
            Key Point
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{step.notes}</p>
        </div>

        {/* Discussion prompt */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
          <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Discussion Prompt
          </div>
          <p className="text-yellow-200 text-sm leading-relaxed italic">{step.discussionPrompt}</p>
        </div>

        {/* Next actions */}
        <div>
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-blue-400 rounded-full inline-block" />
            Available Actions
          </div>
          <div className="space-y-1.5">
            {step.actions.map((action) => (
              <div
                key={action}
                className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-300 text-sm"
              >
                <svg className="w-3.5 h-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {action}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer badge */}
      <div className="px-4 py-3 border-t border-slate-700/60">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          For instructor use only
        </div>
      </div>
    </div>
  )
}
