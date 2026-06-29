import { TeachingStep } from '../data/teachingSteps'

interface Props {
  steps: TeachingStep[]
  currentIndex: number
  onSelect: (index: number) => void
}

export default function Timeline({ steps, currentIndex, onSelect }: Props) {
  return (
    <div className="flex-none bg-navy-900 border-t border-slate-700/40 px-4 py-3">
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
        {steps.map((step, i) => {
          const isPast = i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <div key={step.id} className="flex items-center flex-none">
              {/* Node */}
              <button
                onClick={() => onSelect(i)}
                className="flex flex-col items-center gap-1 group"
                title={step.title}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                    ${isCurrent
                      ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/40 scale-110'
                      : isPast
                        ? 'bg-teal-900/60 border-teal-600 text-teal-400 group-hover:border-teal-400'
                        : 'bg-slate-800 border-slate-600 text-slate-500 group-hover:border-slate-500'
                    }`}
                >
                  {isPast ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`text-xs whitespace-nowrap transition-colors duration-300
                    ${isCurrent ? 'text-teal-400 font-semibold' : isPast ? 'text-teal-700' : 'text-slate-600'}`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="w-12 mx-1 mb-4 flex-none">
                  <div
                    className={`h-0.5 w-full transition-all duration-500 ${
                      i < currentIndex ? 'bg-teal-600' : 'bg-slate-700'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
