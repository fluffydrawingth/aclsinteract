export type Consciousness = 'alert' | 'verbal' | 'pain' | 'unresponsive'
export type AirwayDevice = 'none' | 'nasal' | 'mask' | 'nrbm' | 'bvm' | 'lma' | 'ett'

export type PatientState = {
  // Consciousness
  consciousness: Consciousness
  isUnresponsive: boolean

  // Breathing
  isBreathing: boolean

  // Circulation
  hasPulse: boolean
  heartRate: number | null
  bloodPressure: string | null
  spo2: number | null

  // Airway & Oxygen
  oxygenApplied: boolean
  airwayDevice: AirwayDevice

  // IV access
  ivAccess: boolean

  // Monitor
  monitorAttached: boolean
  defibPadsAttached: boolean
  rhythmVisible: boolean

  // Team
  teamCalled: boolean

  // CPR
  cprActive: boolean

  // Outcome
  shockDelivered: boolean
  shockCount: number
  rosc: boolean
}

export type ActionCategory = 'assessment' | 'resuscitation' | 'device' | 'medication' | 'procedure' | 'outcome'

export type ScenarioAction = {
  id: string
  label: string
  labelEn: string
  category: ActionCategory
  icon: string
  /** Clinical findings shown when action is performed */
  findings: string[]
  /** State changes applied when action is performed */
  stateEffect?: Partial<PatientState>
  /** Algorithm node to highlight */
  algoNodeId?: string
  notesThai: {
    title: string
    keyPoints: string[]
    discussionQuestion: string
  }
}

export type TimelineEvent = {
  id: string
  label: string
  labelEn: string
  actionId: string
  icon: string
  timestamp: number
  findings: string[]
}

export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type ActionOverride = {
  findings?: string[]
  stateEffect?: Partial<PatientState>
  rhythmChange?: string
  feedbackMessage?: string
}

export type ScenarioDefinition = {
  id: string
  title: string
  titleEn: string
  topic: string
  difficulty: ScenarioDifficulty
  description: string
  patientLabel: string
  patientAge?: number

  initialState: PatientState
  initialRhythm: string
  algorithmId: string
  drugIds: string[]
  actionIds: string[]

  objectives: string[]
  discussionQuestions: string[]

  actionOverrides?: Record<string, ActionOverride>
}

export const defaultPatientState: PatientState = {
  consciousness: 'alert',
  isUnresponsive: false,
  isBreathing: true,
  hasPulse: true,
  heartRate: 80,
  bloodPressure: '120/80',
  spo2: 98,
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
