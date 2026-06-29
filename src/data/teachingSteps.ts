export interface TeachingStep {
  id: number
  label: string
  title: string
  description: string
  notes: string
  discussionPrompt: string
  patientState: {
    conscious: boolean
    breathing: boolean
    pulse: boolean
    cprActive: boolean
    monitorAttached: boolean
    oxygenApplied: boolean
    ivAccess: boolean
    rhythmVisible: boolean
    rhythm?: 'VF' | 'PVT' | 'ASYSTOLE' | 'PEA' | 'ROSC' | null
    position: 'bed' | 'floor'
  }
  actions: string[]
}

export const teachingSteps: TeachingStep[] = [
  {
    id: 0,
    label: 'Patient Found',
    title: 'Scene Safety & Initial Assessment',
    description: 'You find a patient unresponsive on the hospital bed.',
    notes: 'Ensure scene safety before approaching. This is the critical first moment — pause and observe.',
    discussionPrompt: 'Ask learners: What is your first action when you find an unresponsive patient?',
    patientState: {
      conscious: false,
      breathing: false,
      pulse: false,
      cprActive: false,
      monitorAttached: false,
      oxygenApplied: false,
      ivAccess: false,
      rhythmVisible: false,
      rhythm: null,
      position: 'bed',
    },
    actions: ['Check Responsiveness'],
  },
  {
    id: 1,
    label: 'Responsiveness',
    title: 'Check Responsiveness',
    description: 'Tap shoulders and shout "Are you OK?" — No response.',
    notes: 'Demonstrate proper technique: tap both shoulders firmly, shout loudly. No sternal rub in adults.',
    discussionPrompt: 'Ask learners: The patient does not respond. What do you do next?',
    patientState: {
      conscious: false,
      breathing: false,
      pulse: false,
      cprActive: false,
      monitorAttached: false,
      oxygenApplied: false,
      ivAccess: false,
      rhythmVisible: false,
      rhythm: null,
      position: 'bed',
    },
    actions: ['Activate Emergency Response'],
  },
  {
    id: 2,
    label: 'Call Help',
    title: 'Activate Emergency Response',
    description: 'Call for help! Activate the code team. Assign roles immediately.',
    notes: 'Emphasize concurrent actions: one person calls code, one gets crash cart, one stays with patient. Point to specific learners.',
    discussionPrompt: 'Ask learners: How do you prevent role confusion during a cardiac arrest? Who does what?',
    patientState: {
      conscious: false,
      breathing: false,
      pulse: false,
      cprActive: false,
      monitorAttached: false,
      oxygenApplied: false,
      ivAccess: false,
      rhythmVisible: false,
      rhythm: null,
      position: 'bed',
    },
    actions: ['Check Pulse & Breathing'],
  },
  {
    id: 3,
    label: 'Pulse Check',
    title: 'Check Breathing & Pulse',
    description: 'Simultaneously check carotid pulse and look for breathing — take no more than 10 seconds.',
    notes: 'No pulse, no breathing. The 10-second limit is critical. Over-checking delays CPR and worsens outcomes.',
    discussionPrompt: 'Ask learners: You cannot feel a pulse. What is the next immediate action?',
    patientState: {
      conscious: false,
      breathing: false,
      pulse: false,
      cprActive: false,
      monitorAttached: false,
      oxygenApplied: false,
      ivAccess: false,
      rhythmVisible: false,
      rhythm: null,
      position: 'bed',
    },
    actions: ['Start CPR'],
  },
  {
    id: 4,
    label: 'CPR',
    title: 'Start High-Quality CPR',
    description: 'Begin chest compressions immediately. Rate 100–120/min, depth 2–2.4 inches, full chest recoil.',
    notes: 'Emphasize high-quality CPR: rate, depth, full recoil, minimize interruptions. Switch compressors every 2 minutes to prevent fatigue.',
    discussionPrompt: 'Ask learners: What are the components of high-quality CPR? What is the compression-to-ventilation ratio?',
    patientState: {
      conscious: false,
      breathing: false,
      pulse: false,
      cprActive: true,
      monitorAttached: false,
      oxygenApplied: true,
      ivAccess: false,
      rhythmVisible: false,
      rhythm: null,
      position: 'bed',
    },
    actions: ['Attach Monitor'],
  },
  {
    id: 5,
    label: 'Monitor',
    title: 'Attach Monitor / Defibrillator',
    description: 'Attach the defibrillator pads while CPR continues. Do not stop compressions to attach.',
    notes: 'Pads go while CPR is ongoing. Placement: right infraclavicular, left lateral chest wall (V5–V6 position).',
    discussionPrompt: 'Ask learners: Where do you place the defibrillator pads? Can CPR continue during pad placement?',
    patientState: {
      conscious: false,
      breathing: false,
      pulse: false,
      cprActive: true,
      monitorAttached: true,
      oxygenApplied: true,
      ivAccess: true,
      rhythmVisible: false,
      rhythm: null,
      position: 'bed',
    },
    actions: ['Analyze Rhythm'],
  },
  {
    id: 6,
    label: 'Rhythm',
    title: 'Analyze Rhythm',
    description: 'Pause CPR briefly. Analyze rhythm — Ventricular Fibrillation (VF) detected.',
    notes: 'Minimize hands-off time. If shockable rhythm: charge while doing CPR, shock, resume CPR immediately. Do not wait for rhythm re-check before restarting.',
    discussionPrompt: 'Ask learners: The rhythm is VF — what is this rhythm? Is it shockable? What is your next action?',
    patientState: {
      conscious: false,
      breathing: false,
      pulse: false,
      cprActive: false,
      monitorAttached: true,
      oxygenApplied: true,
      ivAccess: true,
      rhythmVisible: true,
      rhythm: 'VF',
      position: 'bed',
    },
    actions: ['Continue to Algorithm'],
  },
]
