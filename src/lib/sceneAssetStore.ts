import { SceneAsset, ActionAssetMapping } from '../types/sceneAsset'
import { getImage, setImage, deleteImage } from './imageStore'

// Storage key — do NOT bump this to avoid wiping user-saved positions.
// New default assets are merged in automatically by loadSceneAssets().
const ASSETS_KEY  = 'acls-scene-assets-v4'
const MAPPING_KEY = 'acls-action-asset-map-v6'

// ─────────────────────────────────────────────────────────────────────────────
// Default layout — top-down bird's-eye view of ACLS resuscitation bay
//
// Canvas is 16:9 (landscape). Patient lies VERTICALLY (head-top, feet-bottom)
// and is the visual centre. Team arranged around the bed as in real resus.
//
// Coordinate system: x/y/w/h are % of canvas width/height.
// Reference canvas: 1920 × 1080 px.
//
//  ┌──────────────────────────────────────────────────────────────┐
//  │  [MON/DEFIB]  [MON-OPER]         [IV POLE] [VITAL MON]     │
//  │                  [AIRWAY PROVIDER]                           │
//  │  [COMPRESSOR 1]  ┌─────────────┐  [IV/MEDS PROVIDER]       │
//  │                  │             │                             │
//  │                  │  PATIENT    │                             │
//  │                  │  ON BED     │                             │
//  │                  │             │                             │
//  │  [COMPRESSOR 2]  └─────────────┘  [RECORDER]               │
//  │                  [TEAM LEADER]                               │
//  └──────────────────────────────────────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_SCENE_ASSETS: SceneAsset[] = [

  // ── Scene background ──────────────────────────────────────────────────────
  {
    id: 'bg', name: 'Background (Resus Bay)', category: 'patient',
    x: 0, y: 0, w: 100, h: 100,
    rotation: 0, opacity: 1, zIndex: 0, defaultVisible: true,
  },

  // ── Patient on bed — PORTRAIT, centre of canvas ───────────────────────────
  // Roughly 30% canvas-width × 74% canvas-height → portrait at 1920×1080
  {
    id: 'patient-base', name: 'Patient (on bed)', category: 'patient',
    x: 35, y: 4, w: 30, h: 76,
    rotation: 0, opacity: 1, zIndex: 5, defaultVisible: true,
  },

  // ── BLS FIRST RESPONDER — visible from scene open ────────────────────────
  // The person who first finds the patient. Stays visible throughout.
  // Positioned left-centre beside the patient (approaching from the side).
  {
    id: 'first-responder', name: 'BLS First Responder', category: 'team',
    x: 10, y: 28, w: 22, h: 30,
    rotation: 0, opacity: 1, zIndex: 10, defaultVisible: true,
  },

  // ── TEAM MEMBERS — 6-Person High-Performance Team layout ─────────────────
  //
  //  Top-down view, patient head at top, feet at bottom.
  //  Reference: ACLS Certification Association 6-Person HPT diagram
  //
  //  ┌────────────────────────────────────────────────────────────────┐
  //  │              [AIRWAY PROVIDER]  ← head of bed                 │
  //  │   [COMPRESS 1]  ┌──────────┐  [MONITOR OPERATOR]             │
  //  │                 │ PATIENT  │       (AED/Defib operator)       │
  //  │   [COMPRESS 2]  └──────────┘  [IV/IO/MEDS]                   │
  //  │              [TEAM LEADER]    [RECORDER]                      │
  //  └────────────────────────────────────────────────────────────────┘

  // HEAD OF BED — Airway Provider (manages airway at patient's head)
  {
    id: 'airway-provider', name: 'Airway Provider', category: 'team',
    x: 34, y: 0, w: 32, h: 15,
    rotation: 0, opacity: 1, zIndex: 10, defaultVisible: false,
  },

  // RIGHT SIDE UPPER — Monitor/Defib Operator (AED operator, right side of chest)
  // Ref: orange circle on RIGHT side of patient in the diagram
  {
    id: 'monitor-operator', name: 'Monitor Operator', category: 'team',
    x: 67, y: 22, w: 20, h: 28,
    rotation: 0, opacity: 1, zIndex: 10, defaultVisible: false,
  },

  // LEFT SIDE — Compressor 1 (performing chest compressions, left of patient)
  {
    id: 'compressor', name: 'Compressor 1', category: 'team',
    x: 10, y: 24, w: 24, h: 30,
    rotation: 0, opacity: 1, zIndex: 10, defaultVisible: false,
  },

  // LEFT SIDE LOWER — Compressor 2 (ready to rotate, below Compressor 1)
  {
    id: 'compressor-2', name: 'Compressor 2', category: 'team',
    x: 2, y: 58, w: 22, h: 28,
    rotation: 0, opacity: 1, zIndex: 10, defaultVisible: false,
  },

  // RIGHT SIDE LOWER — IV / Meds Provider (below monitor operator)
  // Ref: tan/brown circle on right side lower in the diagram
  {
    id: 'iv-provider', name: 'IV / Meds Provider', category: 'team',
    x: 67, y: 54, w: 20, h: 28,
    rotation: 0, opacity: 1, zIndex: 10, defaultVisible: false,
  },

  // BOTTOM RIGHT — Recorder / Historian (timer & event recorder)
  {
    id: 'recorder', name: 'Recorder', category: 'team',
    x: 70, y: 82, w: 22, h: 16,
    rotation: 0, opacity: 1, zIndex: 10, defaultVisible: false,
  },

  // BOTTOM CENTRE — Team Leader (foot of bed, directing the whole team)
  {
    id: 'team-leader', name: 'Team Leader', category: 'team',
    x: 33, y: 84, w: 34, h: 14,
    rotation: 0, opacity: 1, zIndex: 10, defaultVisible: false,
  },

  // ── ASSESSMENT OVERLAYS — placed ON the patient ───────────────────────────

  // Hand on shoulder (check responsiveness) — upper chest / shoulder zone
  {
    id: 'hand-shoulder', name: 'Shoulder Assessment', category: 'assessment',
    x: 37, y: 8, w: 14, h: 8,
    rotation: 0, opacity: 1, zIndex: 20, defaultVisible: false,
  },

  // Hand at carotid (pulse check) — neck zone
  {
    id: 'hand-carotid', name: 'Carotid / Pulse Check', category: 'assessment',
    x: 41, y: 11, w: 10, h: 7,
    rotation: 0, opacity: 1, zIndex: 20, defaultVisible: false,
  },

  // ── TREATMENT / AIRWAY — placed ON the patient ───────────────────────────

  // CPR hands — on sternum, upper-mid chest
  {
    id: 'cpr-hands', name: 'CPR Compression Hands', category: 'treatment',
    x: 40, y: 28, w: 20, h: 14,
    rotation: 0, opacity: 1, zIndex: 20, defaultVisible: false,
  },

  // Nasal cannula — face/nose area (top of patient)
  {
    id: 'oxygen-nasal', name: 'Nasal Cannula', category: 'treatment',
    x: 42, y: 5, w: 14, h: 8,
    rotation: 0, opacity: 1, zIndex: 25, defaultVisible: false,
  },

  // Simple face mask
  {
    id: 'oxygen-mask', name: 'Face Mask', category: 'treatment',
    x: 41, y: 5, w: 16, h: 10,
    rotation: 0, opacity: 1, zIndex: 25, defaultVisible: false,
  },

  // Non-rebreather mask
  {
    id: 'oxygen-nrbm', name: 'Non-Rebreather Mask', category: 'treatment',
    x: 41, y: 5, w: 16, h: 10,
    rotation: 0, opacity: 1, zIndex: 25, defaultVisible: false,
  },

  // BVM (held by airway provider at patient's head)
  {
    id: 'airway-bvm', name: 'BVM Mask', category: 'treatment',
    x: 40, y: 4, w: 20, h: 14,
    rotation: 0, opacity: 1, zIndex: 25, defaultVisible: false,
  },

  // ET tube (in patient mouth/airway)
  {
    id: 'airway-ett', name: 'ET Tube (ETT)', category: 'treatment',
    x: 42, y: 7, w: 14, h: 9,
    rotation: 0, opacity: 1, zIndex: 25, defaultVisible: false,
  },

  // LMA / i-gel
  {
    id: 'airway-lma', name: 'LMA / i-gel', category: 'treatment',
    x: 42, y: 7, w: 14, h: 9,
    rotation: 0, opacity: 1, zIndex: 25, defaultVisible: false,
  },

  // ── EQUIPMENT ─────────────────────────────────────────────────────────────

  // Monitor / Defibrillator machine — RIGHT side near monitor operator
  {
    id: 'monitor-machine', name: 'Monitor / Defibrillator', category: 'equipment',
    x: 80, y: 18, w: 14, h: 20,
    rotation: 0, opacity: 1, zIndex: 8, defaultVisible: false,
  },

  // Defibrillator pads — on patient chest (anterior + lateral positions)
  {
    id: 'defib-pads', name: 'Defibrillator Pads', category: 'equipment',
    x: 37, y: 22, w: 26, h: 16,
    rotation: 0, opacity: 1, zIndex: 18, defaultVisible: false,
  },

  // 12-Lead ECG leads — across patient torso
  {
    id: 'ecg-leads', name: '12-Lead ECG Leads', category: 'equipment',
    x: 35, y: 22, w: 30, h: 28,
    rotation: 0, opacity: 1, zIndex: 15, defaultVisible: false,
  },

  // 3-Lead monitor leads — on patient chest
  {
    id: 'lead-3', name: '3-Lead Monitor', category: 'equipment',
    x: 36, y: 23, w: 26, h: 22,
    rotation: 0, opacity: 1, zIndex: 14, defaultVisible: false,
  },

  // IV Pole — TOP RIGHT (tall vertical element)
  {
    id: 'iv-pole', name: 'IV Pole', category: 'equipment',
    x: 74, y: 1, w: 6, h: 42,
    rotation: 0, opacity: 1, zIndex: 8, defaultVisible: false,
  },

  // IO needle — patient lower leg (tibia, left side)
  {
    id: 'io-needle', name: 'IO Needle', category: 'equipment',
    x: 42, y: 66, w: 16, h: 10,
    rotation: 0, opacity: 1, zIndex: 18, defaultVisible: false,
  },

  // Blood tube — patient right arm (patient's right = scene right)
  {
    id: 'blood-tube', name: 'Blood Sampling Tube', category: 'equipment',
    x: 61, y: 35, w: 8, h: 12,
    rotation: 0, opacity: 1, zIndex: 18, defaultVisible: false,
  },

  // ── EFFECTS ───────────────────────────────────────────────────────────────

  // Defibrillation flash — full-screen brief overlay
  {
    id: 'shock-flash', name: 'Shock Effect', category: 'effects',
    x: 0, y: 0, w: 100, h: 100,
    rotation: 0, opacity: 0.85, zIndex: 30, defaultVisible: false,
  },

  // ROSC banner — centre of scene
  {
    id: 'rosc-overlay', name: 'ROSC State', category: 'effects',
    x: 22, y: 36, w: 56, h: 26,
    rotation: 0, opacity: 1, zIndex: 28, defaultVisible: false,
  },
]

