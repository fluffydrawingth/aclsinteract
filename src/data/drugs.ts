export type Drug = {
  id: string
  name: string
  nameThai: string
  indication: string
  dose: string
  route: string
  timing: string
  notes: string
  color: string
}

export const allDrugs: Drug[] = [
  {
    id: 'epinephrine',
    name: 'Epinephrine',
    nameThai: 'อิพิเนฟริน',
    indication: 'VF, pVT, PEA, Asystole',
    dose: '1mg',
    route: 'IV/IO',
    timing: 'ทุก 3–5 นาที',
    notes: 'VF/pVT: หลัง shock ที่ 2 | PEA/Asystole: เร็วที่สุด | Flush 20mL NS',
    color: '#ef4444',
  },
  {
    id: 'amiodarone',
    name: 'Amiodarone',
    nameThai: 'อะมิโอดาโรน',
    indication: 'VF / pVT refractory (หลัง shock ≥3 ครั้ง)',
    dose: '300mg (ครั้งที่ 2: 150mg)',
    route: 'IV/IO push',
    timing: 'ครั้งเดียว',
    notes: 'ให้ระหว่าง CPR | ทางเลือก: Lidocaine 1–1.5mg/kg',
    color: '#8b5cf6',
  },
  {
    id: 'lidocaine',
    name: 'Lidocaine',
    nameThai: 'ลิโดเคน',
    indication: 'VF / pVT (ทางเลือกแทน Amiodarone)',
    dose: '1–1.5mg/kg',
    route: 'IV/IO',
    timing: 'ซ้ำ 0.5–0.75mg/kg ทุก 5–10 min (max 3mg/kg)',
    notes: 'ใช้เมื่อไม่มี Amiodarone',
    color: '#6366f1',
  },
  {
    id: 'atropine',
    name: 'Atropine',
    nameThai: 'แอโทรพีน',
    indication: 'Symptomatic Bradycardia',
    dose: '0.5mg',
    route: 'IV/IO',
    timing: 'ทุก 3–5 min (max 3mg)',
    notes: 'ไม่ใช้ใน cardiac arrest | ใช้ใน bradycardia ที่มีอาการ',
    color: '#0ea5e9',
  },
  {
    id: 'dopamine',
    name: 'Dopamine',
    nameThai: 'โดพามีน',
    indication: 'Bradycardia ที่ไม่ตอบสนองต่อ Atropine, Post-ROSC hypotension',
    dose: '2–20 mcg/kg/min',
    route: 'IV infusion',
    timing: 'titrate ตาม HR และ BP',
    notes: 'Brady: titrate ให้ HR > 50/min | Post-ROSC: target MAP ≥65mmHg',
    color: '#22c55e',
  },
  {
    id: 'epinephrine-infusion',
    name: 'Epinephrine Infusion',
    nameThai: 'อิพิเนฟริน (หยด)',
    indication: 'Bradycardia ที่ไม่ตอบสนองต่อ Atropine หรือ Dopamine',
    dose: '2–10 mcg/min',
    route: 'IV infusion',
    timing: 'titrate ตาม HR',
    notes: 'ใช้เมื่อ Atropine และ Dopamine ไม่ได้ผล ขณะรอ pacemaker',
    color: '#f59e0b',
  },
  {
    id: 'adenosine',
    name: 'Adenosine',
    nameThai: 'อะดีโนซีน',
    indication: 'SVT (Stable narrow-complex tachycardia)',
    dose: '6mg → 12mg → 12mg',
    route: 'IV rapid push + flush เร็ว',
    timing: 'ซ้ำ 12mg ได้ 2 ครั้งถ้าไม่ได้ผล',
    notes: 'ต้อง push เร็วมาก antecubital vein | ระวังใน WPW + AF',
    color: '#f97316',
  },
  {
    id: 'amiodarone-tachy',
    name: 'Amiodarone',
    nameThai: 'อะมิโอดาโรน',
    indication: 'Stable wide-complex tachycardia, AF rate control',
    dose: '150mg ใน 10 นาที → 1mg/min 6h → 0.5mg/min 18h',
    route: 'IV infusion',
    timing: 'loading dose ก่อน maintenance',
    notes: 'ใช้ใน wide-complex tachycardia ที่ stable | ไม่ใช่ IV push ใน tachy',
    color: '#8b5cf6',
  },
  {
    id: 'procainamide',
    name: 'Procainamide',
    nameThai: 'โพรเคนอาไมด์',
    indication: 'Stable wide-complex tachycardia, SVT ที่ไม่ตอบสนองต่อ Adenosine',
    dose: '20–50mg/min (max 17mg/kg)',
    route: 'IV infusion ช้าๆ',
    timing: 'หยุดถ้า QRS widening >50% หรือ hypotension',
    notes: 'ระวัง hypotension | หยุดเมื่อ arrhythmia หาย | ไม่ใช้ใน prolonged QT',
    color: '#ec4899',
  },
  {
    id: 'sotalol',
    name: 'Sotalol',
    nameThai: 'โซทาลอล',
    indication: 'Stable ventricular tachycardia',
    dose: '100mg (1.5mg/kg) ใน 5 นาที',
    route: 'IV',
    timing: 'ครั้งเดียว',
    notes: 'ระวัง prolonged QT | ไม่ใช้ใน decompensated HF | ทางเลือก Procainamide',
    color: '#14b8a6',
  },
]

export function getDrugsByIds(ids: string[]): Drug[] {
  return ids.map((id) => allDrugs.find((d) => d.id === id)).filter(Boolean) as Drug[]
}
