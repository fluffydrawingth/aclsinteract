import { useState } from 'react'
import { HtCause, getHtCausesWithOverrides, getHtCausesByIds } from '../../data/htCauses'
import { loadHtOverrides } from '../../lib/referenceOverrides'

interface Props {
  htCauseIds?: string[]
}

export default function HsTs({ htCauseIds }: Props) {
  const causes = htCauseIds ? getHtCausesByIds(htCauseIds) : getHtCausesWithOverrides()
  const htOverrides = loadHtOverrides()
  const hs = causes.filter((c) => c.letter === 'H')
  const ts = causes.filter((c) => c.letter === 'T')

  return (
    <div className="h-full overflow-auto p-4">
      <div className="grid grid-cols-1 gap-4">
        {hs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-xs">H</div>
              <h3 className="text-white font-bold text-sm">H's</h3>
            </div>
            <div className="space-y-2">
              {hs.map((c) => <CauseCard key={c.id} cause={c} color="#3b82f6" imageDataUrl={htOverrides[c.id]?.imageDataUrl} />)}
            </div>
          </div>
        )}

        {ts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400 text-xs">T</div>
              <h3 className="text-white font-bold text-sm">T's</h3>
            </div>
            <div className="space-y-2">
              {ts.map((c) => <CauseCard key={c.id} cause={c} color="#f97316" imageDataUrl={htOverrides[c.id]?.imageDataUrl} />)}
            </div>
          </div>
        )}

        {htCauseIds && htCauseIds.length < 10 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <p className="text-yellow-200 text-xs leading-relaxed">
              <span className="font-semibold text-yellow-300">Teaching tip: </span>
              แสดงเฉพาะสาเหตุที่เกี่ยวข้องกับ topic นี้ — เปิด H's & T's panel ใน Reference สำหรับรายการครบถ้วน
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CauseCard({ cause, color, imageDataUrl }: { cause: HtCause; color: string; imageDataUrl?: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-navy-900 border border-slate-700/60 rounded-xl overflow-hidden">
      <div className="flex items-start gap-2.5 p-2.5">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] flex-none mt-0.5"
          style={{ backgroundColor: color + '20', color }}
        >
          {cause.letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-xs">{cause.nameThai}</div>
          <div className="text-slate-400 text-[11px]">{cause.nameEn}</div>
          <div className="text-slate-300 text-[11px] mt-1 flex items-start gap-1">
            <span className="text-teal-400 flex-none">→</span>
            {cause.treatmentThai}
          </div>
        </div>
        {imageDataUrl && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex-none w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="ดูรูป guideline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        )}
      </div>
      {imageDataUrl && expanded && (
        <div className="border-t border-slate-700/60">
          <img src={imageDataUrl} alt={`${cause.nameThai} guideline`} className="w-full object-contain max-h-64 bg-slate-950" />
        </div>
      )}
    </div>
  )
}
