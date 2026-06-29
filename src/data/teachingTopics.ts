import { RhythmType } from '../types/rhythm'

export type TeachingTopicId = 'cardiac-arrest' | 'bradycardia' | 'tachycardia' | 'megacode'

export type TopicPatientProfile = {
  isUnresponsive: boolean
  hasPulse: boolean
  isBreathing: boolean
  label: string        // shown in patient scene
}

export type TeachingTopic = {
  id: TeachingTopicId
  title: string
  shortTitle: string
  description: string
  algorithmId: string
  rhythmOrder: RhythmType[]         // which rhythms show in Monitor panel
  defaultRhythm: RhythmType         // selected by default when topic starts
  drugIds: string[]
  scenarioActionIds: string[]
  htCauseIds: string[]
  patientProfile: TopicPatientProfile
  color: string
  comingSoon?: boolean
}

export const teachingTopics: TeachingTopic[] = [
  {
    id: 'cardiac-arrest',
    title: 'ACLS Cardiac Arrest',
    shortTitle: 'Cardiac Arrest',
    description: 'VF · pVT · PEA · Asystole — CPR, Defibrillation, Epinephrine',
    algorithmId: 'cardiac-arrest',
    rhythmOrder: ['VF', 'PVT', 'PEA', 'ASYSTOLE', 'SINUS'],
    defaultRhythm: 'VF',
    drugIds: ['epinephrine', 'amiodarone', 'lidocaine'],
    scenarioActionIds: [
      'check-responsiveness',
      'call-team',
      'check-pulse',
      'start-cpr',
      'apply-oxygen',
      'airway-opa',
      'airway-npa',
      'airway-sga',
      'airway-ett',
      'iv-access',
      'attach-monitor',
      'rhythm-check',
      'defibrillate',
      'epinephrine',
      'amiodarone',
      'rosc',
    ],
    htCauseIds: ['hypovolemia', 'hypoxia', 'acidosis', 'hyperkalemia', 'hypothermia', 'pneumothorax', 'tamponade', 'toxins', 'pe', 'mi'],
    patientProfile: {
      isUnresponsive: true,
      hasPulse: false,
      isBreathing: false,
      label: 'ผู้ป่วยไม่รู้สึกตัว ไม่มีชีพจร',
    },
    color: '#ef4444',
  },
  {
    id: 'bradycardia',
    title: 'Bradycardia with Pulse',
    shortTitle: 'Bradycardia',
    description: 'HR < 50/min — Atropine, TCP, Dopamine infusion',
    algorithmId: 'bradycardia',
    rhythmOrder: ['SINUS_BRADY', 'AV_BLOCK', 'CHB', 'SINUS'],
    defaultRhythm: 'SINUS_BRADY',
    drugIds: ['atropine', 'dopamine', 'epinephrine-infusion'],
    scenarioActionIds: [
      'check-responsiveness',
      'call-team',
      'check-pulse',
      'assess-symptoms-brady',
      'attach-monitor-brady',
      'attach-3lead',
      'rhythm-check',
      '12-lead-ecg',
      'capnography',
      'iv-access',
      'atropine',
      'transcutaneous-pacing',
      'dopamine-infusion',
    ],
    htCauseIds: ['hyperkalemia', 'hypothermia', 'toxins'],
    patientProfile: {
      isUnresponsive: false,
      hasPulse: true,
      isBreathing: true,
      label: 'ผู้ป่วยรู้สึกตัว ชีพจรช้า',
    },
    color: '#3b82f6',
  },
  {
    id: 'tachycardia',
    title: 'Tachycardia',
    shortTitle: 'Tachycardia',
    description: 'Stable vs Unstable — Cardioversion, Adenosine, Amiodarone',
    algorithmId: 'tachycardia-stable',
    rhythmOrder: ['SVT', 'AF_RVR', 'VT_PULSE', 'PVT'],
    defaultRhythm: 'SVT',
    drugIds: ['adenosine', 'amiodarone-tachy', 'procainamide', 'sotalol'],
    scenarioActionIds: [
      'check-responsiveness',
      'call-team',
      'check-pulse',
      'assess-stability',
      'attach-monitor-tachy',
      'attach-3lead',
      'rhythm-check',
      '12-lead-ecg',
      'capnography',
      'iv-access',
      'vagal-maneuvers',
      'synchronized-cardioversion',
      'adenosine',
      'antiarrhythmic-tachy',
    ],
    htCauseIds: ['hypoxia', 'acidosis', 'hyperkalemia', 'toxins'],
    patientProfile: {
      isUnresponsive: false,
      hasPulse: true,
      isBreathing: true,
      label: 'ผู้ป่วยรู้สึกตัว ชีพจรเร็ว',
    },
    color: '#8b5cf6',
  },
  {
    id: 'megacode',
    title: 'Megacode Scenario',
    shortTitle: 'Megacode',
    description: 'Integrated multi-rhythm scenario — coming soon',
    algorithmId: 'cardiac-arrest',
    rhythmOrder: ['VF', 'PVT', 'PEA', 'ASYSTOLE', 'SINUS'],
    defaultRhythm: 'VF',
    drugIds: ['epinephrine', 'amiodarone', 'lidocaine', 'atropine', 'adenosine'],
    scenarioActionIds: [],
    htCauseIds: ['hypovolemia', 'hypoxia', 'acidosis', 'hyperkalemia', 'hypothermia', 'pneumothorax', 'tamponade', 'toxins', 'pe', 'mi'],
    patientProfile: {
      isUnresponsive: true,
      hasPulse: false,
      isBreathing: false,
      label: 'Megacode — Coming Soon',
    },
    color: '#f97316',
    comingSoon: true,
  },
]

// Common base actions available in EVERY topic alongside topic-specific ones
export const commonBaseActionIds: string[] = [
  // Basic assessment
  'check-responsiveness',
  'call-team',
  'check-breathing',
  'check-pulse',
  // Communication
  'assign-roles',
  'closed-loop',
  // Airway
  'head-tilt',
  'jaw-thrust',
  // Oxygen delivery
  'oxygen-nasal',
  'oxygen-mask',
  'oxygen-nrbm',
  'apply-oxygen',    // BVM
  // Airway adjuncts
  'airway-opa',
  'airway-npa',
  'airway-sga',      // LMA / i-gel
  'airway-ett',      // ETT
  // Monitoring
  'attach-3lead',
  'rhythm-check',
  'capnography',
  // Vascular access & diagnostics
  'iv-access',
  'io-access',
  'blood-sampling',
  '12-lead-ecg',
  'abg',
  'chest-xray',
  'ultrasound',
]

export function getTopicById(id: TeachingTopicId): TeachingTopic {
  return teachingTopics.find((t) => t.id === id) ?? teachingTopics[0]
}
