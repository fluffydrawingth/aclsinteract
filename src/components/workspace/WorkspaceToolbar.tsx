import { PanelId } from '../../hooks/usePanelManager'
import { TeachingTopic } from '../../data/teachingTopics'

interface PanelToggle {
  id: PanelId
  label: string
  icon: string
  color: string
}

const panelToggles: PanelToggle[] = [
  { id: 'algorithm', label: 'Algorithm',  icon: '🗺',  color: '#14b8a6' },
  { id: 'board',     label: 'Board',      icon: '🖼',  color: '#a855f7' },
  { id: 'drugs',     label: 'Drugs',      icon: '💊',  color: '#8b5cf6' },
  { id: 'hsts',      label: "H's & T's", icon: '🔍',  color: '#f97316' },
  { id: 'timer',     label: 'Timer',      icon: '⏱',  color: '#22c55e' },
]

interface Props {
  openPanelIds: Set<PanelId>
  onTogglePanel: (id: PanelId) => void
  activeTopic: TeachingTopic
  onHome: () => void
  onReference: () => void
  onAdmin: () => void
}

export default function WorkspaceToolbar({
  openPanelIds, onTogglePanel, activeTopic, onHome, onReference, onAdmin,
}: Props) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-navy-950 border-b border-slate-800 backdrop-blur-sm flex items-center gap-2 px-3">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2 flex-none">
        <span className="w-2 h-2 rounded-full animate-pulse flex-none" style={{ backgroundColor: activeTopic.color }} />
        <span className="text-white font-bold text-sm tracking-wide">ACLS Interactive</span>
        <span className="text-slate-500 text-[11px] border border-slate-700 rounded px-1.5 py-0.5 ml-0.5 hidden sm:block">Teaching</span>
      </div>

      <div className="w-px h-5 bg-slate-800 flex-none" />

      {/* Panel toggles */}
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
        {panelToggles.map((pt) => {
          const isOpen = openPanelIds.has(pt.id)
          return (
            <button
              key={pt.id}
              onClick={() => onTogglePanel(pt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-none
                ${isOpen
                  ? 'text-white border'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              style={isOpen ? { backgroundColor: pt.color + '20', borderColor: pt.color + '50', color: pt.color } : {}}
            >
              <span>{pt.icon}</span>
              <span className="hidden md:inline">{pt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-none ml-1">
        <button
          onClick={onReference}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors border border-slate-700/60"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="hidden sm:inline">Reference</span>
        </button>

        <button
          onClick={onAdmin}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          title="Admin / Content Manager"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">Admin</span>
        </button>

        <button
          onClick={onHome}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          title="กลับหน้าแรก"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="hidden sm:inline">Home</span>
        </button>
      </div>
    </div>
  )
}
