import { Drug, allDrugs } from '../../data/drugs'

interface Props {
  drugIds?: string[]
  drugs?: Drug[]   // overrides allDrugs when provided (from useTeachingContent)
}

export default function DrugReference({ drugIds, drugs: drugsProp }: Props) {
  const sourceList = drugsProp ?? allDrugs
  const drugs = drugIds ? sourceList.filter((d) => drugIds.includes(d.id)) : sourceList

  return (
    <div className="h-full overflow-auto p-4">
      <div className="space-y-3">
        {drugs.map((drug) => (
          <div key={drug.id} className="bg-navy-900 border border-slate-700/60 rounded-xl overflow-hidden">
            <div className="h-1" style={{ backgroundColor: drug.color }} />
            <div className="p-3">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <h3 className="text-white font-bold text-base">{drug.name}</h3>
                  <p className="text-slate-400 text-xs">{drug.nameThai}</p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border flex-none mt-0.5"
                  style={{ color: drug.color, borderColor: drug.color + '40', backgroundColor: drug.color + '15' }}>
                  {drug.route}
                </span>
              </div>
              <p className="text-slate-300 text-xs mb-2 italic">{drug.indication}</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-navy-800/80 rounded-lg p-2">
                  <div className="text-slate-500 text-[10px] mb-0.5">Dose</div>
                  <div className="text-white font-bold text-xs">{drug.dose}</div>
                </div>
                <div className="bg-navy-800/80 rounded-lg p-2">
                  <div className="text-slate-500 text-[10px] mb-0.5">Timing</div>
                  <div className="text-slate-200 font-semibold text-xs">{drug.timing}</div>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{drug.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
