import { useState, useEffect, useRef } from 'react'

type TimerMode = 'code' | 'cpr' | 'drug'

export default function CodeTimer() {
  const [codeRunning, setCodeRunning] = useState(false)
  const [codeElapsed, setCodeElapsed] = useState(0)
  const [cprElapsed, setCprElapsed] = useState(0)
  const [cprRunning, setCprRunning] = useState(false)
  const [drugTimers, setDrugTimers] = useState<{ name: string; elapsed: number; id: number }[]>([])
  const [activeMode, setActiveMode] = useState<TimerMode>('code')
  const codeRef = useRef<number | null>(null)
  const cprRef = useRef<number | null>(null)
  const drugRef = useRef<number | null>(null)

  useEffect(() => {
    if (codeRunning) {
      codeRef.current = setInterval(() => setCodeElapsed((e) => e + 1), 1000)
    } else {
      if (codeRef.current) clearInterval(codeRef.current)
    }
    return () => { if (codeRef.current) clearInterval(codeRef.current) }
  }, [codeRunning])

  useEffect(() => {
    if (cprRunning) {
      cprRef.current = setInterval(() => setCprElapsed((e) => e + 1), 1000)
    } else {
      if (cprRef.current) clearInterval(cprRef.current)
    }
    return () => { if (cprRef.current) clearInterval(cprRef.current) }
  }, [cprRunning])

  useEffect(() => {
    drugRef.current = setInterval(() => {
      setDrugTimers((prev) => prev.map((d) => ({ ...d, elapsed: d.elapsed + 1 })))
    }, 1000)
    return () => { if (drugRef.current) clearInterval(drugRef.current) }
  }, [])

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const resetCpr = () => {
    setCprElapsed(0)
    setCprRunning(true)
  }

  const addDrugTimer = (name: string) => {
    setDrugTimers((prev) => [...prev, { name, elapsed: 0, id: Date.now() }])
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-white font-bold text-2xl">Code Timer</h2>
          <p className="text-slate-400 text-sm mt-1">จับเวลา Cardiac Arrest — CPR cycles และยา</p>
        </div>

        {/* Tab */}
        <div className="flex gap-2 bg-navy-800 border border-slate-700 rounded-xl p-1">
          {(['code', 'cpr', 'drug'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeMode === m ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {m === 'code' ? '⏱ Code Time' : m === 'cpr' ? '🫀 CPR Cycle' : '💊 Drug Timer'}
            </button>
          ))}
        </div>

        {activeMode === 'code' && (
          <div className="bg-navy-800 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="text-7xl font-mono font-bold text-white mb-6 tracking-widest">
              {fmt(codeElapsed)}
            </div>
            <p className="text-slate-400 text-sm mb-6">เวลาตั้งแต่เริ่ม Cardiac Arrest</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCodeRunning(!codeRunning)}
                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${codeRunning ? 'bg-yellow-500 hover:bg-yellow-400 text-white' : 'bg-teal-500 hover:bg-teal-400 text-white'}`}
              >
                {codeRunning ? '⏸ หยุด' : '▶ เริ่ม'}
              </button>
              <button
                onClick={() => { setCodeElapsed(0); setCodeRunning(false) }}
                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        )}

        {activeMode === 'cpr' && (
          <div className="bg-navy-800 border border-slate-700 rounded-2xl p-8 text-center">
            <div className={`text-7xl font-mono font-bold mb-2 tracking-widest transition-colors ${cprElapsed >= 120 ? 'text-red-400 animate-pulse' : cprElapsed >= 90 ? 'text-yellow-400' : 'text-white'}`}>
              {fmt(cprElapsed)}
            </div>
            <p className="text-slate-400 text-sm mb-2">CPR Cycle (เป้าหมาย: 2 นาที = 2:00)</p>
            {cprElapsed >= 120 && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-2 mb-4 text-red-400 font-bold animate-pulse">
                🔔 ถึง 2 นาที! — ตรวจ Rhythm / เปลี่ยนคนกด CPR
              </div>
            )}
            {cprElapsed >= 90 && cprElapsed < 120 && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl px-4 py-2 mb-4 text-yellow-400 text-sm">
                ⚠️ เกือบ 2 นาที — เตรียมตรวจ Rhythm
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCprRunning(!cprRunning)}
                className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${cprRunning ? 'bg-yellow-500 hover:bg-yellow-400 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white'}`}
              >
                {cprRunning ? '⏸ หยุด' : '🫀 เริ่ม CPR'}
              </button>
              <button
                onClick={resetCpr}
                className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold transition-colors"
              >
                🔄 รีเซ็ต (Shock)
              </button>
            </div>
          </div>
        )}

        {activeMode === 'drug' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {['Epinephrine', 'Amiodarone', 'Lidocaine', 'Atropine'].map((drug) => (
                <button
                  key={drug}
                  onClick={() => addDrugTimer(drug)}
                  className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
                >
                  + {drug}
                </button>
              ))}
            </div>
            <p className="text-slate-500 text-xs text-center">กดปุ่มเพื่อเริ่มจับเวลายาแต่ละชนิด</p>
            {drugTimers.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-8">ยังไม่ได้ให้ยา</p>
            ) : (
              <div className="space-y-2">
                {drugTimers.map((d) => (
                  <div key={d.id} className={`flex items-center justify-between bg-navy-800 border rounded-xl px-4 py-3
                    ${d.elapsed >= 300 ? 'border-red-500/50 bg-red-500/10' : d.elapsed >= 180 ? 'border-yellow-500/40' : 'border-slate-700'}`}>
                    <div>
                      <span className="text-white font-semibold text-sm">{d.name}</span>
                      {d.elapsed >= 300 && <span className="text-red-400 text-xs ml-2 font-bold">ให้ซ้ำได้แล้ว!</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold text-lg ${d.elapsed >= 300 ? 'text-red-400' : d.elapsed >= 180 ? 'text-yellow-400' : 'text-white'}`}>
                        {fmt(d.elapsed)}
                      </span>
                      <button
                        onClick={() => setDrugTimers((prev) => prev.filter((x) => x.id !== d.id))}
                        className="text-slate-600 hover:text-red-400 transition-colors text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
