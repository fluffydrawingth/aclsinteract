import { ScenarioDefinition, PatientState } from '../types/scenario'

const arrestBase: PatientState = {
  consciousness: 'unresponsive',
  isUnresponsive: true,
  isBreathing: false,
  hasPulse: false,
  heartRate: null,
  bloodPressure: null,
  spo2: null,
  oxygenApplied: false,
  airwayDevice: 'none',
  ivAccess: false,
  monitorAttached: false,
  defibPadsAttached: false,
  rhythmVisible: false,
  teamCalled: false,
  cprActive: false,
  shockDelivered: false,
  shockCount: 0,
  rosc: false,
}

const bradyBase: PatientState = {
  consciousness: 'verbal',
  isUnresponsive: false,
  isBreathing: true,
  hasPulse: true,
  heartRate: 38,
  bloodPressure: '80/50',
  spo2: 94,
  oxygenApplied: false,
  airwayDevice: 'none',
  ivAccess: false,
  monitorAttached: false,
  defibPadsAttached: false,
  rhythmVisible: false,
  teamCalled: false,
  cprActive: false,
  shockDelivered: false,
  shockCount: 0,
  rosc: false,
}

const tachyBase: PatientState = {
  consciousness: 'alert',
  isUnresponsive: false,
  isBreathing: true,
  hasPulse: true,
  heartRate: 185,
  bloodPressure: '100/70',
  spo2: 96,
  oxygenApplied: false,
  airwayDevice: 'none',
  ivAccess: false,
  monitorAttached: false,
  defibPadsAttached: false,
  rhythmVisible: false,
  teamCalled: false,
  cprActive: false,
  shockDelivered: false,
  shockCount: 0,
  rosc: false,
}

