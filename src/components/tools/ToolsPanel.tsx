import { useState } from 'react'
import DrugReference from './DrugReference'
import HsTs from './HsTs'
import TeamRoles from './TeamRoles'
import CodeTimer from './CodeTimer'

type Tool = 'drugs' | 'hsts' | 'team' | 'timer'

const toolCards: { id: Tool; label: string; labelEn: string; icon: string; color: string; desc: string }[] = [
  { id: 'drugs', label: 'ยา ACLS', labelEn: 'Drug Reference', icon: '💊', color: '#8b5cf6', desc: 'Epi, Amiodarone, Lidocaine, Atropine' },
  { id: 'hsts', label: "H's & T's", labelEn: 'Reversible Causes', icon: '🔍', color: '#f97316', desc: 'สาเหตุที่แก้ไขได้ใน PEA / Asystole' },
  { id: 'team', label: 'บทบาทในทีม', labelEn: 'Team Roles', icon: '👥', color: '#22c55e', desc: 'Leader, Compressor, Airway, IV, Recorder' },
  { id: 'timer', label: 'จับเวลา', labelEn: 'Code Timer', icon: '⏱', color: '#0ea5e9', desc: 'Code time, CPR cycle, Drug timer' },
]

export default function ToolsPanel() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null)

  if (activeTool) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-none px-4 py-3 bg-navy-800/80 border-b border-slate-700/40 flex items-center gap-3">
          <button
            onClick={() => setActiveTool(null)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <span className="text-white font-semibold text-sm">
            {toolCards.find((t) => t.id === activeTool)?.label}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTool === 'drugs' && <DrugReference />}
          {activeTool === 'hsts' && <HsTs />}
          {activeTool === 'team' && <TeamRoles />}
          {activeTool === 'timer' && <CodeTimer />}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-white font-bold text-2xl">เครื่องมือการสอน</h2>
          <p className="text-slate-400 text-sm mt-1">Teaching Tools — เลือกเครื่องมือที่ต้องการ</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {toolCards.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="bg-navy-800 border border-slate-700/60 rounded-2xl p-6 text-left hover:border-slate-500 hover:scale-[1.02] transition-all duration-150 group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: tool.color + '20' }}
              >
                {tool.icon}
              </div>
              <div className="text-white font-bold text-lg mb-1">{tool.label}</div>
              <div className="text-slate-500 text-xs mb-2">{tool.labelEn}</div>
              <div className="text-slate-400 text-sm">{tool.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
