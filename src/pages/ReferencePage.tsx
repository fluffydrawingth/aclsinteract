import { useState } from 'react'
import { useAlgorithmLibrary } from '../hooks/useAlgorithmLibrary'
import { useTeachingContent } from '../hooks/useTeachingContent'
import AlgorithmLibrary from '../components/algorithm/AlgorithmLibrary'
import DrugReference from '../components/tools/DrugReference'
import HsTs from '../components/tools/HsTs'
import TeamRoles from '../components/tools/TeamRoles'
import CodeTimer from '../components/tools/CodeTimer'

type RefTab = 'algorithm' | 'drugs' | 'hsts' | 'team' | 'timer'

const tabs: { id: RefTab; label: string; icon: string }[] = [
  { id: 'algorithm', label: 'Algorithm Library', icon: '🗺' },
  { id: 'drugs',     label: 'Drug Reference', icon: '💊' },
  { id: 'hsts',      label: "H's & T's", icon: '🔍' },
  { id: 'team',      label: 'Team Roles', icon: '👥' },
  { id: 'timer',     label: 'Code Timer', icon: '⏱' },
]

interface Props {
  onBack: () => void
}

export default function ReferencePage({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<RefTab>('algorithm')
  const library = useAlgorithmLibrary()
  const content = useTeachingContent()

  return (
    <div className="h-screen bg-navy-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none bg-navy-800 border-b border-slate-700/60 flex items-center gap-0 px-3 h-12">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors mr-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>

        <div className="w-px h-5 bg-slate-700 mr-3" />

        <div className="flex items-center gap-1.5 mr-4">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-white font-bold text-sm">Reference Library</span>
          <span className="text-slate-500 text-xs ml-1">ACLS 2025</span>
        </div>

        <div className="flex items-center gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-teal-500/20 border border-teal-500/40 text-teal-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'algorithm' && (
          <AlgorithmLibrary
            algorithms={library.algorithms}
            activeAlgorithmId={library.activeAlgorithmId}
            onSetActive={library.setActiveAlgorithmId}
            onUpload={library.uploadImage}
            onRemoveImage={library.removeImage}
            onAddAnnotation={library.addAnnotation}
            onRemoveAnnotation={library.removeAnnotation}
          />
        )}
        {activeTab === 'drugs'  && <DrugReference drugs={content.drugs} />}
        {activeTab === 'hsts'   && <HsTs />}
        {activeTab === 'team'   && <TeamRoles />}
        {activeTab === 'timer'  && <CodeTimer />}
      </div>
    </div>
  )
}
