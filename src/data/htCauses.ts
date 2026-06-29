import { loadHtOverrides } from '../lib/referenceOverrides'

export type HtCause = {
  id: string
  letter: 'H' | 'T'
  nameThai: string
  nameEn: string
  treatmentThai: string
}

export const allHtCauses: HtCause[] = [
  { id: 'hypovolemia',    letter: 'H', nameThai: 'ปริมาณเลือดน้อย',      nameEn: 'Hypovolemia',            treatmentThai: 'IV fluid bolus, หยุดเลือด' },
  { id: 'hypoxia',        letter: 'H', nameThai: 'ออกซิเจนต่ำ',           nameEn: 'Hypoxia',                treatmentThai: 'ให้ Oxygen, ใส่ท่อช่วยหายใจ' },
  { id: 'acidosis',       letter: 'H', nameThai: 'กรดเกินในเลือด',         nameEn: 'H⁺ (Acidosis)',          treatmentThai: 'แก้ไขสาเหตุ, NaHCO₃ ในบางกรณี' },
  { id: 'hyperkalemia',   letter: 'H', nameThai: 'โพแทสเซียมผิดปกติ',     nameEn: 'Hypo/Hyperkalemia',      treatmentThai: 'ตรวจ K⁺, แก้ไขด้วยยา' },
  { id: 'hypothermia',    letter: 'H', nameThai: 'ตัวเย็นเกินไป',          nameEn: 'Hypothermia',            treatmentThai: 'อุ่นร่างกาย, Warm IV fluid' },
  { id: 'pneumothorax',   letter: 'T', nameThai: 'ปอดยุบ (Tension)',       nameEn: 'Tension Pneumothorax',   treatmentThai: 'Needle decompression, chest tube' },
  { id: 'tamponade',      letter: 'T', nameThai: 'น้ำรอบหัวใจ',            nameEn: 'Tamponade (Cardiac)',     treatmentThai: 'Pericardiocentesis' },
  { id: 'toxins',         letter: 'T', nameThai: 'สารพิษ / ยา',            nameEn: 'Toxins',                 treatmentThai: 'ยาแก้พิษเฉพาะ, Activated charcoal' },
  { id: 'pe',             letter: 'T', nameThai: 'ลิ่มเลือดอุดปอด',        nameEn: 'Thrombosis (Pulmonary)', treatmentThai: 'Thrombolytics, Embolectomy' },
  { id: 'mi',             letter: 'T', nameThai: 'ลิ่มเลือดอุดหัวใจ',      nameEn: 'Thrombosis (Coronary)',  treatmentThai: 'PCI, Thrombolytics' },
]

export function getHtCausesWithOverrides(): HtCause[] {
  const overrides = loadHtOverrides()
  return allHtCauses.map(c => ({ ...c, ...overrides[c.id] }))
}

export function getHtCausesByIds(ids: string[]): HtCause[] {
  const all = getHtCausesWithOverrides()
  return ids.map((id) => all.find((c) => c.id === id)).filter(Boolean) as HtCause[]
}
