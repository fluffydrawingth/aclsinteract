import { useState, useEffect } from 'react'

interface Props {
  onComplete: () => void
  onCancel: () => void
}

type Phase = 'confirm' | 'charging' | 'clear' | 'shock' | 'cpr'

export default function DefibrillationFlow({ onComplete, onCancel }: Props) {
  const [phase, setPhase] = useState<Phase>('confirm')
  const [chargeProgress, setChargeProgress] = useState(0)

  useEffect(() => {
    if (phase === 'charging') {
      const interval = setInterval(() => {
        setChargeProgress((p) => {
          if (p >= 100) {
            clearInterval(interval)
            setTimeout(() => setPhase('clear'), 300)
            return 100
          }
          return p + 5
        })
      }, 80)
      return () => clearInterval(interval)
    }
  }, [phase])

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-navy-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">

        {phase === 'confirm' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚡</span>
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">Defibrillation</h2>
            <p className="text-slate-400 mb-2">ตรวจสอบว่า rhythm เป็น VF หรือ Pulseless VT</p>
            <p className="text-yellow-300 text-sm font-medium mb-6">พลังงาน: 200J (Biphasic)</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => setPhase('charging')}
                className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-white font-bold transition-colors"
              >
                Charge!
              </button>
            </div>
          </>
        )}

        {phase === 'charging' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-orange-400 font-bold text-2xl mb-4">กำลัง Charge...</h2>
            <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
              <div
                className="bg-orange-400 h-4 rounded-full transition-all duration-100"
                style={{ width: `${chargeProgress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm">{chargeProgress}%</p>
          </>
        )}

        {phase === 'clear' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">🚨</span>
            </div>
            <h2 className="text-red-400 font-bold text-3xl mb-2 animate-pulse">STAND CLEAR!</h2>
            <p className="text-white text-lg mb-2">ห้ามสัมผัสผู้ป่วย</p>
            <div className="text-left space-y-1 mb-6">
              <p className="text-white font-bold text-base">ประกาศดัง:</p>
              <p className="text-red-300 text-lg font-semibold">"ฉันถอย — คุณถอย — ทุกคนถอย"</p>
              <div className="mt-3 space-y-1 text-sm text-slate-300">
                <p>• ห้ามสัมผัสผู้ป่วย</p>
                <p>• ยืนยันทุกคน clear</p>
              </div>
            </div>
            <button
              onClick={() => setPhase('shock')}
              className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xl transition-colors shadow-lg shadow-red-500/30"
            >
              ⚡ Shock!
            </button>
          </>
        )}

        {phase === 'shock' && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-yellow-500/30 border-2 border-yellow-400 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚡</span>
            </div>
            <h2 className="text-yellow-400 font-bold text-3xl mb-2">Shock Delivered!</h2>
            <p className="text-white text-lg mb-6">200J — Biphasic</p>
            <button
              onClick={() => setPhase('cpr')}
              className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xl transition-colors"
            >
              เริ่ม CPR ทันที!
            </button>
          </>
        )}

        {phase === 'cpr' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">🫀</span>
            </div>
            <h2 className="text-teal-400 font-bold text-2xl mb-2">Resume CPR ทันที!</h2>
            <p className="text-slate-300 mb-2">ไม่ต้องตรวจ rhythm ก่อน</p>
            <p className="text-slate-400 text-sm mb-6">CPR 2 นาที → rhythm check → ยา</p>
            <button
              onClick={onComplete}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold transition-colors"
            >
              ✓ ดำเนินการต่อ
            </button>
          </>
        )}
      </div>
    </div>
  )
}