// ─── Default action → asset mapping ─────────────────────────────────────────

const AIRWAY_ALL = ['oxygen-nasal', 'oxygen-mask', 'oxygen-nrbm', 'airway-bvm', 'airway-ett', 'airway-lma']

// DESIGN: Team members are NEVER auto-shown by actions — instructor adds them
// manually via the Scene panel. Only transient overlays and equipment appear
// automatically so the scene feels clinically accurate without forcing a full team.

export const DEFAULT_ACTION_MAPPING: ActionAssetMapping = {
  // Assessment overlays — shoulder/carotid brief (10 s), first-responder stays
  'check-responsiveness':  { show: [{ id: 'hand-shoulder' }, { id: 'first-responder' }], hide: ['hand-carotid'] },
  'check-breathing':       { show: [{ id: 'hand-carotid'  }], hide: ['hand-shoulder'] },
  'check-pulse':           { show: [{ id: 'hand-carotid'  }], hide: ['hand-shoulder'] },

  // call-team → no team assets auto-shown; instructor adds via Scene panel
  // The "call for help" announcement callout is driven by patientState.teamCalled
  'call-team': { show: [], hide: [] },

  // CPR — show compression assets; rhythm-check pauses CPR and shows carotid check
  'start-cpr':    { show: [{ id: 'cpr-hands' }, { id: 'compressor' }], hide: ['hand-shoulder', 'hand-carotid'] },
  'rhythm-check': { show: [{ id: 'hand-carotid' }], hide: ['cpr-hands', 'compressor'] },

  // Airway — mutually exclusive
  'oxygen-nasal':  { show: [{ id: 'oxygen-nasal' }], hide: AIRWAY_ALL.filter(x => x !== 'oxygen-nasal') },
  'oxygen-mask':   { show: [{ id: 'oxygen-mask'  }], hide: AIRWAY_ALL.filter(x => x !== 'oxygen-mask') },
  'oxygen-nrbm':   { show: [{ id: 'oxygen-nrbm'  }], hide: AIRWAY_ALL.filter(x => x !== 'oxygen-nrbm') },
  'apply-oxygen':  { show: [{ id: 'airway-bvm'   }], hide: AIRWAY_ALL.filter(x => x !== 'airway-bvm') },
  'airway-opa':    { show: [{ id: 'airway-bvm'   }], hide: [] },
  'airway-npa':    { show: [{ id: 'airway-bvm'   }], hide: [] },
  'airway-sga':    { show: [{ id: 'airway-lma'   }], hide: AIRWAY_ALL.filter(x => x !== 'airway-lma') },
  'airway-ett':    { show: [{ id: 'airway-ett'   }], hide: AIRWAY_ALL.filter(x => x !== 'airway-ett') },

  // Equipment — physical items placed on/near the patient
  'iv-access':            { show: [{ id: 'iv-pole',    duration: 5000 }], hide: [] },
  'io-access':            { show: [{ id: 'io-needle'                 }], hide: [] },
  'blood-sampling':       { show: [{ id: 'blood-tube', duration: 5000 }], hide: [] },
  '12-lead-ecg':          { show: [{ id: 'monitor-machine' }, { id: 'ecg-leads'  }], hide: [] },
  'attach-monitor':       { show: [{ id: 'monitor-machine' }, { id: 'defib-pads' }, { id: 'ecg-leads' }], hide: [] },
  'attach-monitor-brady': { show: [{ id: 'monitor-machine' }, { id: 'ecg-leads'  }], hide: [] },
  'attach-monitor-tachy': { show: [{ id: 'monitor-machine' }, { id: 'ecg-leads'  }], hide: [] },
  'attach-3lead':         { show: [{ id: 'monitor-machine' }, { id: 'lead-3'     }], hide: [] },

  // IV medications — IV pole flashes for 5 s to cue the nurse's action
  'epinephrine':        { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'amiodarone':         { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'amiodarone-150':     { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'lidocaine':          { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'atropine':           { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'dopamine-infusion':  { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'adenosine':          { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'antiarrhythmic-tachy': { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'sodium-bicarbonate': { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'calcium-gluconate':  { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'magnesium-sulfate':  { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'fluid-bolus':        { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },
  'warm-fluids':        { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] },

  // Effects
  'defibrillate':               { show: [{ id: 'shock-flash', duration: 1500 }], hide: [] },
  'synchronized-cardioversion': { show: [{ id: 'shock-flash', duration: 1500 }], hide: [] },
  'rosc':         { show: [{ id: 'rosc-overlay' }], hide: ['cpr-hands', 'shock-flash'] },
}

// ─── Image key helpers ────────────────────────────────────────────────────────

const assetImgKey = (id: string) => `scene-asset::${id}`

// ─── Load / Save ─────────────────────────────────────────────────────────────

// Metadata stored in localStorage — everything except the raw image bytes.
// storageUrl is included here so cross-device loads pick up the Supabase URL.
type AssetMeta = Omit<SceneAsset, 'imageDataUrl'>

export function loadSceneAssets(): SceneAsset[] {
  let meta: AssetMeta[]

  try {
    const stored = localStorage.getItem(ASSETS_KEY)
    if (stored) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta = (JSON.parse(stored) as any[]).map(({ imageDataUrl: _, ...rest }) => rest as AssetMeta)
    } else {
      meta = DEFAULT_SCENE_ASSETS.map(({ imageDataUrl: _, ...rest }) => rest)
    }
  } catch {
    meta = DEFAULT_SCENE_ASSETS.map(({ imageDataUrl: _, ...rest }) => rest)
  }

  // Merge: add any new default slots missing from stored metadata
  const storedIds = new Set(meta.map(a => a.id))
  const missing: AssetMeta[] = DEFAULT_SCENE_ASSETS
    .filter(d => !storedIds.has(d.id))
    .map(({ imageDataUrl: _, ...rest }) => rest)

  // Re-attach local images from IndexedDB cache (only used when no storageUrl)
  return [...meta, ...missing].map(a => ({
    ...a,
    imageDataUrl: a.storageUrl ? undefined : getImage(assetImgKey(a.id)),
  }))
}

export function saveSceneAssets(assets: SceneAsset[]): void {
  // Save metadata (including storageUrl, excluding raw base64) to localStorage
  const meta: AssetMeta[] = assets.map(({ imageDataUrl: _, ...rest }) => rest)
  try {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(meta))
  } catch {
    console.error('[SceneAssets] Failed to save metadata.')
  }

  // Save local base64 to IndexedDB only when there is no cloud URL
  for (const asset of assets) {
    if (asset.storageUrl) {
      // Cloud-backed — remove any stale local copy
      deleteImage(assetImgKey(asset.id))
    } else if (asset.imageDataUrl) {
      setImage(assetImgKey(asset.id), asset.imageDataUrl)
    } else {
      deleteImage(assetImgKey(asset.id))
    }
  }
}

export function loadActionAssetMap(): ActionAssetMapping {
  try {
    const stored = localStorage.getItem(MAPPING_KEY)
    if (stored) {
      // Merge: defaults supply base rules, stored custom entries override per-action.
      // This ensures default hide/show rules (e.g. start-cpr hides hand-carotid) remain
      // active even when the user has only customised some actions in admin.
      return { ...DEFAULT_ACTION_MAPPING, ...(JSON.parse(stored) as ActionAssetMapping) }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_ACTION_MAPPING }
}

export function saveActionAssetMap(map: ActionAssetMapping): void {
  localStorage.setItem(MAPPING_KEY, JSON.stringify(map))
}
