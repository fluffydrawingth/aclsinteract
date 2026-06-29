const STORAGE_KEY = 'acls-scenario-assets'

export type AssetId =
  | 'bg'
  | 'patient-base'
  | 'hand-shoulder'
  | 'hand-carotid'
  | 'team-leader'
  | 'compressor-1'
  | 'compressor-2'
  | 'airway-provider'
  | 'monitor-operator'
  | 'iv-provider'
  | 'recorder'
  | 'cpr-hands'
  | 'airway-mask'
  | 'airway-bvm'
  | 'airway-opa'
  | 'airway-npa'
  | 'airway-ett'
  | 'monitor-machine'
  | 'defib-pads'
  | 'iv-setup'
  | 'shock-flash'
  | 'rosc-state'

export const ASSET_LABELS: Record<AssetId, string> = {
  'bg':               'Background / Room',
  'patient-base':     'Patient (base)',
  'hand-shoulder':    'Hand — Shoulder Stimulation',
  'hand-carotid':     'Hand — Carotid Pulse Check',
  'team-leader':      'Team Leader',
  'compressor-1':     'Compressor 1',
  'compressor-2':     'Compressor 2',
  'airway-provider':  'Airway Provider',
  'monitor-operator': 'Monitor / Defib Operator',
  'iv-provider':      'IV / Medication Provider',
  'recorder':         'Recorder',
  'cpr-hands':        'CPR Hands',
  'airway-mask':      'Oxygen Mask',
  'airway-bvm':       'BVM Mask',
  'airway-opa':       'OPA',
  'airway-npa':       'NPA',
  'airway-ett':       'ET Tube',
  'monitor-machine':  'Monitor / Defibrillator Machine',
  'defib-pads':       'Defib Pads',
  'iv-setup':         'IV Pole + Bag + Line',
  'shock-flash':      'Shock Flash Effect',
  'rosc-state':       'ROSC State',
}

export const ASSET_GROUPS: { label: string; ids: AssetId[] }[] = [
  { label: 'Base Scene', ids: ['bg', 'patient-base'] },
  { label: 'Assessment Overlays', ids: ['hand-shoulder', 'hand-carotid'] },
  { label: 'Team Members', ids: ['team-leader', 'compressor-1', 'compressor-2', 'airway-provider', 'monitor-operator', 'iv-provider', 'recorder'] },
  { label: 'Treatment Overlays', ids: ['cpr-hands', 'airway-mask', 'airway-bvm', 'airway-opa', 'airway-npa', 'airway-ett', 'monitor-machine', 'defib-pads', 'iv-setup', 'shock-flash', 'rosc-state'] },
]

export type ScenarioAsset = {
  imageDataUrl: string
}

export type ScenarioAssetMap = Partial<Record<AssetId, ScenarioAsset>>

export function loadScenarioAssets(): ScenarioAssetMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveScenarioAsset(id: AssetId, imageDataUrl: string): void {
  const map = loadScenarioAssets()
  map[id] = { imageDataUrl }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function removeScenarioAsset(id: AssetId): void {
  const map = loadScenarioAssets()
  delete map[id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}
