import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_ADMIN_PASSWORD ?? 'erptl1669'
const SESSION_KEY = 'acls-admin-unlocked'

export function isAdminUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function lockAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

interface Props {
  onUnlock: () => void
  onCancel: () => void
}

export default function AdminPasswordGate({ onUnlock, onCancel }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    // If already unlocked this session, skip gate
    if (isAdminUnlocked()) onUnlock()
  }, [onUnlock])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center">
      <div className={`bg-navy-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl ${shake ? 'animate-shake' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-lg">Admin Access</div>
            <div className="text-slate-400 text-sm">ใส่รหัสผ่านเพื่อเข้า Admin</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false) }}
              placeholder="รหัสผ่าน..."
              autoFocus
              className={`w-full bg-navy-950 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors ${
                error ? 'border-red-500/70 focus:border-red-500' : 'border-slate-700 focus:border-teal-500/60'
              }`}
            />
            {error && <p className="text-red-400 text-xs mt-1.5">รหัสผ่านไม่ถูกต้อง</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
