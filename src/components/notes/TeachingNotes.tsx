import { scenarioActions } from '../../data/scenarioActions'

interface Props {
  lastActionId: string | null
  onClose?: () => void
}

export default function TeachingNotes({ lastActionId, onClose }: Props) {
  void onClose
  const action = lastActionId
    ? scenarioActions.find((a) => a.id === lastActionId)
    : null

  return (
    <div className="flex flex-col overflow-hidden h-full bg-navy-800">
      <div className="flex-none px-4 py-2 border-b border-slate-700/40">
        <p className="text-slate-500 text-xs">อัปเดตตามการดำเนินการล่าสุด</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!action ? (
          <div className="text-slate-500 text-sm text-center pt-8">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            กดปุ่มดำเนินการใน Scenario<br />เพื่อดูบันทึกการสอน
          </div>
        ) : (
          <>
            <div className="bg-navy-900/60 border border-slate-700/40 rounded-xl p-3">
              <div className="text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
                {action.labelEn}
              </div>
              <div className="text-white font-bold text-sm">{action.notesThai.title}</div>
            </div>

            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-teal-400 rounded-full" />
                ประเด็นสำคัญ
              </div>
              <ul className="space-y-2">
                {action.notesThai.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-none" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
              <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                คำถามผู้เรียน
              </div>
              <p className="text-yellow-200 text-sm leading-relaxed italic">
                {action.notesThai.discussionQuestion}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-2 border-t border-slate-700/60">
        <p className="text-slate-600 text-xs flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          สำหรับอาจารย์ผู้สอนเท่านั้น
        </p>
      </div>
    </div>
  )
}
