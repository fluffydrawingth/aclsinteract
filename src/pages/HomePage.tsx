interface Props {
  onStartTeaching: () => void
  onReference: () => void
  onAdmin: () => void
}

export default function HomePage({ onStartTeaching, onReference, onAdmin }: Props) {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-teal-500/6 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/40 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-teal-400 text-sm font-medium tracking-wide uppercase">ACLS 2025 · สำหรับอาจารย์ผู้สอน</span>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-extrabold text-white leading-tight mb-4">
          ACLS{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
            Interactive
          </span>
        </h1>

        <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto">
          แพลตฟอร์มการสอน ACLS แบบ interactive<br />
          ออกแบบมาเพื่อการสอนในชั้นเรียนและ scenario-based learning
        </p>

        {/* Two entry points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          {/* Teaching Mode — PRIMARY */}
          <button
            onClick={onStartTeaching}
            className="group relative bg-teal-500 hover:bg-teal-400 text-white rounded-3xl p-8 text-left transition-all duration-200 shadow-xl shadow-teal-500/25 hover:shadow-teal-400/35 hover:scale-[1.02] active:scale-100"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="font-bold text-2xl mb-1">เริ่มสอน</div>
            <div className="text-teal-100/80 text-sm font-medium mb-3">Teaching Mode</div>
            <div className="text-teal-100/60 text-sm leading-relaxed">
              Workspace สำหรับสอนในชั้นเรียน<br />
              Patient scene + floating panels<br />
              Algorithm, Monitor, Notes, Drugs
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Reference Mode */}
          <button
            onClick={onReference}
            className="group bg-navy-800 hover:bg-navy-700 border border-slate-700/60 hover:border-slate-600 text-white rounded-3xl p-8 text-left transition-all duration-200 hover:scale-[1.02] active:scale-100"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-700/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="font-bold text-2xl mb-1">Reference</div>
            <div className="text-slate-400 text-sm font-medium mb-3">Reference Library</div>
            <div className="text-slate-500 text-sm leading-relaxed">
              ทบทวน Algorithm, ECG, ยา<br />
              H's & T's, Team Roles<br />
              เตรียมสอนและศึกษาเพิ่มเติม
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1 pb-4 pt-2">
        <div className="flex items-center gap-3">
          <p className="text-slate-700 text-xs">ACLS Interactive · สำหรับการศึกษาเท่านั้น</p>
          <button
            onClick={onAdmin}
            className="text-slate-700 hover:text-slate-500 text-xs flex items-center gap-1 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </button>
        </div>
        <p className="text-slate-600 text-[11px] tracking-wide">
          Designed &amp; developed by <span className="text-slate-500 font-medium">Chollathip M.D.</span>
          {' · '}Emergency Department, Phatthalung Hospital
        </p>
      </div>
    </div>
  )
}
