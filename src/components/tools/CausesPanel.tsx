import { useState } from 'react'
import { TeachingTopicId } from '../../data/teachingTopics'
import { allHtCauses, getHtCausesByIds } from '../../data/htCauses'
import { loadCauseDetailOverrides } from '../../lib/causeDetailOverrides'

interface Props {
  topicId: TeachingTopicId
  htCauseIds?: string[]
}

// Extended H's & T's data with key findings + treatment detail
const htDetail: Record<string, { icon: string; findings: string[]; treatment: string[] }> = {
  hypovolemia: {
    icon: '🩸',
    findings: ['Flat neck veins', 'Weak/absent pulse', 'Trauma, bleeding, dehydration Hx'],
    treatment: ['IV/IO fluid bolus 1–2 L', 'Control bleeding source', 'Blood products if needed'],
  },
  hypoxia: {
    icon: '🫁',
    findings: ['SpO₂ < 90%', 'Cyanosis', 'Absent breath sounds', 'Airway obstruction'],
    treatment: ['100% O₂ via BVM or ETT', 'Suction airway', 'Confirm tube placement'],
  },
  acidosis: {
    icon: '⚗️',
    findings: ['DKA, sepsis, renal failure Hx', 'Kussmaul breathing (if conscious)', 'ABG: pH < 7.35'],
    treatment: ['Treat underlying cause', 'NaHCO₃ 1–2 mEq/kg if pH < 7.1', 'Hyperventilation (ETT)'],
  },
  hyperkalemia: {
    icon: '🔬',
    findings: ['Renal failure, K+ supplement Hx', 'Peaked T waves, wide QRS on ECG', 'Serum K+ > 5.5 mEq/L'],
    treatment: ['Calcium gluconate 1 g IV (cardiac membrane stabilization)', 'Insulin + D50 IV', 'Sodium bicarbonate, Kayexalate'],
  },
  hypothermia: {
    icon: '🌡️',
    findings: ['Core temp < 30°C (severe)', 'Exposure, cold water Hx', 'J-wave (Osborn wave) on ECG'],
    treatment: ['Passive/active rewarming', 'Warm IV fluids 42°C', 'ECMO if refractory arrest'],
  },
  pneumothorax: {
    icon: '🫀',
    findings: ['Absent breath sounds (unilateral)', 'Tracheal deviation (late sign)', 'Neck vein distension', 'Mechanism: trauma, ventilated patient'],
    treatment: ['Needle decompression: 2nd ICS MCL', 'Chest tube (28–32 Fr)', 'Do NOT delay for CXR if unstable'],
  },
  tamponade: {
    icon: '💧',
    findings: ["Beck's triad: JVD + Hypotension + Muffled heart sounds", 'Low voltage on ECG', 'Electrical alternans', 'ECHO: pericardial effusion'],
    treatment: ['Pericardiocentesis (subxiphoid approach)', 'Surgical drainage if needed', 'IV fluid bolus to increase preload temporarily'],
  },
  toxins: {
    icon: '☠️',
    findings: ['Known ingestion or exposure Hx', 'Pinpoint/dilated pupils', 'Toxidrome pattern (SLUDGE, sympathomimetic)'],
    treatment: ['Call Poison Control / Tox consult', 'Naloxone (opioids)', 'Atropine (organophosphates)', 'Lipid emulsion (lipophilic drugs)'],
  },
  pe: {
    icon: '🫁',
    findings: ['Sudden hypoxia + hypotension', 'S1Q3T3 on ECG', 'Right heart strain (ECHO)', 'Risk: DVT, immobility, malignancy'],
    treatment: ['Systemic thrombolytics (tPA 100 mg over 2h)', 'Surgical embolectomy if thrombolytics fail', 'Anticoagulation post-arrest'],
  },
  mi: {
    icon: '❤️',
    findings: ['ST elevation in ≥2 contiguous leads', 'New LBBB', 'Reciprocal changes', 'Chest pain Hx (may be absent in arrest)'],
    treatment: ['Immediate PCI (door-to-balloon < 90 min)', 'Thrombolytics if PCI unavailable', 'Aspirin + Heparin + P2Y12 inhibitor'],
  },
}

