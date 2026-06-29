export type TeachingTab = 'scenario' | 'algorithm' | 'monitor' | 'tools' | 'notes'

interface Props {
  activeTab: TeachingTab
  onTabChange: (tab: TeachingTab) => void
  onHome: () => void
  onReset: () => void
  notesVisible: boolean
  onToggleNotes: () => void
}

const tabs: { id: TeachingTab; label: string; labelEn: string }[] = [
  { id: 'scenario', label: 'สถานการณ์', labelEn: 'Scenario' },
  { id: 'algorithm', label: 'Algorithm', labelEn: 'Algorithm' },
  { id: 'monitor', label: 'Monitor / ECG', labelEn: 'Monitor' },
  { id: 'tools', label: 'เครื่องมือ', labelEn: 'Tools' },
]

export default function TopNav({ activeTab, onTabChange, onHome, onReset, notesVisible, onToggleNotes }: Props) {
  return (
    <div className="flex-none bg-navy-800 border-b border-slate-700/60 flex items-center gap-0 px-3 h-12">
      {/* Home */}
      <button
        onClick={onHome}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors mr-2 flex-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        หน้าหลัก
      </button>

      <div className="w-px h-6 bg-slate-700 mr-2 flex-none" />

      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-4 flex-none">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-white font-bold text-sm">ACLS Interactive</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-teal-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-none">
        {/* Toggle notes */}
        <button
          onClick={onToggleNotes}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${notesVisible
              ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          บันทึก
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Reset scenario"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          รีเซ็ต
        </button>
      </div>
    </div>
  )
}
