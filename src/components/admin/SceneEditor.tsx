import { useState, useRef } from 'react'
import { SceneAsset, ActionAssetMapping, ASSET_CATEGORIES, AssetCategory } from '../../types/sceneAsset'
import { loadSceneAssets, saveSceneAssets, loadActionAssetMap, saveActionAssetMap, DEFAULT_SCENE_ASSETS, DEFAULT_ACTION_MAPPING } from '../../lib/sceneAssetStore'
import { ASSET_SPECS, AssetSpec, specW, specH } from '../../data/assetSpecs'
import { scenarioActions } from '../../data/scenarioActions'
import { isSupabaseEnabled } from '../../lib/supabase'
import { uploadAssetToSupabase, uploadDataUrlToSupabase } from '../../lib/supabaseStorage'

type SubTab = 'library' | 'layout' | 'mapping'

export default function SceneEditor() {
  const [subTab, setSubTab] = useState<SubTab>('library')
  const [assets, setAssets] = useState<SceneAsset[]>(loadSceneAssets)
  const [mapping, setMapping] = useState<ActionAssetMapping>(loadActionAssetMap)

  const persist = (nextAssets: SceneAsset[], nextMapping?: ActionAssetMapping) => {
    saveSceneAssets(nextAssets)
    if (nextMapping) saveActionAssetMap(nextMapping)
    window.dispatchEvent(new CustomEvent('acls-assets-updated'))
  }

  const updateAssets = (next: SceneAsset[]) => { setAssets(next); persist(next) }
  const updateMapping = (next: ActionAssetMapping) => {
    setMapping(next)
    saveActionAssetMap(next)
    window.dispatchEvent(new CustomEvent('acls-assets-updated'))
  }

  const resetPositions = () => {
    if (!confirm('รีเซ็ตตำแหน่ง assets กลับเป็นค่าเริ่มต้น? รูปภาพยังคงอยู่')) return
    const preserved = new Map(assets.map(a => [a.id, a.imageDataUrl]))
    const fresh = DEFAULT_SCENE_ASSETS.map(a => ({ ...a, imageDataUrl: preserved.get(a.id) }))
    updateAssets(fresh)
  }

  const resetMapping = () => {
    if (!confirm('รีเซ็ต Action Mapping กลับเป็นค่าเริ่มต้น?')) return
    updateMapping({ ...DEFAULT_ACTION_MAPPING })
  }

  return (
    <div className="max-w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-base">Scene Asset System</p>
          <p className="text-slate-400 text-sm">อัปโหลดรูปภาพ PNG/WebP, จัดวางตำแหน่ง และ map กับ actions</p>
        </div>
        <div className="flex gap-2">
          {subTab === 'layout' && (
            <button onClick={resetPositions} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-orange-400 hover:border-orange-500/30 transition-colors">
              Reset Positions
            </button>
          )}
          {subTab === 'mapping' && (
            <button onClick={resetMapping} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-orange-400 hover:border-orange-500/30 transition-colors">
              Reset Mapping
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-800 -mb-1">
        {([
          { id: 'library' as SubTab, label: 'Asset Library', icon: '📚' },
          { id: 'layout'  as SubTab, label: 'Layout Editor', icon: '📐' },
          { id: 'mapping' as SubTab, label: 'Action Mapping', icon: '🔗' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all ${
              subTab === t.id
                ? 'text-white border-teal-500'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {subTab === 'library' && <LibraryTab assets={assets} onUpdate={updateAssets} />}
        {subTab === 'layout'  && <LayoutTab  assets={assets} onUpdate={updateAssets} />}
        {subTab === 'mapping' && <MappingTab assets={assets} mapping={mapping} onUpdate={updateMapping} />}
      </div>
    </div>
  )
}

// ─── Template download ────────────────────────────────────────────────────────

function downloadTemplate(assetId: string, name: string, spec: AssetSpec) {
  const canvas = document.createElement('canvas')
  canvas.width  = spec.recommendedW
  canvas.height = spec.recommendedH
  const ctx = canvas.getContext('2d')!

  // checkerboard to show transparency
  const tileSize = 20
  for (let row = 0; row < Math.ceil(spec.recommendedH / tileSize); row++) {
    for (let col = 0; col < Math.ceil(spec.recommendedW / tileSize); col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#e5e7eb' : '#f9fafb'
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize)
    }
  }

  // safe-area dashed border (8px inset)
  const pad = 8
  ctx.strokeStyle = '#6b7280'
  ctx.lineWidth = 2
  ctx.setLineDash([12, 6])
  ctx.strokeRect(pad, pad, spec.recommendedW - pad * 2, spec.recommendedH - pad * 2)

  // center crosshair
  const cx = spec.recommendedW / 2
  const cy = spec.recommendedH / 2
  ctx.setLineDash([6, 4])
  ctx.strokeStyle = '#9ca3af'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, pad); ctx.lineTo(cx, spec.recommendedH - pad)
  ctx.moveTo(pad, cy); ctx.lineTo(spec.recommendedW - pad, cy)
  ctx.stroke()

  // label text
  ctx.setLineDash([])
  ctx.fillStyle = '#374151'
  ctx.font = `bold ${Math.max(14, Math.round(spec.recommendedW / 20))}px sans-serif`
  ctx.fillText(name, pad + 8, pad + 28)
  ctx.font = `${Math.max(12, Math.round(spec.recommendedW / 26))}px sans-serif`
  ctx.fillStyle = '#6b7280'
  ctx.fillText(`${spec.recommendedW} × ${spec.recommendedH} px`, pad + 8, pad + 52)
  ctx.fillText(`Aspect ratio: ${spec.aspectLabel}`, pad + 8, pad + 72)
  ctx.fillText('Transparent PNG recommended', pad + 8, pad + 92)

  canvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template-${assetId}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

// ─── Library Tab ──────────────────────────────────────────────────────────────

function SpecBadge({ spec }: { spec: AssetSpec }) {
  return (
    <div className="bg-navy-950/60 border border-slate-700/50 rounded-lg px-2 py-1.5 text-[10px] space-y-0.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        <span className="text-teal-500">📐</span>
        <span className="font-semibold tabular-nums">{spec.recommendedW} × {spec.recommendedH} px</span>
      </div>
      <div className="text-slate-500">Ratio: {spec.aspectLabel} · Transparent PNG</div>
    </div>
  )
}

function LibraryTab({ assets, onUpdate }: { assets: SceneAsset[]; onUpdate: (a: SceneAsset[]) => void }) {
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const addInputRef = useRef<HTMLInputElement>(null)
  const pendingReplaceId = useRef<string | null>(null)
  const [addState, setAddState] = useState<{ name: string; category: AssetCategory; dataUrl: string; file: File } | null>(null)
  const [uploading, setUploading] = useState<string | null>(null) // assetId currently uploading
  const [migratingAll, setMigratingAll] = useState(false)

  const triggerReplace = (id: string) => {
    pendingReplaceId.current = id
    replaceInputRef.current?.click()
  }

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !pendingReplaceId.current) return
    const id = pendingReplaceId.current
    e.target.value = ''

    // Read base64 for local preview / fallback
    const dataUrl = await new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onload = ev => resolve(ev.target?.result as string)
      reader.readAsDataURL(file)
    })

    const spec = ASSET_SPECS[id]
    const dimOverride = spec ? { w: specW(spec), h: specH(spec) } : {}

    if (isSupabaseEnabled()) {
      setUploading(id)
      const storageUrl = await uploadAssetToSupabase(id, file)
      setUploading(null)
      if (storageUrl) {
        onUpdate(assets.map(a => a.id !== id ? a : { ...a, ...dimOverride, storageUrl, imageDataUrl: undefined }))
        return
      }
      // Fall through to local if upload failed
    }
    onUpdate(assets.map(a => a.id !== id ? a : { ...a, ...dimOverride, imageDataUrl: dataUrl, storageUrl: undefined }))
  }

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAddState({ name, category: 'equipment', dataUrl: ev.target?.result as string, file })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const confirmAdd = async () => {
    if (!addState) return
    const newId = `custom-${Date.now()}`
    let storageUrl: string | undefined
    let imageDataUrl: string | undefined = addState.dataUrl

    if (isSupabaseEnabled()) {
      setUploading(newId)
      const url = await uploadAssetToSupabase(newId, addState.file)
      setUploading(null)
      if (url) { storageUrl = url; imageDataUrl = undefined }
    }

    const newAsset: SceneAsset = {
      id: newId,
      name: addState.name,
      category: addState.category,
      imageDataUrl,
      storageUrl,
      x: 25, y: 25, w: 20, h: 20,
      rotation: 0, opacity: 1, zIndex: 15, defaultVisible: false,
    }
    onUpdate([...assets, newAsset])
    setAddState(null)
  }

  const migrateAllToSupabase = async () => {
    if (!isSupabaseEnabled()) return
    const toMigrate = assets.filter(a => !a.storageUrl && (a.imageDataUrl))
    if (toMigrate.length === 0) { alert('ไม่มี asset ที่ต้องย้าย — ทุก asset ใช้ Supabase แล้ว'); return }
    if (!confirm(`ย้าย ${toMigrate.length} asset ไป Supabase Storage?`)) return
    setMigratingAll(true)
    let updated = [...assets]
    for (const a of toMigrate) {
      const url = await uploadDataUrlToSupabase(a.id, a.imageDataUrl!)
      if (url) {
        updated = updated.map(x => x.id === a.id ? { ...x, storageUrl: url, imageDataUrl: undefined } : x)
      }
    }
    onUpdate(updated)
    setMigratingAll(false)
  }

  const clearImage = (id: string) => onUpdate(assets.map(a => a.id === id ? { ...a, imageDataUrl: undefined, storageUrl: undefined } : a))
  const deleteAsset = (id: string) => { if (confirm('ลบ asset นี้?')) onUpdate(assets.filter(a => a.id !== id)) }
  const toggleDefault = (id: string) => onUpdate(assets.map(a => a.id === id ? { ...a, defaultVisible: !a.defaultVisible } : a))

  const grouped = ASSET_CATEGORIES.map(cat => ({
    ...cat, items: assets.filter(a => a.category === cat.id),
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">
      <input ref={replaceInputRef} type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={handleReplaceFile} />
      <input ref={addInputRef}     type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={handleAddFile} />

      {/* Supabase status + migrate button */}
      {isSupabaseEnabled() ? (
        <div className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3 text-xs">
          <span className="text-lg flex-none">☁️</span>
          <div className="flex-1">
            <p className="text-purple-300 font-semibold">Supabase Storage เชื่อมต่อแล้ว</p>
            <p className="text-slate-400">รูปที่อัปโหลดจะถูกเก็บใน cloud — ใช้งานได้จากทุกอุปกรณ์</p>
          </div>
          {assets.some(a => !a.storageUrl && a.imageDataUrl) && (
            <button
              onClick={migrateAllToSupabase}
              disabled={migratingAll}
              className="flex-none px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 font-bold transition-colors"
            >
              {migratingAll ? '⏳ กำลังย้าย…' : '☁ Migrate local → Supabase'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center gap-3 text-xs">
          <span className="text-lg flex-none">💾</span>
          <div>
            <p className="text-slate-300 font-semibold">Local-only mode</p>
            <p className="text-slate-500">รูปจะเก็บใน IndexedDB ของเครื่องนี้เท่านั้น  ·  เพิ่ม VITE_SUPABASE_* env vars เพื่อ sync ข้ามอุปกรณ์</p>
          </div>
        </div>
      )}

      {/* Spec guide callout */}
      <div className="bg-teal-500/8 border border-teal-500/20 rounded-xl p-3 text-xs text-slate-400 flex gap-3">
        <span className="text-2xl flex-none">💡</span>
        <div>
          <p className="text-teal-300 font-semibold mb-0.5">Content Creator Guide</p>
          <p>Each asset slot shows its <strong className="text-slate-300">recommended size</strong> in pixels. Download the <strong className="text-slate-300">PNG template</strong> to draw directly in Procreate, Photoshop, or Illustrator. Upload a transparent PNG — the system auto-fits it to the slot and preserves aspect ratio.</p>
        </div>
      </div>

      {/* Add new custom asset */}
      <div className="bg-navy-900 border border-dashed border-slate-700 rounded-2xl p-4">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">Add New Custom Asset</p>
        {addState ? (
          <div className="flex items-start gap-4">
            <img src={addState.dataUrl} className="w-20 h-20 object-contain rounded-xl bg-slate-800 border border-slate-700 flex-none p-1" />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={addState.name}
                onChange={e => setAddState(s => s ? { ...s, name: e.target.value } : s)}
                placeholder="Asset name..."
                className="w-full bg-navy-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-teal-500 focus:outline-none"
              />
              <select
                value={addState.category}
                onChange={e => setAddState(s => s ? { ...s, category: e.target.value as AssetCategory } : s)}
                className="w-full bg-navy-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-teal-500 focus:outline-none"
              >
                {ASSET_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={confirmAdd} disabled={!addState.name.trim()} className="flex-1 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white text-xs font-bold transition-colors">
                  Add to Library
                </button>
                <button onClick={() => setAddState(null)} className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 text-xs hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => addInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-colors"
          >
            <span className="text-xl">+</span> อัปโหลดรูปใหม่
            <span className="text-slate-600 text-xs ml-1">PNG / WebP</span>
          </button>
        )}
      </div>

      {/* Grouped grid */}
      {grouped.map(group => (
        <div key={group.id}>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">{group.label}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {group.items.map(asset => {
              const isCustom = asset.id.startsWith('custom-')
              const spec = ASSET_SPECS[asset.id]
              return (
                <div key={asset.id} className="bg-navy-900 border border-slate-700/60 rounded-xl overflow-hidden flex flex-col">
                  {/* Preview */}
                  <div className="h-28 bg-slate-900 flex items-center justify-center relative flex-none">
                    {uploading === asset.id ? (
                      <div className="text-slate-400 text-center">
                        <div className="text-2xl mb-1 animate-pulse">☁️</div>
                        <div className="text-[10px]">Uploading…</div>
                      </div>
                    ) : (asset.storageUrl || asset.imageDataUrl) ? (
                      <img src={asset.storageUrl ?? asset.imageDataUrl} alt={asset.name} className="max-h-full max-w-full object-contain p-2" />
                    ) : (
                      <div className="text-slate-700 text-center">
                        <div className="text-3xl mb-1">📷</div>
                        <div className="text-[10px]">No image</div>
                      </div>
                    )}
                    <button
                      onClick={() => toggleDefault(asset.id)}
                      title={asset.defaultVisible ? 'Visible by default (click to hide)' : 'Hidden by default (click to show)'}
                      className={`absolute top-1 left-1 w-5 h-5 rounded text-[11px] flex items-center justify-center border transition-colors ${
                        asset.defaultVisible
                          ? 'bg-teal-500/30 border-teal-500/50 text-teal-300'
                          : 'bg-navy-900/70 border-slate-700 text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {asset.defaultVisible ? '●' : '○'}
                    </button>
                    {asset.storageUrl && (
                      <span className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold" title="Supabase Storage">☁</span>
                    )}
                    {!asset.storageUrl && asset.imageDataUrl && (
                      <span className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30 font-bold" title="Local only">💾</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-2.5 flex flex-col gap-2 flex-1">
                    <div className="text-white text-xs font-semibold leading-tight truncate" title={asset.name}>{asset.name}</div>

                    {/* Spec info */}
                    {spec && (
                      <div className="space-y-1">
                        <SpecBadge spec={spec} />
                        <p className="text-slate-600 text-[10px] leading-tight">{spec.description}</p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-1 mt-auto">
                      <button
                        onClick={() => triggerReplace(asset.id)}
                        disabled={uploading === asset.id}
                        className="flex-1 py-1 text-[11px] font-medium rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-400 hover:bg-teal-500/25 disabled:opacity-40 transition-colors"
                      >
                        {(asset.storageUrl || asset.imageDataUrl) ? 'Replace' : 'Upload'}
                      </button>
                      {spec && (
                        <button
                          onClick={() => downloadTemplate(asset.id, asset.name, spec)}
                          title="Download PNG template"
                          className="py-1 px-1.5 text-[11px] rounded-lg border border-slate-700 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
                        >
                          📥
                        </button>
                      )}
                      {(asset.storageUrl || asset.imageDataUrl) && (
                        <button onClick={() => clearImage(asset.id)} title="Clear image" className="py-1 px-1.5 text-[11px] rounded-lg border border-slate-700 text-slate-500 hover:text-orange-400 hover:border-orange-500/30 transition-colors">×</button>
                      )}
                      {isCustom && (
                        <button onClick={() => deleteAsset(asset.id)} title="Delete slot" className="py-1 px-1.5 text-[11px] rounded-lg border border-slate-700 text-slate-600 hover:text-red-400 hover:border-red-500/30 transition-colors">🗑</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Layout Tab ───────────────────────────────────────────────────────────────

interface DragRef {
  assetId: string
  type: 'move' | 'nw' | 'ne' | 'sw' | 'se'
  startX: number; startY: number
  origX: number; origY: number; origW: number; origH: number
}

function LayoutTab({ assets, onUpdate }: { assets: SceneAsset[]; onUpdate: (a: SceneAsset[]) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showSpecOverlay, setShowSpecOverlay] = useState(true)
  const [zoom, setZoom] = useState(1)
  // Preview-only visibility (does NOT affect scenario canvas)
  const [previewVisible, setPreviewVisible] = useState<Set<string>>(() => new Set(assets.map(a => a.id)))

  const togglePreview = (id: string) =>
    setPreviewVisible(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const showAll = () => setPreviewVisible(new Set(assets.map(a => a.id)))
  const canvasRef = useRef<HTMLDivElement>(null)
  const drag = useRef<DragRef | null>(null)

  const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3]
  const zoomIn  = () => setZoom(z => ZOOM_STEPS.find(s => s > z) ?? z)
  const zoomOut = () => setZoom(z => [...ZOOM_STEPS].reverse().find(s => s < z) ?? z)

  const selected = assets.find(a => a.id === selectedId)
  const sorted = [...assets].sort((a, b) => a.zIndex - b.zIndex)

  const startDrag = (e: React.MouseEvent, asset: SceneAsset, type: DragRef['type']) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedId(asset.id)
    setIsDragging(true)
    drag.current = { assetId: asset.id, type, startX: e.clientX, startY: e.clientY, origX: asset.x, origY: asset.y, origW: asset.w, origH: asset.h }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drag.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = (e.clientX - drag.current.startX) / rect.width * 100
    const dy = (e.clientY - drag.current.startY) / rect.height * 100
    const { assetId, type, origX, origY, origW, origH } = drag.current
    const cl = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))

    let upd: Partial<SceneAsset> = {}
    if (type === 'move') upd = { x: cl(origX + dx), y: cl(origY + dy) }
    if (type === 'se')   upd = { w: cl(origW + dx, 2), h: cl(origH + dy, 2) }
    if (type === 'ne')   upd = { y: cl(origY + dy), w: cl(origW + dx, 2), h: cl(origH - dy, 2) }
    if (type === 'sw')   upd = { x: cl(origX + dx), w: cl(origW - dx, 2), h: cl(origH + dy, 2) }
    if (type === 'nw')   upd = { x: cl(origX + dx), y: cl(origY + dy), w: cl(origW - dx, 2), h: cl(origH - dy, 2) }

    onUpdate(assets.map(a => a.id === assetId ? { ...a, ...upd } : a))
  }

  const endDrag = () => { drag.current = null; setIsDragging(false) }
  const setProp = (id: string, upd: Partial<SceneAsset>) => onUpdate(assets.map(a => a.id === id ? { ...a, ...upd } : a))

  const bringForward = (asset: SceneAsset) => {
    // Find the next higher z-index among other assets and swap
    const others = assets.filter(a => a.id !== asset.id)
    const above = others.filter(a => a.zIndex > asset.zIndex).sort((a, b) => a.zIndex - b.zIndex)
    if (above.length === 0) return
    const target = above[0]
    onUpdate(assets.map(a => {
      if (a.id === asset.id) return { ...a, zIndex: target.zIndex }
      if (a.id === target.id) return { ...a, zIndex: asset.zIndex }
      return a
    }))
  }

  const sendBackward = (asset: SceneAsset) => {
    const others = assets.filter(a => a.id !== asset.id)
    const below = others.filter(a => a.zIndex < asset.zIndex).sort((a, b) => b.zIndex - a.zIndex)
    if (below.length === 0) return
    const target = below[0]
    onUpdate(assets.map(a => {
      if (a.id === asset.id) return { ...a, zIndex: target.zIndex }
      if (a.id === target.id) return { ...a, zIndex: asset.zIndex }
      return a
    }))
  }

  const bringToFront = (asset: SceneAsset) => {
    const maxZ = Math.max(...assets.map(a => a.zIndex))
    if (asset.zIndex === maxZ) return
    setProp(asset.id, { zIndex: maxZ + 1 })
  }

  const sendToBack = (asset: SceneAsset) => {
    const minZ = Math.min(...assets.map(a => a.zIndex))
    if (asset.zIndex === minZ) return
    setProp(asset.id, { zIndex: Math.max(0, minZ - 1) })
  }

  const applyRecommendedSize = (asset: SceneAsset) => {
    const spec = ASSET_SPECS[asset.id]
    if (!spec) return
    onUpdate(assets.map(a => a.id === asset.id ? { ...a, w: specW(spec), h: specH(spec) } : a))
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '180px 1fr 280px' }}>

      {/* Asset list */}
      <div className="flex flex-col gap-1" style={{ maxHeight: '70vh' }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">All Assets</p>
          <button
            onClick={showAll}
            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >Show All</button>
        </div>
        <div className="space-y-1 overflow-y-auto flex-1">
        {assets.map(a => {
          const visible = previewVisible.has(a.id)
          return (
            <div
              key={a.id}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                selectedId === a.id
                  ? 'bg-teal-500/20 border border-teal-500/40 text-white'
                  : 'bg-navy-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              } ${!visible ? 'opacity-40' : ''}`}
            >
              <input
                type="checkbox"
                checked={visible}
                onChange={() => togglePreview(a.id)}
                onClick={e => e.stopPropagation()}
                className="w-3 h-3 rounded accent-teal-500 flex-none cursor-pointer"
                title="Show in preview"
              />
              <button
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                onClick={() => setSelectedId(a.id)}
              >
                {(a.storageUrl ?? a.imageDataUrl)
                  ? <img src={a.storageUrl ?? a.imageDataUrl} className="w-7 h-7 object-contain rounded bg-slate-800 flex-none" />
                  : <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center flex-none text-slate-700 text-[10px]">?</div>
                }
                <span className="truncate">{a.name}</span>
              </button>
            </div>
          )
        })}
        </div>
      </div>

      {/* Canvas */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex-none">
            Scene Preview — drag to move · corner handles to resize
          </p>
          <div className="flex items-center gap-2 flex-none">
            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={showSpecOverlay}
                onChange={e => setShowSpecOverlay(e.target.checked)}
                className="w-3 h-3 rounded accent-teal-500"
              />
              Spec overlay
            </label>
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-navy-900 border border-slate-700 rounded-lg px-1.5 py-1">
              <button
                onClick={zoomOut}
                disabled={zoom <= ZOOM_STEPS[0]}
                className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold leading-none"
                title="Zoom out"
              >−</button>
              <button
                onClick={() => setZoom(1)}
                className="text-[10px] font-bold text-slate-300 hover:text-teal-400 transition-colors min-w-[34px] text-center"
                title="Reset zoom"
              >{Math.round(zoom * 100)}%</button>
              <button
                onClick={zoomIn}
                disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold leading-none"
                title="Zoom in"
              >+</button>
            </div>
          </div>
        </div>
        {/* Scrollable zoom wrapper */}
        <div className="overflow-auto rounded-xl border border-slate-700" style={{ maxHeight: '70vh' }}>
        <div style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
        <div
          ref={canvasRef}
          className={`relative bg-navy-950 overflow-hidden w-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
          style={{ aspectRatio: '16/9' }}
          onMouseMove={handleMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onClick={(e) => { if (e.target === canvasRef.current) setSelectedId(null) }}
        >
          {/* Recommended spec bounding boxes (shown behind assets) */}
          {showSpecOverlay && assets.filter(a => previewVisible.has(a.id)).map(asset => {
            const spec = ASSET_SPECS[asset.id]
            if (!spec) return null
            const sw = specW(spec)
            const sh = specH(spec)
            const isSelected = selectedId === asset.id
            return (
              <div
                key={`spec-${asset.id}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${asset.x}%`,
                  top: `${asset.y}%`,
                  width: `${sw}%`,
                  height: `${sh}%`,
                  zIndex: asset.zIndex - 1,
                  border: `1px dashed ${isSelected ? '#f59e0b' : '#334155'}`,
                  borderRadius: '2px',
                }}
              >
                <div
                  className="absolute top-0.5 left-0.5 text-[8px] font-bold leading-tight px-1 py-0.5 rounded"
                  style={{
                    color: isSelected ? '#f59e0b' : '#475569',
                    backgroundColor: isSelected ? '#1c1917' : 'transparent',
                  }}
                >
                  {spec.recommendedW}×{spec.recommendedH}
                </div>
              </div>
            )
          })}

          {sorted.filter(asset => previewVisible.has(asset.id)).map(asset => (
            <div
              key={asset.id}
              className="absolute"
              style={{
                left: `${asset.x}%`, top: `${asset.y}%`,
                width: `${asset.w}%`, height: `${asset.h}%`,
                transform: `rotate(${asset.rotation}deg)`,
                opacity: asset.opacity,
                zIndex: asset.zIndex,
                outline: selectedId === asset.id ? '2px solid #14b8a6' : undefined,
                outlineOffset: '1px',
                cursor: isDragging && selectedId === asset.id ? 'grabbing' : 'move',
              }}
              onMouseDown={e => startDrag(e, asset, 'move')}
            >
              {(asset.storageUrl ?? asset.imageDataUrl)
                ? <img src={asset.storageUrl ?? asset.imageDataUrl} className="w-full h-full object-contain pointer-events-none" />
                : <div className="w-full h-full border border-dashed border-slate-700 rounded flex items-center justify-center">
                    <span className="text-slate-700 text-[9px] text-center px-1 leading-tight">{asset.name}</span>
                  </div>
              }
              {selectedId === asset.id && (
                <>
                  <div className="absolute -top-1.5 -left-1.5  w-3 h-3 bg-teal-500 rounded-sm cursor-nw-resize z-50" onMouseDown={e => startDrag(e, asset, 'nw')} />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-teal-500 rounded-sm cursor-ne-resize z-50" onMouseDown={e => startDrag(e, asset, 'ne')} />
                  <div className="absolute -bottom-1.5 -left-1.5  w-3 h-3 bg-teal-500 rounded-sm cursor-sw-resize z-50" onMouseDown={e => startDrag(e, asset, 'sw')} />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-teal-500 rounded-sm cursor-se-resize z-50" onMouseDown={e => startDrag(e, asset, 'se')} />
                </>
              )}
            </div>
          ))}
        </div>
        </div>{/* end zoom width wrapper */}
        </div>{/* end scroll container */}
      </div>

      {/* Properties panel */}
      <div className="bg-navy-900 border border-slate-700/60 rounded-xl p-3 overflow-y-auto" style={{ maxHeight: '70vh' }}>
        {selected ? (
          <div className="space-y-4">
            <div>
              <p className="text-white font-bold text-xs leading-tight">{selected.name}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{selected.category}</p>
            </div>

            {/* Recommended spec */}
            {ASSET_SPECS[selected.id] && (
              <div className="space-y-1.5">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">Recommended</p>
                <SpecBadge spec={ASSET_SPECS[selected.id]} />
                <p className="text-slate-600 text-[10px] leading-tight">{ASSET_SPECS[selected.id].description}</p>
                <button
                  onClick={() => applyRecommendedSize(selected)}
                  className="w-full text-[10px] py-1 rounded-lg border border-slate-700 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
                >
                  ↩ Apply recommended size
                </button>
                <button
                  onClick={() => downloadTemplate(selected.id, selected.name, ASSET_SPECS[selected.id])}
                  className="w-full text-[10px] py-1 rounded-lg border border-slate-700 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
                >
                  📥 Download template PNG
                </button>
              </div>
            )}

            <PropGroup label="Position (%)">
              <PropRow label="X" value={selected.x} onChange={v => setProp(selected.id, { x: v })} min={0} max={100} step={0.5} />
              <PropRow label="Y" value={selected.y} onChange={v => setProp(selected.id, { y: v })} min={0} max={100} step={0.5} />
            </PropGroup>

            <PropGroup label="Size (%)">
              <PropRow label="W" value={selected.w} onChange={v => setProp(selected.id, { w: v })} min={1} max={100} step={0.5} />
              <PropRow label="H" value={selected.h} onChange={v => setProp(selected.id, { h: v })} min={1} max={100} step={0.5} />
              {/* Proportional scale buttons */}
              <div className="flex gap-1 pt-0.5">
                {[
                  { label: '−−', delta: -10 },
                  { label: '−',  delta: -5  },
                  { label: '+',  delta: 5   },
                  { label: '++', delta: 10  },
                ].map(({ label, delta }) => (
                  <button
                    key={label}
                    onClick={() => {
                      const factor = 1 + delta / 100
                      setProp(selected.id, {
                        w: Math.max(1, Math.min(100, selected.w * factor)),
                        h: Math.max(1, Math.min(100, selected.h * factor)),
                      })
                    }}
                    className="flex-1 py-1 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs font-bold transition-colors"
                    title={`Scale ${delta > 0 ? '+' : ''}${delta}%`}
                  >{label}</button>
                ))}
              </div>
              <p className="text-slate-700 text-[9px] text-center">proportional scale</p>
            </PropGroup>

            <PropGroup label="Transform">
              <PropRow label="Rot°"    value={selected.rotation}                    onChange={v => setProp(selected.id, { rotation: v })} min={-180} max={180} step={1} />
              <PropRow label="Opacity" value={Math.round(selected.opacity * 100)}   onChange={v => setProp(selected.id, { opacity: v / 100 })} min={0} max={100} step={1} />
            </PropGroup>

            <PropGroup label="Arrange (Layer order)">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => bringToFront(selected)}
                  className="py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-teal-500/50 hover:bg-teal-500/10 text-[10px] font-semibold transition-colors flex flex-col items-center gap-0.5"
                  title="Bring to Front"
                >
                  <span className="text-sm">⬆⬆</span>
                  <span>Bring to Front</span>
                </button>
                <button
                  onClick={() => sendToBack(selected)}
                  className="py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-orange-500/50 hover:bg-orange-500/10 text-[10px] font-semibold transition-colors flex flex-col items-center gap-0.5"
                  title="Send to Back"
                >
                  <span className="text-sm">⬇⬇</span>
                  <span>Send to Back</span>
                </button>
                <button
                  onClick={() => bringForward(selected)}
                  className="py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-teal-500/50 hover:bg-teal-500/10 text-[10px] font-semibold transition-colors flex flex-col items-center gap-0.5"
                  title="Bring Forward one step"
                >
                  <span className="text-sm">⬆</span>
                  <span>Bring Forward</span>
                </button>
                <button
                  onClick={() => sendBackward(selected)}
                  className="py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-orange-500/50 hover:bg-orange-500/10 text-[10px] font-semibold transition-colors flex flex-col items-center gap-0.5"
                  title="Send Backward one step"
                >
                  <span className="text-sm">⬇</span>
                  <span>Send Backward</span>
                </button>
              </div>
              <div className="flex items-center justify-between px-1 pt-0.5">
                <span className="text-slate-600 text-[9px]">Current layer</span>
                <span className="text-slate-400 text-[10px] font-mono font-bold">{selected.zIndex}</span>
              </div>
            </PropGroup>

            <PropGroup label="Visibility">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selected.defaultVisible}
                  onChange={e => setProp(selected.id, { defaultVisible: e.target.checked })}
                  className="w-3.5 h-3.5 rounded accent-teal-500"
                />
                <span className="text-slate-300 text-xs">Visible by default</span>
              </label>
            </PropGroup>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-slate-600 text-xs text-center pt-4 pb-2">
              Click an asset in the canvas to edit its properties
            </div>
            <div className="border-t border-slate-800 pt-3">
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2">Legend</p>
              <div className="space-y-1.5 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 border border-dashed border-slate-600 rounded-sm flex-none" />
                  <span>Recommended spec box</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 border border-dashed border-amber-500 rounded-sm flex-none" />
                  <span>Selected asset spec</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 border-2 border-teal-500 rounded-sm flex-none" />
                  <span>Selected asset bounds</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PropGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-1.5">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function PropRow({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void
  min: number; max: number; step: number
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500 text-[10px] w-10 flex-none">{label}</span>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        className="w-16 bg-navy-800 text-white text-xs rounded px-2 py-1 border border-slate-700 focus:border-teal-500 focus:outline-none flex-none"
      />
      <input
        type="range"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        className="flex-1 accent-teal-500 h-1"
      />
    </div>
  )
}

// ─── Mapping Tab ──────────────────────────────────────────────────────────────

function MappingTab({ assets, mapping, onUpdate }: {
  assets: SceneAsset[]
  mapping: ActionAssetMapping
  onUpdate: (m: ActionAssetMapping) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleShow = (actionId: string, assetId: string) => {
    const cur = mapping[actionId] ?? { show: [], hide: [] }
    const already = cur.show.some(s => s.id === assetId)
    onUpdate({ ...mapping, [actionId]: { ...cur, show: already ? cur.show.filter(s => s.id !== assetId) : [...cur.show, { id: assetId }] } })
  }

  const toggleHide = (actionId: string, assetId: string) => {
    const cur = mapping[actionId] ?? { show: [], hide: [] }
    const already = cur.hide.includes(assetId)
    onUpdate({ ...mapping, [actionId]: { ...cur, hide: already ? cur.hide.filter(h => h !== assetId) : [...cur.hide, assetId] } })
  }

  const setDuration = (actionId: string, assetId: string, duration: number | undefined) => {
    const cur = mapping[actionId] ?? { show: [], hide: [] }
    onUpdate({ ...mapping, [actionId]: { ...cur, show: cur.show.map(s => s.id === assetId ? { ...s, duration: duration || undefined } : s) } })
  }

  const catColor: Record<string, string> = { assessment: '#3b82f6', resuscitation: '#f97316', device: '#8b5cf6', medication: '#14b8a6', outcome: '#22c55e' }
  const grouped = ASSET_CATEGORIES.map(cat => ({ ...cat, items: assets.filter(a => a.category === cat.id) })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-2">
      <p className="text-slate-400 text-sm mb-3">
        กำหนดว่า action แต่ละตัวจะ Show / Hide asset อะไร — ใส่ duration (ms) สำหรับ overlay ชั่วคราว
      </p>
      {scenarioActions.map(action => {
        const m = mapping[action.id] ?? { show: [], hide: [] }
        const expanded = expandedId === action.id

        return (
          <div key={action.id} className={`bg-navy-900 border rounded-xl overflow-hidden transition-all ${expanded ? 'border-teal-500/30' : 'border-slate-700/60'}`}>
            <button
              onClick={() => setExpandedId(expanded ? null : action.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-800/30 transition-colors"
            >
              <span className="text-lg flex-none">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-xs">{action.label}</div>
                <div className="text-slate-500 text-[10px]">{action.labelEn}</div>
              </div>
              <div className="flex gap-1.5 flex-none items-center">
                {m.show.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold">+{m.show.length}</span>}
                {m.hide.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">-{m.hide.length}</span>}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ color: catColor[action.category] ?? '#94a3b8', backgroundColor: (catColor[action.category] ?? '#64748b') + '18' }}>
                  {action.category}
                </span>
                <svg className={`w-3 h-3 text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expanded && (
              <div className="border-t border-teal-500/20 p-3 grid grid-cols-2 gap-4 bg-slate-900/30">
                <div>
                  <p className="text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-2">Show when performed</p>
                  <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
                    {grouped.map(grp => (
                      <div key={grp.id}>
                        <p className="text-slate-600 text-[9px] uppercase tracking-wider mt-2 mb-0.5">{grp.label}</p>
                        {grp.items.map(asset => {
                          const entry = m.show.find(s => s.id === asset.id)
                          return (
                            <div key={asset.id} className="flex items-center gap-1.5 py-0.5">
                              <input type="checkbox" checked={!!entry} onChange={() => toggleShow(action.id, asset.id)}
                                className="w-3 h-3 rounded accent-teal-500 flex-none" />
                              <span className="text-slate-300 text-[10px] flex-1 truncate">{asset.name}</span>
                              {entry && (
                                <input
                                  type="number"
                                  value={entry.duration ?? ''}
                                  onChange={e => setDuration(action.id, asset.id, e.target.value ? Number(e.target.value) : undefined)}
                                  placeholder="ms"
                                  title="Auto-hide after (ms), leave blank = permanent"
                                  className="w-14 bg-navy-800 text-slate-300 text-[10px] rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none"
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-2">Hide when performed</p>
                  <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
                    {grouped.map(grp => (
                      <div key={grp.id}>
                        <p className="text-slate-600 text-[9px] uppercase tracking-wider mt-2 mb-0.5">{grp.label}</p>
                        {grp.items.map(asset => (
                          <label key={asset.id} className="flex items-center gap-1.5 py-0.5 cursor-pointer">
                            <input type="checkbox" checked={m.hide.includes(asset.id)} onChange={() => toggleHide(action.id, asset.id)}
                              className="w-3 h-3 rounded accent-red-500 flex-none" />
                            <span className="text-slate-300 text-[10px]">{asset.name}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