// Bradycardia reversible causes
const bradyCauses = [
  { id: 'hypoxia-brady', icon: '🫁', title: 'Hypoxia', detail: 'ให้ Oxygen 100% ทันที, พิจารณาใส่ท่อช่วยหายใจ' },
  { id: 'vagal-tone', icon: '🧠', title: 'Increased Vagal Tone', detail: 'Vomiting, Valsalva, carotid pressure — หาและแก้ไขสาเหตุ' },
  { id: 'inferior-mi', icon: '❤️', title: 'Inferior MI', detail: '12-lead ECG: ST elevation II, III, aVF — ปรึกษา cardiology' },
  { id: 'hyperkalemia-b', icon: '⚗️', title: 'Hyperkalemia', detail: 'ตรวจ K+ ทันที — Calcium gluconate, Bicarb, Kayexalate' },
  { id: 'hypothermia-b', icon: '🌡️', title: 'Hypothermia', detail: 'วัด core temp — Rewarm อย่างช้าๆ, Warm IV fluid' },
  { id: 'drug-toxin', icon: '💊', title: 'Drug/Toxin', detail: 'Beta blocker · CCB · Digoxin — สอบถาม Hx ยาทุกครั้ง' },
  { id: 'raised-icp', icon: '🧠', title: 'Raised ICP', detail: 'Cushing reflex: bradycardia + hypertension — CT head ด่วน' },
]

// Tachycardia assessment
const tachyAssessment = [
  { id: 'stable-check', icon: '⚠️', title: 'Stable vs Unstable?', detail: 'Unstable: hypotension, chest pain, shock, altered consciousness → Cardioversion ทันที' },
  { id: 'narrow-wide', icon: '📊', title: 'Narrow vs Wide QRS?', detail: 'Narrow (<120ms): SVT, AF, AFl | Wide (≥120ms): VT, SVT aberrant, pre-excited' },
  { id: 'regular-irregular', icon: '🔄', title: 'Regular vs Irregular?', detail: 'Irregular narrow: AF, MAT | Irregular wide: AF+WPW, polymorphic VT' },
  { id: 'sepsis-fever', icon: '🌡️', title: 'Sepsis / Fever / Pain / Hypovolemia', detail: 'Sinus tachycardia เป็นการตอบสนองต่อ physiologic stress — แก้สาเหตุ' },
  { id: 'ischemia-t', icon: '❤️', title: 'Ischemia / ACS?', detail: '12-lead ECG ก่อนให้ยาทุกครั้ง — ดู ST changes, QT interval' },
  { id: 'electrolytes', icon: '⚗️', title: 'Electrolyte Abnormality', detail: 'Hypokalemia, Hypomagnesemia → risk of VT/TdP — ตรวจ electrolytes' },
  { id: 'drug-tachy', icon: '💊', title: 'Stimulants / Drug Toxicity', detail: 'Cocaine, amphetamine, theophylline — toxicology screen, supportive care' },
]