export const builtInScenarios: ScenarioDefinition[] = [

  // ─── CARDIAC ARREST ────────────────────────────────────────────────────────

  {
    id: 'vf-arrest',
    title: 'VF Cardiac Arrest',
    titleEn: 'Ventricular Fibrillation',
    topic: 'cardiac-arrest',
    difficulty: 'intermediate',
    description: 'ชาย 55 ปี collapse ที่ห้องฉุกเฉิน — VF ที่รักษาได้ด้วย Defibrillation',
    patientLabel: 'ชาย 55 ปี — collapse ที่ ER',
    patientAge: 55,
    initialState: { ...arrestBase },
    initialRhythm: 'VF',
    algorithmId: 'cardiac-arrest',
    drugIds: ['epinephrine', 'amiodarone', 'lidocaine'],
    actionIds: ['check-responsiveness','call-team','check-pulse','start-cpr','apply-oxygen','iv-access','attach-monitor','rhythm-check','defibrillate','epinephrine','amiodarone','rosc'],
    objectives: [
      'ระบุ VF และ shockable rhythms',
      'ทำ high-quality CPR ได้ถูกต้อง',
      'Defibrillate ได้ถูกเวลาและพลังงาน',
      'ให้ Epinephrine ถูกเวลา',
    ],
    discussionQuestions: [
      'ทำไม CPR ถึงสำคัญก่อน Defibrillation ในบางสถานการณ์?',
      'เมื่อไหร่ถึงควรให้ Amiodarone?',
      'Reversible causes ของ VF คืออะไรบ้าง?',
    ],
    actionOverrides: {
      'defibrillate': {
        findings: [
          'Shock 200J — VF ยังคงอยู่หลัง shock ครั้งแรก',
          'Resume CPR ทันที',
          'Charge เครื่องระหว่าง CPR',
          'พิจารณา Epinephrine หลัง shock ที่ 2',
        ],
      },
      'rosc': {
        findings: [
          'VF converted — Sinus rhythm ปรากฏ',
          'ชีพจรกลับมา — carotid pulse palpable',
          'BP: 90/60 mmHg',
          'SpO₂: 88% — ติด high-flow oxygen',
          '→ Post-ROSC care: TTM, PCI workup',
        ],
        stateEffect: {
          rosc: true, hasPulse: true, isBreathing: true,
          consciousness: 'pain', heartRate: 72,
          bloodPressure: '90/60', spo2: 88, cprActive: false,
        },
      },
    },
  },

  {
    id: 'pvt-arrest',
    title: 'Pulseless VT',
    titleEn: 'Pulseless Ventricular Tachycardia',
    topic: 'cardiac-arrest',
    difficulty: 'intermediate',
    description: 'ชาย 60 ปี ประวัติ CAD — หัวใจหยุดเต้นในห้องตรวจ',
    patientLabel: 'ชาย 60 ปี — ประวัติ MI เดิม',
    patientAge: 60,
    initialState: { ...arrestBase },
    initialRhythm: 'PVT',
    algorithmId: 'cardiac-arrest',
    drugIds: ['epinephrine', 'amiodarone', 'lidocaine'],
    actionIds: ['check-responsiveness','call-team','check-pulse','start-cpr','apply-oxygen','iv-access','attach-monitor','rhythm-check','defibrillate','epinephrine','amiodarone','rosc'],
    objectives: [
      'แยก Pulseless VT จาก VT with pulse',
      'รักษา pVT ด้วย Defibrillation (ไม่ใช่ Cardioversion)',
      'พิจารณา Amiodarone ใน refractory pVT',
    ],
    discussionQuestions: [
      'VT with pulse vs Pulseless VT — การรักษาต่างกันอย่างไร?',
      'ทำไม pVT ต้องใช้ Unsynchronized shock?',
    ],
    actionOverrides: {
      'check-pulse': {
        findings: [
          'ไม่พบชีพจร — Pulseless VT',
          'Wide complex tachycardia บน monitor',
          'Rate 180 bpm — Regular',
          '→ รักษาเหมือน VF: Shock ทันที',
        ],
      },
    },
  },

  {
    id: 'pea-arrest',
    title: 'PEA Cardiac Arrest',
    titleEn: 'Pulseless Electrical Activity',
    topic: 'cardiac-arrest',
    difficulty: 'advanced',
    description: 'ชาย 45 ปี อุบัติเหตุรถยนต์ — หัวใจหยุดเต้นจาก hypovolemia',
    patientLabel: 'ชาย 45 ปี — Trauma, hypovolemia',
    patientAge: 45,
    initialState: { ...arrestBase },
    initialRhythm: 'PEA',
    algorithmId: 'cardiac-arrest',
    drugIds: ['epinephrine'],
    actionIds: ['check-responsiveness','call-team','check-pulse','start-cpr','apply-oxygen','iv-access','attach-monitor','rhythm-check','epinephrine','rosc'],
    objectives: [
      'ระบุ PEA — Organized rhythm แต่ไม่มีชีพจร',
      'ค้นหาและรักษา H&T (โดยเฉพาะ Hypovolemia)',
      'เน้น CPR และ Epinephrine — ไม่ใช่ Shock',
    ],
    discussionQuestions: [
      'Reversible causes ของ PEA คืออะไรบ้าง?',
      'ทำไมการ Shock ไม่ช่วย PEA?',
      'Hypovolemia ใน PEA — รักษาอย่างไร?',
    ],
  },

  {
    id: 'asystole-arrest',
    title: 'Asystole',
    titleEn: 'Asystole / Flat Line',
    topic: 'cardiac-arrest',
    difficulty: 'beginner',
    description: 'หญิง 70 ปี หัวใจหยุดเต้นนานแล้วที่บ้าน — พบใน ER',
    patientLabel: 'หญิง 70 ปี — Prolonged arrest',
    patientAge: 70,
    initialState: { ...arrestBase },
    initialRhythm: 'ASYSTOLE',
    algorithmId: 'cardiac-arrest',
    drugIds: ['epinephrine'],
    actionIds: ['check-responsiveness','call-team','check-pulse','start-cpr','apply-oxygen','iv-access','attach-monitor','rhythm-check','epinephrine','rosc'],
    objectives: [
      'ระบุ Asystole — ยืนยันใน 2 leads',
      'เน้น CPR คุณภาพสูง และ Epinephrine',
      'ไม่ Shock Asystole — อธิบายเหตุผล',
      'พิจารณา prognosis และ termination of resuscitation',
    ],
    discussionQuestions: [
      'ทำไม Asystole ไม่ควร Shock?',
      'จะยุติ CPR เมื่อไหร่?',
      'H&T ใดที่พบบ่อยใน elderly asystole?',
    ],
  },

  // ─── BRADYCARDIA ───────────────────────────────────────────────────────────

  {
    id: 'symptomatic-brady',
    title: 'Symptomatic Sinus Bradycardia',
    titleEn: 'Sinus Bradycardia with Symptoms',
    topic: 'bradycardia',
    difficulty: 'beginner',
    description: 'ชาย 65 ปี มึนงง ความดันต่ำ — HR 38 bpm',
    patientLabel: 'ชาย 65 ปี — มึนงง ชีพจรช้า',
    patientAge: 65,
    initialState: { ...bradyBase, heartRate: 38, bloodPressure: '80/50', spo2: 94 },
    initialRhythm: 'SINUS_BRADY',
    algorithmId: 'bradycardia',
    drugIds: ['atropine', 'dopamine'],
    actionIds: ['check-responsiveness','call-team','assess-symptoms-brady','attach-monitor-brady','iv-access','atropine','transcutaneous-pacing','dopamine-infusion'],
    objectives: [
      'ระบุ Symptomatic bradycardia',
      'ให้ Atropine ได้ถูกขนาดและเวลา',
      'เตรียม TCP เป็น backup',
    ],
    discussionQuestions: [
      'สาเหตุของ Sinus Bradycardia คืออะไรบ้าง?',
      'เมื่อไหร่ควรข้าม Atropine และเลือก TCP?',
    ],
  },

  {
    id: 'complete-heart-block',
    title: 'Complete Heart Block',
    titleEn: '3rd Degree AV Block',
    topic: 'bradycardia',
    difficulty: 'intermediate',
    description: 'หญิง 72 ปี หน้ามืด เกือบหมดสติ — ECG: 3rd degree AV block',
    patientLabel: 'หญิง 72 ปี — Syncope, CHB',
    patientAge: 72,
    initialState: { ...bradyBase, heartRate: 30, bloodPressure: '70/50', spo2: 92, consciousness: 'verbal' },
    initialRhythm: 'CHB',
    algorithmId: 'bradycardia',
    drugIds: ['atropine', 'dopamine'],
    actionIds: ['check-responsiveness','call-team','assess-symptoms-brady','attach-monitor-brady','iv-access','atropine','transcutaneous-pacing','dopamine-infusion'],
    objectives: [
      'ระบุ 3rd Degree AV Block',
      'ทราบว่า Atropine มักไม่ได้ผลใน CHB',
      'เลือก TCP ก่อน รอ Transvenous pacemaker',
    ],
    discussionQuestions: [
      'ทำไม Atropine ไม่ได้ผลใน CHB?',
      'Complete Heart Block ต้องการ pacemaker ชนิดใด?',
    ],
    actionOverrides: {
      'atropine': {
        findings: [
          'Atropine 0.5mg IV — ให้แล้ว',
          'HR ยังคง 30 bpm — ไม่ตอบสนอง',
          '→ CHB: Atropine มักไม่ได้ผล',
          'เตรียม TCP ทันที',
        ],
      },
    },
  },

  // ─── TACHYCARDIA ───────────────────────────────────────────────────────────

  {
    id: 'stable-svt',
    title: 'Stable SVT',
    titleEn: 'Stable Supraventricular Tachycardia',
    topic: 'tachycardia',
    difficulty: 'beginner',
    description: 'หญิง 38 ปี ใจสั่น — Narrow complex tachycardia, hemodynamically stable',
    patientLabel: 'หญิง 38 ปี — ใจสั่น, stable SVT',
    patientAge: 38,
    initialState: { ...tachyBase, heartRate: 185, bloodPressure: '110/70', spo2: 97 },
    initialRhythm: 'SVT',
    algorithmId: 'tachycardia-stable',
    drugIds: ['adenosine', 'amiodarone-tachy'],
    actionIds: ['call-team','assess-stability','attach-monitor-tachy','iv-access','vagal-maneuvers','adenosine','antiarrhythmic-tachy'],
    objectives: [
      'ระบุ Stable SVT',
      'ทำ Vagal maneuver ก่อน',
      'ให้ Adenosine ได้ถูกวิธี (rapid push)',
    ],
    discussionQuestions: [
      'Vagal maneuver ทำอย่างไรให้ได้ผลดีที่สุด?',
      'ทำไม Adenosine ต้อง push เร็วมากที่ large vein?',
    ],
  },

  {
    id: 'unstable-svt',
    title: 'Unstable SVT',
    titleEn: 'Unstable Supraventricular Tachycardia',
    topic: 'tachycardia',
    difficulty: 'intermediate',
    description: 'ชาย 55 ปี เจ็บหน้าอก ความดันต่ำ — SVT ที่ต้องการ Cardioversion',
    patientLabel: 'ชาย 55 ปี — Chest pain, BP ต่ำ',
    patientAge: 55,
    initialState: { ...tachyBase, heartRate: 195, bloodPressure: '80/50', spo2: 93, consciousness: 'verbal' },
    initialRhythm: 'SVT',
    algorithmId: 'tachycardia-stable',
    drugIds: ['adenosine'],
    actionIds: ['call-team','assess-stability','attach-monitor-tachy','synchronized-cardioversion'],
    objectives: [
      'ระบุ Unstable SVT ที่ต้องการ Cardioversion ทันที',
      'ทำ Synchronized Cardioversion ได้ถูกต้อง',
      'เลือก Energy ที่ถูกต้อง',
    ],
    discussionQuestions: [
      'Unstable signs ของ tachycardia คืออะไร?',
      'ทำไมต้อง Synchronize และทำอย่างไร?',
    ],
    actionOverrides: {
      'assess-stability': {
        findings: [
          'HR 195 bpm — Narrow complex regular',
          'BP: 80/50 mmHg — Hypotension',
          'ผู้ป่วยรู้สึกตัวแต่เจ็บหน้าอกมาก',
          '→ UNSTABLE — Synchronized Cardioversion ทันที',
          'เตรียม Sedation',
        ],
      },
    },
  },

  {
    id: 'af-rvr',
    title: 'AF with RVR',
    titleEn: 'Atrial Fibrillation with Rapid Ventricular Response',
    topic: 'tachycardia',
    difficulty: 'intermediate',
    description: 'ชาย 68 ปี หอบเหนื่อย — AF with RVR, ยังพอ stable',
    patientLabel: 'ชาย 68 ปี — AF, หอบเหนื่อย',
    patientAge: 68,
    initialState: { ...tachyBase, heartRate: 145, bloodPressure: '100/65', spo2: 94 },
    initialRhythm: 'AF_RVR',
    algorithmId: 'tachycardia-stable',
    drugIds: ['amiodarone-tachy'],
    actionIds: ['call-team','assess-stability','attach-monitor-tachy','iv-access','antiarrhythmic-tachy','synchronized-cardioversion'],
    objectives: [
      'ระบุ AF with RVR — Irregular narrow complex',
      'Rate control vs Rhythm control',
      'พิจารณา Cardioversion ใน unstable',
    ],
    discussionQuestions: [
      'Rate control vs Rhythm control — เลือกอะไรก่อน?',
      'AF onset < 48 ชั่วโมง vs > 48 ชั่วโมง — ต่างกันอย่างไร?',
    ],
    actionOverrides: {
      'assess-stability': {
        findings: [
          'HR 145 bpm — Irregular narrow complex',
          'BP: 100/65 mmHg — พอ stable แต่ต่ำ',
          'SpO₂: 94% — หอบเหนื่อย',
          '→ Stable AF with RVR — Rate control ก่อน',
        ],
      },
    },
  },
]

const LS_KEY = 'acls-custom-scenarios'

export function loadCustomScenarios(): ScenarioDefinition[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveCustomScenarios(scenarios: ScenarioDefinition[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(scenarios))
}

export function getAllScenarios(): ScenarioDefinition[] {
  return [...builtInScenarios, ...loadCustomScenarios()]
}

export function getScenariosByTopic(topic: string): ScenarioDefinition[] {
  return getAllScenarios().filter((s) => s.topic === topic)
}
