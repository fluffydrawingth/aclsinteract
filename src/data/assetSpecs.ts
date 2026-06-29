// Recommended specifications for each scene asset slot.
// All pixel dimensions assume a 1920×1080 reference canvas.
// These are editor hints only — the runtime renders via saved % coordinates.

export type AssetSpec = {
  recommendedW: number    // pixels at 1920×1080
  recommendedH: number
  aspectLabel: string     // human-readable ratio e.g. "7:12"
  description: string     // one-line usage note
}

// Reference canvas used to convert px → %
export const CANVAS_REF_W = 1920
export const CANVAS_REF_H = 1080

/** Recommended slot width as % of canvas */
export function specW(spec: AssetSpec) {
  return (spec.recommendedW / CANVAS_REF_W) * 100
}

/** Recommended slot height as % of canvas */
export function specH(spec: AssetSpec) {
  return (spec.recommendedH / CANVAS_REF_H) * 100
}

export const ASSET_SPECS: Record<string, AssetSpec> = {
  'bg': {
    recommendedW: 1920,
    recommendedH: 1080,
    aspectLabel: '16:9',
    description: 'Full-screen scene background (room / hospital bay)',
  },
  'patient-base': {
    recommendedW: 420,
    recommendedH: 720,
    aspectLabel: '7:12',
    description: 'Patient lying on bed — portrait orientation, transparent PNG',
  },
  'first-responder': {
    recommendedW: 240,
    recommendedH: 340,
    aspectLabel: '12:17',
    description: 'BLS first responder — visible at scene open, transparent PNG',
  },
  'team-leader': {
    recommendedW: 240,
    recommendedH: 320,
    aspectLabel: '3:4',
    description: 'Team leader standing — transparent PNG',
  },
  'airway-provider': {
    recommendedW: 240,
    recommendedH: 340,
    aspectLabel: '12:17',
    description: 'Airway provider at head of bed — transparent PNG',
  },
  'compressor': {
    recommendedW: 260,
    recommendedH: 360,
    aspectLabel: '13:18',
    description: 'CPR compressor leaning over patient — transparent PNG',
  },
  'monitor-operator': {
    recommendedW: 240,
    recommendedH: 340,
    aspectLabel: '12:17',
    description: 'Monitor/defibrillator operator — transparent PNG',
  },
  'iv-provider': {
    recommendedW: 240,
    recommendedH: 340,
    aspectLabel: '12:17',
    description: 'IV/medications provider — transparent PNG',
  },
  'compressor-2': {
    recommendedW: 260,
    recommendedH: 360,
    aspectLabel: '13:18',
    description: 'Compressor 2 (lower left, waiting to rotate in) — transparent PNG',
  },
  'recorder': {
    recommendedW: 220,
    recommendedH: 300,
    aspectLabel: '11:15',
    description: 'Recorder/timekeeper with clipboard — bottom right — transparent PNG',
  },
  'hand-shoulder': {
    recommendedW: 150,
    recommendedH: 150,
    aspectLabel: '1:1',
    description: 'Hand on shoulder — assessment overlay, transparent PNG',
  },
  'hand-carotid': {
    recommendedW: 120,
    recommendedH: 120,
    aspectLabel: '1:1',
    description: 'Hand on carotid / pulse check overlay — transparent PNG',
  },
  'cpr-hands': {
    recommendedW: 180,
    recommendedH: 180,
    aspectLabel: '1:1',
    description: 'CPR compression hands on chest — transparent PNG',
  },
  'oxygen-nasal': {
    recommendedW: 170,
    recommendedH: 170,
    aspectLabel: '1:1',
    description: 'Nasal cannula applied to patient face — transparent PNG',
  },
  'oxygen-mask': {
    recommendedW: 170,
    recommendedH: 170,
    aspectLabel: '1:1',
    description: 'Simple face mask applied — transparent PNG',
  },
  'oxygen-nrbm': {
    recommendedW: 170,
    recommendedH: 170,
    aspectLabel: '1:1',
    description: 'Non-rebreather mask applied — transparent PNG',
  },
  'airway-bvm': {
    recommendedW: 220,
    recommendedH: 220,
    aspectLabel: '1:1',
    description: 'BVM mask held over patient face — transparent PNG',
  },
  'airway-ett': {
    recommendedW: 230,
    recommendedH: 230,
    aspectLabel: '1:1',
    description: 'ET tube secured in patient airway — transparent PNG',
  },
  'airway-lma': {
    recommendedW: 220,
    recommendedH: 220,
    aspectLabel: '1:1',
    description: 'LMA / i-gel supraglottic device — transparent PNG',
  },
  'monitor-machine': {
    recommendedW: 260,
    recommendedH: 320,
    aspectLabel: '13:16',
    description: 'Cardiac monitor / defibrillator machine — transparent PNG',
  },
  'defib-pads': {
    recommendedW: 170,
    recommendedH: 170,
    aspectLabel: '1:1',
    description: 'Defibrillator pads placed on chest — transparent PNG',
  },
  'ecg-leads': {
    recommendedW: 200,
    recommendedH: 180,
    aspectLabel: '10:9',
    description: 'ECG lead wires on patient — transparent PNG',
  },
  'lead-3': {
    recommendedW: 180,
    recommendedH: 160,
    aspectLabel: '9:8',
    description: '3-lead monitor electrodes on patient chest — transparent PNG',
  },
  'iv-pole': {
    recommendedW: 180,
    recommendedH: 420,
    aspectLabel: '3:7',
    description: 'IV pole with bag — tall portrait, transparent PNG',
  },
  'io-needle': {
    recommendedW: 120,
    recommendedH: 220,
    aspectLabel: '6:11',
    description: 'IO needle in tibia — close-up overlay, transparent PNG',
  },
  'blood-tube': {
    recommendedW: 120,
    recommendedH: 220,
    aspectLabel: '6:11',
    description: 'Blood sampling tube / syringe — transparent PNG',
  },
  'shock-flash': {
    recommendedW: 1920,
    recommendedH: 1080,
    aspectLabel: '16:9',
    description: 'Full-screen shock/flash effect (PNG or semi-transparent overlay)',
  },
  'rosc-overlay': {
    recommendedW: 600,
    recommendedH: 300,
    aspectLabel: '2:1',
    description: 'ROSC banner overlay — transparent PNG or high-contrast graphic',
  },
}
