import { loadRoleOverrides } from '../../lib/referenceOverrides'

type Role = { id: string; title: string; titleEn: string; responsibilities: string[]; color: string; icon: string }

export const defaultRoles: Role[] = [
  {
    id: 'leader',
    title: 'Team Leader',
    titleEn: 'Team Leader',
    responsibilities: [
      'ควบคุมและประสานงานทีม',
      'ตัดสินใจและสั่งการ',
      'ติดตาม algorithm',
      'สรุปผลและสื่อสารกับครอบครัว',
    ],
    color: '#f97316',
    icon: '👑',
  },
  {
    id: 'compressor',
    title: 'Compressor',
    titleEn: 'Chest Compressor',
    responsibilities: [
      'กด CPR คุณภาพสูง',
      'เปลี่ยนทุก 2 นาที',
      'แจ้งเมื่อเหนื่อย',
    ],
    color: '#ef4444',
    icon: '🫀',
  },
  {
    id: 'airway',
    title: 'Airway',
    titleEn: 'Airway Manager',
    responsibilities: [
      'จัดการทาง airway',
      'BVM ventilation 30:2',
      'ใส่ท่อช่วยหายใจ (ถ้าจำเป็น)',
      'ดูแล capnography',
    ],
    color: '#3b82f6',
    icon: '😷',
  },
  {
    id: 'iv',
    title: 'IV/Medication',
    titleEn: 'IV & Medication',
    responsibilities: [
      'เปิด IV/IO access',
      'เตรียมและให้ยา',
      'Flush ยาด้วย NS 20mL',
      'บันทึกยาและเวลาที่ให้',
    ],
    color: '#8b5cf6',
    icon: '💉',
  },
  {
    id: 'monitor',
    title: 'Monitor/Defibrillator',
    titleEn: 'Monitor Operator',
    responsibilities: [
      'ติด pads / electrodes',
      'อ่าน rhythm',
      'Charge และ operate defibrillator',
      'ประกาศ "Stand Clear"',
    ],
    color: '#22c55e',
    icon: '🖥️',
  },
  {
    id: 'recorder',
    title: 'Recorder / Timer',
    titleEn: 'Recorder & Timer',
    responsibilities: [
      'บันทึกเวลาและเหตุการณ์',
      'จับเวลา CPR cycle (2 นาที)',
      'บันทึกยาและ rhythm',
      'สื่อสารเวลาให้ Team Leader',
    ],
    color: '#eab308',
    icon: '📋',
  },
]

export default function TeamRoles() {
  const overrides = loadRoleOverrides()
  const roles = defaultRoles.map(r => ({
    ...r,
    ...overrides[r.id],
    responsibilities: overrides[r.id]?.responsibilities ?? r.responsibilities,
  }))

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-white font-bold text-2xl">Team Roles</h2>
          <p className="text-slate-400 text-sm mt-1">บทบาทในทีม Cardiac Arrest — แบ่งหน้าที่ก่อนเริ่ม resuscitation</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const imgUrl = overrides[role.id]?.imageDataUrl
            return (
            <div key={role.id} className="bg-navy-800 border border-slate-700/60 rounded-2xl overflow-hidden">
              <div className="h-1" style={{ backgroundColor: role.color }} />
              {imgUrl && (
                <div className="border-b border-slate-700/60">
                  <img src={imgUrl} alt={`${role.title} guideline`} className="w-full object-contain max-h-40 bg-slate-950" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <div className="text-white font-bold text-sm">{role.title}</div>
                    <div className="text-slate-400 text-xs">{role.titleEn}</div>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {role.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-none" style={{ backgroundColor: role.color }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            )
          })}
        </div>
        <div className="mt-6 bg-teal-500/10 border border-teal-500/30 rounded-2xl p-4">
          <p className="text-teal-300 font-semibold mb-1">💡 Teaching Tip — Closed-Loop Communication</p>
          <p className="text-teal-200 text-sm">
            สอนให้ทีมใช้ Closed-Loop Communication: ผู้รับคำสั่งต้องพูดซ้ำและยืนยันกลับ เช่น "รับทราบ — จะให้ Epinephrine 1mg ทาง IV ตอนนี้"
          </p>
        </div>
      </div>
    </div>
  )
}
