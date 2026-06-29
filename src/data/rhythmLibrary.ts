import { RhythmInfo, RhythmType } from '../types/rhythm'

export const rhythmLibrary: Record<RhythmType, RhythmInfo> = {
  // ─── Cardiac Arrest ────────────────────────────────────────────────────────
  VF: {
    id: 'VF',
    nameThai: 'Ventricular Fibrillation (VF)',
    nameEn: 'Ventricular Fibrillation',
    isShockable: true,
    descriptionThai: 'คลื่นไฟฟ้าหัวใจไม่เป็นระเบียบ ไม่มี QRS ชัดเจน — หัวใจสั่นพลิ้ว ไม่บีบตัว',
    color: '#ef4444',
  },
  PVT: {
    id: 'PVT',
    nameThai: 'Pulseless VT (pVT)',
    nameEn: 'Pulseless Ventricular Tachycardia',
    isShockable: true,
    descriptionThai: 'QRS กว้าง อัตราเร็ว >150/min ไม่มีชีพจร — ต้อง shock',
    color: '#f97316',
  },
  PEA: {
    id: 'PEA',
    nameThai: 'PEA (Pulseless Electrical Activity)',
    nameEn: 'Pulseless Electrical Activity',
    isShockable: false,
    descriptionThai: 'มีคลื่นไฟฟ้าหัวใจ แต่ไม่มีชีพจร — หา H\'s & T\'s',
    color: '#eab308',
  },
  ASYSTOLE: {
    id: 'ASYSTOLE',
    nameThai: 'Asystole',
    nameEn: 'Asystole',
    isShockable: false,
    descriptionThai: 'เส้นตรง ไม่มีกิจกรรมไฟฟ้าหัวใจ — CPR + Epinephrine',
    color: '#6b7280',
  },
  SINUS: {
    id: 'SINUS',
    nameThai: 'Sinus Rhythm (ROSC)',
    nameEn: 'Normal Sinus Rhythm',
    isShockable: false,
    descriptionThai: 'คลื่นไฟฟ้าหัวใจปกติ — ตรวจชีพจรทันที',
    color: '#22c55e',
  },
  // ─── Bradycardia ───────────────────────────────────────────────────────────
  SINUS_BRADY: {
    id: 'SINUS_BRADY',
    nameThai: 'Sinus Bradycardia',
    nameEn: 'Sinus Bradycardia',
    isShockable: false,
    descriptionThai: 'P wave ปกติ QRS ปกติ แต่ช้า HR < 50/min — อาจต้องการ Atropine',
    color: '#3b82f6',
  },
  AV_BLOCK: {
    id: 'AV_BLOCK',
    nameThai: '2nd Degree AV Block',
    nameEn: '2nd Degree AV Block (Mobitz II)',
    isShockable: false,
    descriptionThai: 'P wave บางตัวไม่นำไป QRS — Mobitz II ต้องการ TCP',
    color: '#60a5fa',
  },
  CHB: {
    id: 'CHB',
    nameThai: 'Complete Heart Block (3rd Degree)',
    nameEn: 'Complete Heart Block',
    isShockable: false,
    descriptionThai: 'P wave และ QRS เป็นอิสระต่อกัน HR ต่ำมาก — ต้องการ Pacemaker',
    color: '#93c5fd',
  },
  // ─── Tachycardia ───────────────────────────────────────────────────────────
  SVT: {
    id: 'SVT',
    nameThai: 'SVT (Supraventricular Tachycardia)',
    nameEn: 'Supraventricular Tachycardia',
    isShockable: false,
    descriptionThai: 'Narrow complex เร็ว HR 150–250/min — Vagal maneuver หรือ Adenosine',
    color: '#a855f7',
  },
  AF_RVR: {
    id: 'AF_RVR',
    nameThai: 'Atrial Fibrillation with RVR',
    nameEn: 'AF with Rapid Ventricular Response',
    isShockable: false,
    descriptionThai: 'Irregularly irregular ไม่มี P wave ชัด — Rate control หรือ Cardioversion',
    color: '#c084fc',
  },
  VT_PULSE: {
    id: 'VT_PULSE',
    nameThai: 'VT with Pulse (Stable/Unstable)',
    nameEn: 'Ventricular Tachycardia with Pulse',
    isShockable: true,
    descriptionThai: 'Wide complex เร็ว มีชีพจร — stable: ยา | unstable: Synchronized cardioversion',
    color: '#f97316',
  },
}

// Per-topic rhythm orders
export const rhythmOrder: RhythmType[] = ['VF', 'PVT', 'PEA', 'ASYSTOLE', 'SINUS']
export const bradycardiaRhythmOrder: RhythmType[] = ['SINUS_BRADY', 'AV_BLOCK', 'CHB', 'SINUS']
export const tachycardiaRhythmOrder: RhythmType[] = ['SVT', 'AF_RVR', 'VT_PULSE', 'PVT']
