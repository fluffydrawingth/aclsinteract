import { SceneAsset } from '../../types/sceneAsset'

interface Props {
  assets: SceneAsset[]
  visibleIds: Set<string>
  onToggle: (id: string) => void
  onReset: () => void
  onClear: () => void
}

// ── Group definitions ─────────────────────────────────────────────────────────

const TEAM_IDS = [
  { id: 'first-responder',  label: 'BLS Resp',   icon: '🧑‍⚕️' },
  { id: 'airway-provider',  label: 'Airway',     icon: '🫁' },
  { id: 'compressor',       label: 'Compress 1', icon: '🤜' },
  { id: 'compressor-2',     label: 'Compress 2', icon: '🤜' },
  { id: 'monitor-operator', label: 'Monitor Op', icon: '📟' },
  { id: 'iv-provider',      label: 'IV/Meds',    icon: '💉' },
  { id: 'team-leader',      label: 'Leader',     icon: '👤' },
  { id: 'recorder',         label: 'Recorder',   icon: '📋' },
]

const EQUIPMENT_IDS = [
  { id: 'monitor-machine', label: 'Monitor',   icon: '🖥' },
  { id: 'defib-pads',      label: 'Defib Pads',icon: '⚡' },
  { id: 'ecg-leads',       label: 'ECG Leads', icon: '🔌' },
  { id: 'iv-pole',         label: 'IV Pole',   icon: '🧪' },
  { id: 'io-needle',       label: 'IO Needle', icon: '🪡' },
  { id: 'blood-tube',      label: 'Blood',     icon: '🩸' },
]

const AIRWAY_IDS = [
  { id: 'airway-bvm',   label: 'BVM',   icon: '😷' },
  { id: 'airway-ett',   label: 'ETT',   icon: '🫁' },
  { id: 'airway-lma',   label: 'LMA',   icon: '🫁' },
  { id: 'oxygen-nasal', label: 'Nasal', icon: '👃' },
  { id: 'oxygen-mask',  label: 'Mask',  icon: '😷' },
  { id: 'oxygen-nrbm',  label: 'NRBM',  icon: '😷' },
]

const OVERLAY_IDS = [
  { id: 'cpr-hands',    label: 'CPR Hands',  icon: '✋' },
  { id: 'hand-shoulder',label: 'Shoulder ✓', icon: '🤚' },
  { id: 'hand-carotid', label: 'Pulse ✓',    icon: '🤚' },
  { id: 'shock-flash',  label: 'Shock Flash',icon: '⚡' },
  { id: 'rosc-overlay', label: 'ROSC',       icon: '✅' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function ToggleBtn({
  label, icon, visible, hasImage, onToggle,
}: {
  label: string; icon: string
  visible: boolean; hasImage: boolean; onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg border text-center transition-all active:scale-95 ${
        visible
          ? 'border-teal-500/60 bg-teal-500/15 text-teal-200'
          : hasImage
            ? 'border-slate-700 bg-navy-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            : 'border-slate-800 bg-transparent text-slate-700 cursor-not-allowed opacity-50'
      }`}
      disabled={!hasImage}
      title={hasImage ? (visible ? `Hide ${label}` : `Show ${label}`) : `No image uploaded for ${label}`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[9px] font-semibold leading-tight truncate w-full">{label}</span>
      {visible && <span className="w-1 h-1 rounded-full bg-teal-400 flex-none" />}
    </button>
  )
}

function Group({
  label, items, assets, visibleIds, onToggle,
}: {
  label: string
  items: { id: string; label: string; icon: string }[]
  assets: SceneAsset[]
  visibleIds: Set<string>
  onToggle: (id: string) => void
}) {
  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]))
  return (
    <div>
      <p className="text-slate-600 text-[9px] font-bold uppercase tracking-wider mb-1 px-0.5">{label}</p>
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ id, label: lbl, icon }) => {
          const asset = assetMap[id]
          return (
            <ToggleBtn
              key={id}
              label={lbl}
              icon={icon}
              visible={visibleIds.has(id)}
              hasImage={!!(asset?.storageUrl ?? asset?.imageDataUrl)}
              onToggle={() => onToggle(id)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SceneAssetPanel({ assets, visibleIds, onToggle, onReset, onClear }: Props) {
  return (
    <div className="h-full flex flex-col bg-navy-950 overflow-hidden">
      {/* Header */}
      <div className="flex-none px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="text-white font-bold text-sm">Scene</div>
        <div className="flex gap-1.5">
          <button
            onClick={onClear}
            className="text-[10px] px-2 py-1 rounded border border-slate-700 text-slate-500 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
            title="Hide all assets"
          >Clear</button>
          <button
            onClick={onReset}
            className="text-[10px] px-2 py-1 rounded border border-slate-700 text-slate-500 hover:text-teal-400 hover:border-teal-500/40 transition-colors"
            title="Reset to defaults"
          >Reset</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">

        {/* Team — most used during teaching */}
        <Group label="Team Members" items={TEAM_IDS} assets={assets} visibleIds={visibleIds} onToggle={onToggle} />

        {/* Equipment */}
        <Group label="Equipment" items={EQUIPMENT_IDS} assets={assets} visibleIds={visibleIds} onToggle={onToggle} />

        {/* Airway */}
        <Group label="Airway / O₂" items={AIRWAY_IDS} assets={assets} visibleIds={visibleIds} onToggle={onToggle} />

        {/* Overlays */}
        <Group label="Overlays" items={OVERLAY_IDS} assets={assets} visibleIds={visibleIds} onToggle={onToggle} />

        <p className="text-slate-700 text-[9px] text-center pb-1">
          Grey = no image uploaded · Teal = visible
        </p>
      </div>
    </div>
  )
}