export default function CausesPanel({ topicId, htCauseIds }: Props) {
  if (topicId === 'bradycardia') return <BradyCausesPanel />
  if (topicId === 'tachycardia') return <TachyAssessmentPanel />

  const causes = htCauseIds ? getHtCausesByIds(htCauseIds) : allHtCauses
  const hs = causes.filter((c) => c.letter === 'H')
  const ts = causes.filter((c) => c.letter === 'T')
  const overrides = loadCauseDetailOverrides()

  return (
    <div className="h-full overflow-auto">
      {/* Column headers */}
      <div className="grid grid-cols-2 gap-0 sticky top-0 z-10 bg-navy-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center gap-2 px-3 py-2 border-r border-slate-800">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-black text-blue-400 text-sm">H</div>
          <span className="text-blue-300 font-bold text-sm">5 H's</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-black text-orange-400 text-sm">T</div>
          <span className="text-orange-300 font-bold text-sm">5 T's</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-0">
        {/* H's column */}
        <div className="border-r border-slate-800 p-2 space-y-1.5">
          {hs.map((c) => {
            const base = htDetail[c.id]
            const ov = overrides[c.id]
            return (
              <HtCard
                key={c.id}
                nameThai={c.nameThai}
                nameEn={c.nameEn}
                icon={base?.icon ?? 'H'}
                findings={ov?.findings ?? base?.findings ?? []}
                treatment={ov?.treatment ?? base?.treatment ?? [c.treatmentThai]}
                accentColor="#3b82f6"
              />
            )
          })}
        </div>

        {/* T's column */}
        <div className="p-2 space-y-1.5">
          {ts.map((c) => {
            const base = htDetail[c.id]
            const ov = overrides[c.id]
            return (
              <HtCard
                key={c.id}
                nameThai={c.nameThai}
                nameEn={c.nameEn}
                icon={base?.icon ?? 'T'}
                findings={ov?.findings ?? base?.findings ?? []}
                treatment={ov?.treatment ?? base?.treatment ?? [c.treatmentThai]}
                accentColor="#f97316"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function HtCard({
  nameThai, nameEn, icon, findings, treatment, accentColor,
}: {
  nameThai: string
  nameEn: string
  icon: string
  findings: string[]
  treatment: string[]
  accentColor: string
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{ borderColor: expanded ? accentColor + '50' : '#334155' }}
    >
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-slate-800/40 transition-colors"
      >
        <span className="text-base flex-none leading-none">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-xs leading-tight truncate">{nameEn}</div>
          <div className="text-slate-400 text-[10px] leading-tight truncate">{nameThai}</div>
        </div>
        <svg
          className={`w-3 h-3 flex-none text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-2 border-t" style={{ borderColor: accentColor + '30' }}>
          {/* Key findings */}
          {findings.length > 0 && (
            <div className="pt-2">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Key Findings</div>
              <div className="space-y-0.5">
                {findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-[9px] mt-0.5 flex-none" style={{ color: accentColor }}>▸</span>
                    <span className="text-slate-200 text-[10px] leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatment */}
          {treatment.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Treatment</div>
              <div className="space-y-0.5">
                {treatment.map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-green-500 text-[9px] mt-0.5 flex-none">✓</span>
                    <span className="text-slate-200 text-[10px] leading-snug">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BradyCausesPanel() {
  return (
    <div className="h-full overflow-auto p-3">
      <div className="mb-3">
        <div className="text-white font-bold text-sm">Brady Causes</div>
        <div className="text-slate-400 text-xs mt-0.5">สาเหตุและ reversible causes ของ Bradycardia</div>
      </div>
      <div className="space-y-2">
        {bradyCauses.map((c) => (
          <div key={c.id} className="bg-navy-900 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="text-lg flex-none">{c.icon}</span>
              <div className="min-w-0">
                <div className="text-white font-semibold text-xs">{c.title}</div>
                <div className="text-slate-300 text-[11px] mt-1 leading-relaxed">{c.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-blue-300 text-xs font-semibold mb-1">Teaching Tip</p>
        <p className="text-blue-200 text-[11px] leading-relaxed">
          ใน symptomatic bradycardia ให้ค้นหาสาเหตุที่แก้ไขได้ควบคู่กับการรักษา — โดยเฉพาะ inferior MI, drug toxicity
        </p>
      </div>
    </div>
  )
}

function TachyAssessmentPanel() {
  return (
    <div className="h-full overflow-auto p-3">
      <div className="mb-3">
        <div className="text-white font-bold text-sm">Tachy Assessment</div>
        <div className="text-slate-400 text-xs mt-0.5">การประเมินและสาเหตุของ Tachycardia</div>
      </div>
      <div className="space-y-2">
        {tachyAssessment.map((c) => (
          <div key={c.id} className="bg-navy-900 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="text-base flex-none mt-0.5">{c.icon}</span>
              <div className="min-w-0">
                <div className="text-white font-semibold text-xs">{c.title}</div>
                <div className="text-slate-300 text-[11px] mt-1 leading-relaxed">{c.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
        <p className="text-purple-300 text-xs font-semibold mb-1">Teaching Tip</p>
        <p className="text-purple-200 text-[11px] leading-relaxed">
          Stable vs Unstable เป็น key decision — Unstable ให้ synchronized cardioversion ทันที ไม่รอผล lab
        </p>
      </div>
    </div>
  )
}
