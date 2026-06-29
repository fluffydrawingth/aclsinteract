import { TeachingStep } from '../data/teachingSteps'

interface Props {
  step: TeachingStep
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

export default function ActionControls({ step, onNext, onPrev, isFirst, isLast }: Props) {
  return (
    <div className="flex-none bg-navy-800/90 border-t border-slate-700/60 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Prev */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Action buttons */}
        <div className="flex-1 flex items-center justify-center gap-3 flex-wrap">
          {step.actions.map((action, i) => (
            <button
              key={action}
              onClick={i === step.actions.length - 1 && !isLast ? onNext : undefined}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-150
                ${i === 0
                  ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-100'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {action}
            </button>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={isLast}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {isLast && (
        <p className="text-center text-slate-500 text-xs mt-2">
          End of Phase 1 scenario · Open Algorithm overlay to continue
        </p>
      )}
    </div>
  )
}
