import { useState, useRef, useCallback, useEffect } from 'react'
import EcgLightbox from '../components/ecg/EcgLightbox'
import { useTeachingContent } from '../hooks/useTeachingContent'
import { useAlgorithmLibrary } from '../hooks/useAlgorithmLibrary'
import { Drug } from '../data/drugs'
import { rhythmLibrary } from '../data/rhythmLibrary'
import { RhythmType } from '../types/rhythm'
import { teachingTopics } from '../data/teachingTopics'
import { scenarioActions, ACTION_LIBRARY_GROUPS } from '../data/scenarioActions'
import { allHtCauses } from '../data/htCauses'
import { loadHtOverrides, saveHtOverrides, loadRoleOverrides, saveRoleOverrides } from '../lib/referenceOverrides'
import { loadCauseDetailOverrides, saveCauseDetailOverrides } from '../lib/causeDetailOverrides'
import { defaultRoles } from '../components/tools/TeamRoles'
import { builtInScenarios, loadCustomScenarios, saveCustomScenarios } from '../data/scenarioLibrary'
import { loadActionOverrides, saveActionOverrides, ActionTeachingOverride } from '../lib/actionOverrides'
import { ScenarioDefinition, ScenarioDifficulty, PatientState, defaultPatientState } from '../types/scenario'
import { lockAdmin } from '../components/admin/AdminPasswordGate'
import SceneEditor from '../components/admin/SceneEditor'
import { commonBaseActionIds } from '../data/teachingTopics'
import AlgorithmLibrary from '../components/algorithm/AlgorithmLibrary'

type AdminTab = 'algorithms' | 'ecg' | 'drugs' | 'topics' | 'actions' | 'scenarios' | 'assets' | 'references'

const EXPORT_KEYS = [
  'acls-board-slides',
  'acls-content-drugs',
  'acls-ecg-images',
  'acls-algorithm-data',
]

function exportAllData() {
  const data: Record<string, unknown> = {}
  EXPORT_KEYS.forEach((key) => {
    const val = window.localStorage.getItem(key)
    if (val) {
      try { data[key] = JSON.parse(val) } catch { data[key] = val }
    }
  })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `acls-content-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importDataFromFile(file: File, onDone: () => void) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as Record<string, unknown>
      Object.entries(data).forEach(([key, value]) => {
        window.localStorage.setItem(key, JSON.stringify(value))
      })
      onDone()
    } catch {
      alert('ไฟล์ไม่ถูกต้อง — กรุณาใช้ไฟล์ที่ export จาก ACLS Interactive เท่านั้น')
    }
  }
  reader.readAsText(file)
}

interface Props {
  onBack: () => void
}

export default function AdminPage({ onBack }: Props) {
  const [tab, setTab] = useState<AdminTab>('algorithms')
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const content = useTeachingContent()
  const library = useAlgorithmLibrary()

  const handleImport = useCallback((file: File) => {
    importDataFromFile(file, () => {
      setImportMsg('นำเข้าข้อมูลสำเร็จ — กำลัง reload...')
      setTimeout(() => window.location.reload(), 1200)
    })
  }, [])

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'algorithms', label: 'Algorithms',   icon: '🗺' },
    { id: 'ecg',        label: 'ECG Library',  icon: '📊' },
    { id: 'drugs',      label: 'Drugs',        icon: '💊' },
    { id: 'assets',     label: 'Scene Assets', icon: '🖼' },
    { id: 'scenarios',  label: 'Scenarios',    icon: '🎬' },
    { id: 'topics',     label: 'Topics',       icon: '📋' },
    { id: 'actions',    label: 'Actions',      icon: '▶️' },
    { id: 'references', label: 'References',   icon: '📖' },
  ]

  return (
    <div className="fixed inset-0 bg-navy-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none h-14 bg-navy-900 border-b border-slate-800 flex items-center gap-3 px-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <div className="text-white font-bold text-sm leading-none">Admin / Content Manager</div>
          <div className="text-slate-500 text-xs mt-0.5">แก้ไขเนื้อหา Algorithm, ECG, ยา, Topics</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300 font-medium hidden sm:block">
            ⚠️ localStorage only
          </span>

          {/* Import */}
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImport(f)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>

          {/* Export */}
          <button
            onClick={exportAllData}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 transition-colors font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>

          {/* Logout */}
          <button
            onClick={() => { lockAdmin(); onBack() }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/40 transition-colors"
            title="ออกจาก Admin"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {importMsg && (
          <div className="absolute top-14 left-0 right-0 bg-teal-500/20 border-b border-teal-500/40 px-4 py-2 text-teal-300 text-sm font-medium text-center">
            ✓ {importMsg}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex-none flex gap-1 px-4 pt-3 pb-0 border-b border-slate-800 bg-navy-900/50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium transition-all border-b-2 -mb-px
              ${tab === t.id
                ? 'text-white border-teal-500 bg-navy-950/80'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
              }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {tab === 'algorithms' && <AlgorithmsTab library={library} />}
        {tab === 'ecg' && <ECGLibraryTab content={content} />}
        {tab === 'drugs' && <DrugsTab content={content} />}
        {tab === 'assets' && <SceneEditor />}
        {tab === 'scenarios' && <ScenariosTab />}
        {tab === 'topics' && <TopicsTab />}
        {tab === 'actions' && <ActionsTab />}
        {tab === 'references' && <ReferencesTab />}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────── ALGORITHMS TAB ─ */

function AlgorithmsTab({ library }: { library: ReturnType<typeof useAlgorithmLibrary> }) {
  const [selectedId, setSelectedId] = useState(library.algorithms[0]?.id ?? '')
  const selectedAlgo = library.algorithms.find((a) => a.id === selectedId)

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-[260px_1fr] gap-4 h-[calc(100vh-160px)]">
      {/* Sidebar list */}
      <div className="flex flex-col gap-2">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Algorithms</p>
        {library.algorithms.map((algo) => (
          <button
            key={algo.id}
            onClick={() => setSelectedId(algo.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all text-sm
              ${selectedId === algo.id
                ? 'bg-teal-500/15 border-teal-500/50 text-white'
                : 'bg-navy-900 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
          >
            <div className="font-semibold leading-tight">{algo.title}</div>
            <div className="text-xs mt-0.5 text-slate-500">
              {algo.staticImageUrl ? '📎 Built-in' : algo.imageDataUrl ? '📷 Uploaded' : '⬜ No image'}
              {' · '}
              {algo.annotations.length} annotation{algo.annotations.length !== 1 ? 's' : ''}
            </div>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selectedAlgo && (
        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-navy-900 border border-slate-700/60 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-white font-bold text-lg">{selectedAlgo.title}</h2>
                <p className="text-slate-400 text-sm">{selectedAlgo.titleEn}</p>
                {selectedAlgo.staticImageUrl && (
                  <p className="text-teal-400 text-xs mt-1">📎 Built-in image: {selectedAlgo.staticImageUrl}</p>
                )}
              </div>
              <div className="flex gap-2">
                {selectedAlgo.imageDataUrl && !selectedAlgo.staticImageUrl && (
                  <button
                    onClick={() => library.removeImage(selectedAlgo.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    Remove uploaded
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Algorithm Library */}
          <div className="flex-1 bg-navy-900 border border-slate-700/60 rounded-2xl overflow-hidden min-h-0">
            <AlgorithmLibrary
              algorithms={library.algorithms}
              activeAlgorithmId={selectedAlgo.id}
              onSetActive={() => {}}
              onUpload={library.uploadImage}
              onRemoveImage={library.removeImage}
              onAddAnnotation={library.addAnnotation}
              onRemoveAnnotation={library.removeAnnotation}
              highlightedNodeId={null}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────── ECG LIBRARY TAB ─ */

const ALL_RHYTHMS = Object.keys(rhythmLibrary) as RhythmType[]

type EditingMeta = { rhythm: RhythmType; title: string; diagnosis: string; note: string }

function ECGLibraryTab({ content }: { content: ReturnType<typeof useTeachingContent> }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFor, setUploadingFor] = useState<RhythmType | null>(null)
  const [lightbox, setLightbox] = useState<{ url: string; title: string; subtitle?: string } | null>(null)
  const [editMeta, setEditMeta] = useState<EditingMeta | null>(null)

  // Close lightbox on Escape (handled inside EcgLightbox itself, but also guard here)
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  const handleUploadClick = (rhythm: RhythmType) => {
    setUploadingFor(rhythm)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingFor) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      const existing = content.ecgImages[uploadingFor]
      content.setEcgImage(uploadingFor, dataUrl, existing?.note ?? '', {
        title: existing?.title,
        diagnosis: existing?.diagnosis,
        category: existing?.category,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setUploadingFor(null)
  }

  const openLightbox = (rhythm: RhythmType) => {
    const entry = content.ecgImages[rhythm]
    if (!entry) return
    const info = rhythmLibrary[rhythm]
    setLightbox({
      url: entry.imageDataUrl,
      title: entry.title || info.nameEn,
      subtitle: entry.diagnosis || info.nameThai,
    })
  }

  const startEditMeta = (rhythm: RhythmType) => {
    const entry = content.ecgImages[rhythm]
    if (!entry) return
    setEditMeta({ rhythm, title: entry.title ?? '', diagnosis: entry.diagnosis ?? '', note: entry.note })
  }

  const saveMeta = () => {
    if (!editMeta) return
    content.updateEcgMeta(editMeta.rhythm, {
      title: editMeta.title,
      diagnosis: editMeta.diagnosis,
      note: editMeta.note,
    })
    setEditMeta(null)
  }

  return (
    <>
      {lightbox && (
        <EcgLightbox
          imageUrl={lightbox.url}
          title={lightbox.title}
          subtitle={lightbox.subtitle}
          onClose={() => setLightbox(null)}
        />
      )}

      {editMeta && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-slate-700 rounded-2xl p-5 w-full max-w-sm space-y-3">
            <p className="text-white font-bold text-sm">Edit ECG Metadata</p>
            <div className="space-y-2">
              <div>
                <label className="text-slate-400 text-[11px]">Title</label>
                <input
                  value={editMeta.title}
                  onChange={(e) => setEditMeta((m) => m && ({ ...m, title: e.target.value }))}
                  className="w-full bg-navy-950 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:border-teal-500 focus:outline-none mt-0.5"
                  placeholder="e.g. Ventricular Fibrillation"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px]">Diagnosis / subtitle</label>
                <input
                  value={editMeta.diagnosis}
                  onChange={(e) => setEditMeta((m) => m && ({ ...m, diagnosis: e.target.value }))}
                  className="w-full bg-navy-950 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:border-teal-500 focus:outline-none mt-0.5"
                  placeholder="e.g. Shockable — Defibrillation required"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px]">Teaching note</label>
                <textarea
                  value={editMeta.note}
                  onChange={(e) => setEditMeta((m) => m && ({ ...m, note: e.target.value }))}
                  rows={3}
                  className="w-full bg-navy-950 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:border-teal-500 focus:outline-none resize-none mt-0.5"
                  placeholder="Teaching points for this rhythm..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveMeta} className="flex-1 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs transition-colors">Save</button>
              <button onClick={() => setEditMeta(null)} className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-white font-bold text-base">ECG Library</p>
            <p className="text-slate-400 text-sm">อัพโหลด ECG ภาพถ่ายจริง — คลิกที่รูปเพื่อดูแบบเต็ม Zoom/Pan ได้</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {Object.keys(content.ecgImages).length}/{ALL_RHYTHMS.length} uploaded
          </span>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {ALL_RHYTHMS.map((rhythm) => {
            const info = rhythmLibrary[rhythm]
            const entry = content.ecgImages[rhythm]

            return (
              <div key={rhythm} className="bg-navy-900 border border-slate-700/60 rounded-2xl overflow-hidden">
                {/* ECG image — clickable to open lightbox */}
                <div
                  className={`h-28 bg-slate-950 flex items-center justify-center relative ${entry ? 'cursor-zoom-in group' : ''}`}
                  onClick={() => entry && openLightbox(rhythm)}
                >
                  {entry ? (
                    <>
                      <img src={entry.imageDataUrl} alt={entry.title || info.nameEn} className="w-full h-full object-contain" />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-90 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-700">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  <span className={`absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    info.isShockable ? 'bg-red-500/30 text-red-300' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {info.isShockable ? '⚡' : '—'}
                  </span>
                </div>

                <div className="px-3 py-2 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate" style={{ color: info.color }}>
                        {entry?.title || info.nameEn}
                      </p>
                      <p className="text-slate-500 text-[11px] truncate">
                        {entry?.diagnosis || info.nameThai}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-none">
                      {entry && (
                        <button
                          onClick={() => startEditMeta(rhythm)}
                          className="text-[10px] px-2 py-1 rounded-lg font-medium transition-colors bg-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
                          title="Edit metadata"
                        >
                          ✎
                        </button>
                      )}
                      <button
                        onClick={() => handleUploadClick(rhythm)}
                        className="text-[10px] px-2 py-1 rounded-lg font-medium transition-colors bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30"
                      >
                        {entry ? 'Replace' : 'Upload'}
                      </button>
                      {entry && (
                        <button
                          onClick={() => content.removeEcgImage(rhythm)}
                          className="text-[10px] px-2 py-1 rounded-lg font-medium transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {entry?.note && (
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{entry.note}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────── DRUGS TAB ─ */

function DrugsTab({ content }: { content: ReturnType<typeof useTeachingContent> }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Drug>>({})

  const startEdit = (drug: Drug) => {
    setEditingId(drug.id)
    setForm({ ...drug })
  }

  const saveEdit = () => {
    if (!editingId) return
    content.updateDrug(editingId, form)
    setEditingId(null)
    setForm({})
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-white font-bold text-base">Drug Manager</p>
          <p className="text-slate-400 text-sm">แก้ไขข้อมูลยาที่แสดงใน Drug Reference panel</p>
        </div>
        <button
          onClick={content.resetDrugs}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
        >
          Reset to defaults
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {content.drugs.map((drug) => {
          const isEditing = editingId === drug.id
          return (
            <div
              key={drug.id}
              className="bg-navy-900 border border-slate-700/60 rounded-2xl overflow-hidden"
            >
              <div className="h-1" style={{ backgroundColor: drug.color }} />
              <div className="p-4">
                {isEditing ? (
                  <DrugEditForm
                    form={form}
                    onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
                    onSave={saveEdit}
                    onCancel={() => { setEditingId(null); setForm({}) }}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-bold text-sm">{drug.name}</h3>
                        <p className="text-slate-400 text-xs">{drug.nameThai}</p>
                      </div>
                      <button
                        onClick={() => startEdit(drug)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors flex-none"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-slate-400 text-xs italic mb-2">{drug.indication}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-navy-800/80 rounded-lg p-1.5">
                        <div className="text-slate-600 text-[10px]">Dose</div>
                        <div className="text-white font-bold">{drug.dose}</div>
                      </div>
                      <div className="bg-navy-800/80 rounded-lg p-1.5">
                        <div className="text-slate-600 text-[10px]">Route</div>
                        <div className="text-slate-200 font-semibold">{drug.route}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DrugEditForm({
  form,
  onChange,
  onSave,
  onCancel,
}: {
  form: Partial<Drug>
  onChange: (updates: Partial<Drug>) => void
  onSave: () => void
  onCancel: () => void
}) {
  const fields: { key: keyof Drug; label: string; multiline?: boolean }[] = [
    { key: 'name',       label: 'Name (English)' },
    { key: 'nameThai',   label: 'ชื่อไทย' },
    { key: 'indication', label: 'Indication', multiline: true },
    { key: 'dose',       label: 'Dose' },
    { key: 'route',      label: 'Route' },
    { key: 'timing',     label: 'Timing' },
    { key: 'notes',      label: 'Notes', multiline: true },
  ]

  return (
    <div className="space-y-2">
      {fields.map(({ key, label, multiline }) => (
        <div key={key}>
          <label className="text-slate-500 text-[10px] font-medium uppercase tracking-wide">{label}</label>
          {multiline ? (
            <textarea
              value={(form[key] as string) ?? ''}
              onChange={(e) => onChange({ [key]: e.target.value })}
              rows={2}
              className="w-full mt-0.5 bg-navy-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700 focus:border-teal-500 focus:outline-none resize-none"
            />
          ) : (
            <input
              type="text"
              value={(form[key] as string) ?? ''}
              onChange={(e) => onChange({ [key]: e.target.value })}
              className="w-full mt-0.5 bg-navy-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700 focus:border-teal-500 focus:outline-none"
            />
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          className="flex-1 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-bold hover:bg-teal-400 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────── SCENARIOS TAB ─ */

function makeId() {
  return 'custom-' + Math.random().toString(36).slice(2, 9)
}

function blankScenario(topicId = 'cardiac-arrest'): ScenarioDefinition {
  const topic = teachingTopics.find((t) => t.id === topicId) ?? teachingTopics[0]
  return {
    id: makeId(),
    title: '',
    titleEn: '',
    topic: topicId,
    difficulty: 'intermediate',
    description: '',
    patientLabel: '',
    initialState: { ...defaultPatientState },
    initialRhythm: topic.defaultRhythm,
    algorithmId: topic.algorithmId,
    drugIds: [],
    actionIds: [...topic.scenarioActionIds],
    objectives: [],
    discussionQuestions: [],
  }
}

function ScenariosTab() {
  const [customs, setCustoms] = useState<ScenarioDefinition[]>(loadCustomScenarios)
  const [editing, setEditing] = useState<ScenarioDefinition | null>(null)
  const [isNew, setIsNew] = useState(false)

  const save = (s: ScenarioDefinition) => {
    const updated = isNew
      ? [...customs, s]
      : customs.map((c) => (c.id === s.id ? s : c))
    setCustoms(updated)
    saveCustomScenarios(updated)
    setEditing(null)
  }

  const remove = (id: string) => {
    if (!confirm('ลบ scenario นี้?')) return
    const updated = customs.filter((c) => c.id !== id)
    setCustoms(updated)
    saveCustomScenarios(updated)
  }

  if (editing) {
    return (
      <ScenarioForm
        scenario={editing}
        onSave={save}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-base">Scenario Builder</p>
          <p className="text-slate-400 text-sm">สร้างและแก้ไข custom teaching scenarios — บันทึกใน localStorage</p>
        </div>
        <button
          onClick={() => { setIsNew(true); setEditing(blankScenario()) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold transition-colors"
        >
          <span>+</span> New Scenario
        </button>
      </div>

      {/* Built-in — cloneable to edit */}
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Built-in Scenarios ({builtInScenarios.length})</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {builtInScenarios.map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              onClone={() => {
                const clone = {
                  ...s,
                  id: `${s.id}-custom-${Date.now()}`,
                  title: `${s.title} (copy)`,
                }
                setIsNew(true)
                setEditing(clone)
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom */}
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Custom Scenarios ({customs.length})</p>
        {customs.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-sm border border-dashed border-slate-800 rounded-2xl">
            ยังไม่มี custom scenario — กด "New Scenario" เพื่อสร้าง
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {customs.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                onEdit={() => { setIsNew(false); setEditing(s) }}
                onDelete={() => remove(s.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const diffColors: Record<ScenarioDifficulty, string> = {
  beginner:     '#22c55e',
  intermediate: '#f59e0b',
  advanced:     '#ef4444',
}

function ScenarioCard({
  scenario,
  onEdit,
  onDelete,
  onClone,
}: {
  scenario: ScenarioDefinition
  onEdit?: () => void
  onDelete?: () => void
  onClone?: () => void
}) {
  const topic = teachingTopics.find((t) => t.id === scenario.topic)
  const diff = diffColors[scenario.difficulty]
  return (
    <div className="bg-navy-900 border border-slate-700/60 rounded-2xl p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm leading-tight truncate">
            {scenario.title || <span className="text-slate-500 italic">Untitled</span>}
          </div>
          <div className="text-slate-400 text-xs mt-0.5 truncate">{scenario.titleEn}</div>
        </div>
        <span
          className="flex-none text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{ color: diff, borderColor: diff + '40', backgroundColor: diff + '15' }}
        >
          {scenario.difficulty}
        </span>
      </div>

      {scenario.description && (
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{scenario.description}</p>
      )}

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        {topic && (
          <span className="px-1.5 py-0.5 rounded bg-slate-800" style={{ color: topic.color }}>{topic.shortTitle}</span>
        )}
        <span>{scenario.actionIds.length} actions</span>
        <span>{scenario.objectives.length} obj.</span>
      </div>

      {(onEdit || onClone) && (
        <div className="flex gap-1.5 mt-1">
          {onClone && (
            <button
              onClick={onClone}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-slate-400 hover:text-white hover:border-teal-500/50 hover:text-teal-300 transition-colors"
            >
              Clone &amp; Edit
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ScenarioForm({
  scenario,
  onSave,
  onCancel,
}: {
  scenario: ScenarioDefinition
  onSave: (s: ScenarioDefinition) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<ScenarioDefinition>({ ...scenario, initialState: { ...scenario.initialState } })

  const set = <K extends keyof ScenarioDefinition>(k: K, v: ScenarioDefinition[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const setState = <K extends keyof PatientState>(k: K, v: PatientState[K]) =>
    setForm((prev) => ({ ...prev, initialState: { ...prev.initialState, [k]: v } }))

  const topic = teachingTopics.find((t) => t.id === form.topic) ?? teachingTopics[0]
  const topicActions = scenarioActions.filter((a) => topic.scenarioActionIds.includes(a.id))

  const toggleAction = (id: string) => {
    set('actionIds', form.actionIds.includes(id)
      ? form.actionIds.filter((x) => x !== id)
      : [...form.actionIds, id])
  }

  const setListItem = (key: 'objectives' | 'discussionQuestions', idx: number, val: string) => {
    const arr = [...form[key]]
    arr[idx] = val
    set(key, arr)
  }

  const addListItem = (key: 'objectives' | 'discussionQuestions') =>
    set(key, [...form[key], ''])

  const removeListItem = (key: 'objectives' | 'discussionQuestions', idx: number) =>
    set(key, form[key].filter((_, i) => i !== idx))

  const inputCls = 'w-full bg-navy-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:border-teal-500 focus:outline-none'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-white font-bold">{form.title || 'New Scenario'}</p>
          <p className="text-slate-400 text-xs">Scenario Builder</p>
        </div>
        <button
          onClick={() => onSave(form)}
          disabled={!form.title.trim()}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
        >
          Save Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Basic info */}
          <Section title="Basic Info">
            <div className="space-y-2">
              <Field label="ชื่อ Scenario (ไทย)*">
                <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="เช่น VF Cardiac Arrest" />
              </Field>
              <Field label="Title (English)">
                <input className={inputCls} value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} placeholder="Ventricular Fibrillation" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Topic">
                  <select
                    className={inputCls}
                    value={form.topic}
                    onChange={(e) => {
                      const t = teachingTopics.find((x) => x.id === e.target.value)!
                      set('topic', e.target.value)
                      set('algorithmId', t.algorithmId)
                      set('actionIds', [...t.scenarioActionIds])
                      set('initialRhythm', t.defaultRhythm as RhythmType)
                    }}
                  >
                    {teachingTopics.filter((t) => !t.comingSoon).map((t) => (
                      <option key={t.id} value={t.id}>{t.shortTitle}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Difficulty">
                  <select className={inputCls} value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as ScenarioDifficulty)}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </Field>
              </div>
              <Field label="Patient Label">
                <input className={inputCls} value={form.patientLabel} onChange={(e) => set('patientLabel', e.target.value)} placeholder="เช่น ชาย 55 ปี collapse ที่ ER" />
              </Field>
              <Field label="Description">
                <textarea className={inputCls + ' resize-none'} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="สถานการณ์สั้นๆ สำหรับผู้เรียน" />
              </Field>
            </div>
          </Section>

          {/* Initial Patient State */}
          <Section title="Initial Patient State">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Consciousness">
                  <select className={inputCls} value={form.initialState.consciousness} onChange={(e) => setState('consciousness', e.target.value as PatientState['consciousness'])}>
                    <option value="alert">Alert</option>
                    <option value="verbal">Verbal</option>
                    <option value="pain">Pain</option>
                    <option value="unresponsive">Unresponsive</option>
                  </select>
                </Field>
                <Field label="Initial Rhythm">
                  <select className={inputCls} value={form.initialRhythm} onChange={(e) => set('initialRhythm', e.target.value)}>
                    {topic.rhythmOrder.map((r) => (
                      <option key={r} value={r}>{rhythmLibrary[r]?.nameEn ?? r}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Heart Rate">
                  <input className={inputCls} type="number" value={form.initialState.heartRate ?? ''} onChange={(e) => setState('heartRate', e.target.value ? Number(e.target.value) : null)} placeholder="--" />
                </Field>
                <Field label="SpO₂ (%)">
                  <input className={inputCls} type="number" value={form.initialState.spo2 ?? ''} onChange={(e) => setState('spo2', e.target.value ? Number(e.target.value) : null)} placeholder="--" />
                </Field>
                <Field label="BP (mmHg)">
                  <input className={inputCls} value={form.initialState.bloodPressure ?? ''} onChange={(e) => setState('bloodPressure', e.target.value || null)} placeholder="120/80" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {([
                  ['hasPulse',         'มีชีพจร'],
                  ['isBreathing',      'หายใจ'],
                  ['isUnresponsive',   'ไม่รู้สึกตัว'],
                  ['cprActive',        'CPR เริ่มแล้ว'],
                  ['monitorAttached',  'ติด Monitor'],
                  ['defibPadsAttached','ติด Defib Pads'],
                ] as [keyof PatientState, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.initialState[key]}
                      onChange={(e) => setState(key, e.target.checked as never)}
                      className="w-3.5 h-3.5 rounded accent-teal-500"
                    />
                    <span className="text-slate-300 text-xs">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Objectives */}
          <Section title="Teaching Objectives">
            <div className="space-y-1.5">
              {form.objectives.map((obj, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    className={inputCls + ' flex-1'}
                    value={obj}
                    onChange={(e) => setListItem('objectives', i, e.target.value)}
                    placeholder={`Objective ${i + 1}`}
                  />
                  <button onClick={() => removeListItem('objectives', i)} className="text-slate-600 hover:text-red-400 text-sm w-6 flex-none">✕</button>
                </div>
              ))}
              <button onClick={() => addListItem('objectives')} className="text-teal-400 hover:text-teal-300 text-xs font-medium">+ Add objective</button>
            </div>
          </Section>

          {/* Discussion Questions */}
          <Section title="Discussion Questions">
            <div className="space-y-1.5">
              {form.discussionQuestions.map((q, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    className={inputCls + ' flex-1'}
                    value={q}
                    onChange={(e) => setListItem('discussionQuestions', i, e.target.value)}
                    placeholder={`Question ${i + 1}`}
                  />
                  <button onClick={() => removeListItem('discussionQuestions', i)} className="text-slate-600 hover:text-red-400 text-sm w-6 flex-none">✕</button>
                </div>
              ))}
              <button onClick={() => addListItem('discussionQuestions')} className="text-teal-400 hover:text-teal-300 text-xs font-medium">+ Add question</button>
            </div>
          </Section>

          {/* Actions */}
          <Section title={`Scenario Actions (${form.actionIds.length}/${topicActions.length})`}>
            <p className="text-slate-500 text-[10px] mb-2">เลือก actions ที่จะแสดงใน scenario นี้</p>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {topicActions.map((action) => (
                <label key={action.id} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-slate-800/30 rounded px-1">
                  <input
                    type="checkbox"
                    checked={form.actionIds.includes(action.id)}
                    onChange={() => toggleAction(action.id)}
                    className="w-3.5 h-3.5 rounded accent-teal-500 flex-none"
                  />
                  <span className="text-base flex-none">{action.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200 text-xs font-medium leading-tight truncate">{action.label}</div>
                    <div className="text-slate-500 text-[10px] truncate">{action.labelEn}</div>
                  </div>
                </label>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-navy-900 border border-slate-700/60 rounded-2xl p-4">
      <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5 block">{label}</label>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────── TOPICS TAB ─ */

function TopicsTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="mb-2">
        <p className="text-white font-bold text-base">Teaching Topics</p>
        <p className="text-slate-400 text-sm">ข้อมูล topics และ configuration — อ่านได้อย่างเดียว (แก้ไขใน code)</p>
      </div>
      {teachingTopics.map((topic) => (
        <div key={topic.id} className="bg-navy-900 border border-slate-700/60 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-3 h-3 rounded-full flex-none mt-1"
              style={{ backgroundColor: topic.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-sm">{topic.title}</h3>
                {topic.comingSoon && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mb-3">{topic.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <InfoCard label="Algorithm" value={topic.algorithmId} />
                <InfoCard label="Default Rhythm" value={topic.defaultRhythm} />
                <InfoCard label="Drugs" value={`${topic.drugIds.length} drugs`} />
                <InfoCard label="Actions" value={`${topic.scenarioActionIds.length} actions`} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {topic.rhythmOrder.map((r) => (
                  <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy-800/80 rounded-lg p-2">
      <div className="text-slate-600 text-[10px] mb-0.5">{label}</div>
      <div className="text-slate-200 font-semibold text-xs truncate">{value}</div>
    </div>
  )
}

/* ─────────────────────────────────────── ACTIONS TAB ─ */

const MX_GROUP_IDS = new Set([
  'medication', 'ht-hypovolemia', 'ht-acidosis', 'ht-hypothermia',
  'ht-ptx', 'ht-tamponade', 'ht-toxins', 'ht-thrombosis',
])

const mxGroups = ACTION_LIBRARY_GROUPS.filter(g => MX_GROUP_IDS.has(g.id))
const mxActionIds = new Set(mxGroups.flatMap(g => g.actionIds))

function ActionsTab() {
  const [viewMode, setViewMode] = useState<'topic' | 'mx'>('topic')
  const [selectedTopicId, setSelectedTopicId] = useState(teachingTopics[0].id)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, ActionTeachingOverride>>(() => loadActionOverrides())
  const [draftFindings, setDraftFindings] = useState('')
  const [draftNote, setDraftNote] = useState('')
  const [draftWarning, setDraftWarning] = useState('')

  const topic = teachingTopics.find((t) => t.id === selectedTopicId)!
  const allIds = [...new Set([...commonBaseActionIds, ...topic.scenarioActionIds])]
  const topicActions = scenarioActions.filter((a) => allIds.includes(a.id))
  const displayActions = viewMode === 'mx'
    ? scenarioActions.filter(a => mxActionIds.has(a.id))
    : topicActions

  const categoryColors: Record<string, string> = {
    assessment:    '#3b82f6',
    resuscitation: '#f97316',
    device:        '#8b5cf6',
    medication:    '#14b8a6',
    outcome:       '#22c55e',
  }

  const openEdit = (actionId: string) => {
    const action = scenarioActions.find((a) => a.id === actionId)!
    const ov = overrides[actionId]
    setDraftFindings((ov?.findings ?? action.findings ?? []).join('\n'))
    setDraftNote(ov?.teachingNote ?? action.notesThai?.discussionQuestion ?? '')
    setDraftWarning(ov?.warning ?? '')
    setEditingId(actionId)
  }

  const saveEdit = () => {
    if (!editingId) return
    const next: ActionTeachingOverride = {
      findings: draftFindings.split('\n').map((l) => l.trim()).filter(Boolean),
      teachingNote: draftNote.trim() || undefined,
      warning: draftWarning.trim() || undefined,
    }
    const updated = { ...overrides, [editingId]: next }
    setOverrides(updated)
    saveActionOverrides(updated)
    setEditingId(null)
  }

  const resetOverride = (actionId: string) => {
    const { [actionId]: _, ...rest } = overrides
    setOverrides(rest)
    saveActionOverrides(rest)
    if (editingId === actionId) setEditingId(null)
  }

  const editingAction = editingId ? scenarioActions.find((a) => a.id === editingId) : null

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="mb-2">
        <p className="text-white font-bold text-base">Scenario Actions</p>
        <p className="text-slate-400 text-sm">คลิก action เพื่อแก้ไข popup teaching content — overrides บันทึกใน localStorage</p>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-2 mb-1">
        <button
          onClick={() => { setViewMode('topic'); setEditingId(null) }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${viewMode === 'topic' ? 'bg-teal-500/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
        >
          ⚕ By Topic
        </button>
        <button
          onClick={() => { setViewMode('mx'); setEditingId(null) }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${viewMode === 'mx' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
        >
          💊 Mx Actions
        </button>
      </div>

      {/* Topic selector (only in topic mode) */}
      {viewMode === 'topic' && (
        <div className="flex gap-2 flex-wrap">
          {teachingTopics.filter((t) => !t.comingSoon).map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTopicId(t.id); setEditingId(null) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedTopicId === t.id
                  ? 'text-white'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              style={selectedTopicId === t.id ? { borderColor: t.color + '60', backgroundColor: t.color + '20', color: t.color } : {}}
            >
              {t.shortTitle}
            </button>
          ))}
        </div>
      )}

      {/* Mx group headers (only in mx mode) */}
      {viewMode === 'mx' && (
        <div className="text-slate-500 text-xs mb-1">
          {mxGroups.length} กลุ่ม · {mxActionIds.size} actions
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {displayActions.map((action) => {
          const hasOverride = !!overrides[action.id]
          const isEditing = editingId === action.id

          return (
            <div key={action.id} className={`bg-navy-900 border rounded-xl overflow-hidden transition-all ${isEditing ? 'border-teal-500/50' : 'border-slate-700/60'}`}>
              {/* Action header row */}
              <button
                onClick={() => isEditing ? setEditingId(null) : openEdit(action.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-800/40 transition-colors"
              >
                <span className="text-xl flex-none">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{action.label}</div>
                  <div className="text-slate-400 text-xs">{action.labelEn}</div>
                </div>
                {hasOverride && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30 flex-none">
                    edited
                  </span>
                )}
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-none"
                  style={{
                    backgroundColor: (categoryColors[action.category] ?? '#64748b') + '20',
                    color: categoryColors[action.category] ?? '#94a3b8',
                    borderColor: (categoryColors[action.category] ?? '#64748b') + '40',
                    border: '1px solid',
                  }}
                >
                  {action.category}
                </span>
                <svg className={`w-3.5 h-3.5 flex-none text-slate-500 transition-transform ${isEditing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Inline editor */}
              {isEditing && editingAction && (
                <div className="border-t border-teal-500/20 px-4 py-4 space-y-4 bg-slate-900/40">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Findings (one per line)
                    </label>
                    <textarea
                      rows={4}
                      value={draftFindings}
                      onChange={(e) => setDraftFindings(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono resize-y focus:outline-none focus:border-teal-500/60"
                      placeholder={`${editingAction.label}\nผล 1\nผล 2\n...`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Teaching Note
                    </label>
                    <textarea
                      rows={2}
                      value={draftNote}
                      onChange={(e) => setDraftNote(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm resize-y focus:outline-none focus:border-teal-500/60"
                      placeholder="คำถามหรือ teaching point สำหรับผู้เรียน..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Warning (optional)
                    </label>
                    <input
                      type="text"
                      value={draftWarning}
                      onChange={(e) => setDraftWarning(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/60"
                      placeholder="คำเตือนพิเศษ (แสดงสีเหลือง)..."
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-colors"
                    >
                      บันทึก
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold border border-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      ยกเลิก
                    </button>
                    {hasOverride && (
                      <button
                        onClick={() => resetOverride(action.id)}
                        className="ml-auto px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                      >
                        รีเซ็ตเป็นค่าเริ่มต้น
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── References Tab ──────────────────────────────────────────────────────────

// Default htDetail mirrored from CausesPanel for admin editing
const DEFAULT_CAUSE_DETAIL: Record<string, { findings: string[]; treatment: string[] }> = {
  hypovolemia:  { findings: ['Flat neck veins', 'Weak/absent pulse', 'Trauma, bleeding, dehydration Hx'], treatment: ['IV/IO fluid bolus 1–2 L', 'Control bleeding source', 'Blood products if needed'] },
  hypoxia:      { findings: ['SpO₂ < 90%', 'Cyanosis', 'Absent breath sounds', 'Airway obstruction'], treatment: ['100% O₂ via BVM or ETT', 'Suction airway', 'Confirm tube placement'] },
  acidosis:     { findings: ['DKA, sepsis, renal failure Hx', 'Kussmaul breathing (if conscious)', 'ABG: pH < 7.35'], treatment: ['Treat underlying cause', 'NaHCO₃ 1–2 mEq/kg if pH < 7.1', 'Hyperventilation (ETT)'] },
  hyperkalemia: { findings: ['Renal failure, K+ supplement Hx', 'Peaked T waves, wide QRS on ECG', 'Serum K+ > 5.5 mEq/L'], treatment: ['Calcium gluconate 1 g IV (cardiac membrane stabilization)', 'Insulin + D50 IV', 'Sodium bicarbonate, Kayexalate'] },
  hypothermia:  { findings: ['Core temp < 30°C (severe)', 'Exposure, cold water Hx', 'J-wave (Osborn wave) on ECG'], treatment: ['Passive/active rewarming', 'Warm IV fluids 42°C', 'ECMO if refractory arrest'] },
  pneumothorax: { findings: ['Absent breath sounds (unilateral)', 'Tracheal deviation (late sign)', 'Neck vein distension', 'Mechanism: trauma, ventilated patient'], treatment: ['Needle decompression: 2nd ICS MCL', 'Chest tube (28–32 Fr)', 'Do NOT delay for CXR if unstable'] },
  tamponade:    { findings: ["Beck's triad: JVD + Hypotension + Muffled heart sounds", 'Low voltage on ECG', 'Electrical alternans', 'ECHO: pericardial effusion'], treatment: ['Pericardiocentesis (subxiphoid approach)', 'Surgical drainage if needed', 'IV fluid bolus to increase preload temporarily'] },
  toxins:       { findings: ['Known ingestion or exposure Hx', 'Pinpoint/dilated pupils', 'Toxidrome pattern (SLUDGE, sympathomimetic)'], treatment: ['Call Poison Control / Tox consult', 'Naloxone (opioids)', 'Atropine (organophosphates)', 'Lipid emulsion (lipophilic drugs)'] },
  pe:           { findings: ['Sudden hypoxia + hypotension', 'S1Q3T3 on ECG', 'Right heart strain (ECHO)', 'Risk: DVT, immobility, malignancy'], treatment: ['Systemic thrombolytics (tPA 100 mg over 2h)', 'Surgical embolectomy if thrombolytics fail', 'Anticoagulation post-arrest'] },
  mi:           { findings: ['ST elevation in ≥2 contiguous leads', 'New LBBB', 'Reciprocal changes', 'Chest pain Hx (may be absent in arrest)'], treatment: ['Immediate PCI (door-to-balloon < 90 min)', 'Thrombolytics if PCI unavailable', 'Aspirin + Heparin + P2Y12 inhibitor'] },
}

function ReferencesTab() {
  const [section, setSection] = useState<'hsts' | 'roles' | 'detail'>('hsts')
  const htImgRef = useRef<HTMLInputElement>(null)
  const roleImgRef = useRef<HTMLInputElement>(null)

  // H's & T's state
  const [htOverrides, setHtOverrides] = useState(() => loadHtOverrides())
  const [htEditId, setHtEditId] = useState<string | null>(null)
  const [htDraft, setHtDraft] = useState({ nameThai: '', nameEn: '', treatmentThai: '', imageDataUrl: '' })

  const openHtEdit = (id: string) => {
    const base = allHtCauses.find(c => c.id === id)!
    const ov = htOverrides[id] ?? {}
    setHtDraft({
      nameThai:      ov.nameThai      ?? base.nameThai,
      nameEn:        ov.nameEn        ?? base.nameEn,
      treatmentThai: ov.treatmentThai ?? base.treatmentThai,
      imageDataUrl:  ov.imageDataUrl  ?? '',
    })
    setHtEditId(id)
  }

  const saveHt = () => {
    if (!htEditId) return
    const next = {
      ...htOverrides,
      [htEditId]: {
        nameThai:      htDraft.nameThai.trim() || undefined,
        nameEn:        htDraft.nameEn.trim() || undefined,
        treatmentThai: htDraft.treatmentThai.trim() || undefined,
        imageDataUrl:  htDraft.imageDataUrl || undefined,
      },
    }
    setHtOverrides(next)
    saveHtOverrides(next)
    setHtEditId(null)
  }

  const resetHt = (id: string) => {
    const { [id]: _, ...rest } = htOverrides
    setHtOverrides(rest)
    saveHtOverrides(rest)
    if (htEditId === id) setHtEditId(null)
  }

  const handleHtImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setHtDraft(d => ({ ...d, imageDataUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Team Roles state
  const [roleOverrides, setRoleOverrides] = useState(() => loadRoleOverrides())
  const [roleEditId, setRoleEditId] = useState<string | null>(null)
  const [roleDraft, setRoleDraft] = useState({ title: '', titleEn: '', responsibilities: '', imageDataUrl: '' })

  const openRoleEdit = (id: string) => {
    const base = defaultRoles.find(r => r.id === id)!
    const ov = roleOverrides[id] ?? {}
    setRoleDraft({
      title:            ov.title ?? base.title,
      titleEn:          ov.titleEn ?? base.titleEn,
      responsibilities: (ov.responsibilities ?? base.responsibilities).join('\n'),
      imageDataUrl:     ov.imageDataUrl ?? '',
    })
    setRoleEditId(id)
  }

  const saveRole = () => {
    if (!roleEditId) return
    const next = {
      ...roleOverrides,
      [roleEditId]: {
        title:            roleDraft.title.trim() || undefined,
        titleEn:          roleDraft.titleEn.trim() || undefined,
        responsibilities: roleDraft.responsibilities.split('\n').map(l => l.trim()).filter(Boolean),
        imageDataUrl:     roleDraft.imageDataUrl || undefined,
      },
    }
    setRoleOverrides(next)
    saveRoleOverrides(next)
    setRoleEditId(null)
  }

  const resetRole = (id: string) => {
    const { [id]: _, ...rest } = roleOverrides
    setRoleOverrides(rest)
    saveRoleOverrides(rest)
    if (roleEditId === id) setRoleEditId(null)
  }

  const handleRoleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setRoleDraft(d => ({ ...d, imageDataUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Cause detail (Scenario H's & T's) state
  const [detailOverrides, setDetailOverrides] = useState(() => loadCauseDetailOverrides())
  const [detailEditId, setDetailEditId] = useState<string | null>(null)
  const [detailDraft, setDetailDraft] = useState({ findings: '', treatment: '' })

  const openDetailEdit = (id: string) => {
    const base = DEFAULT_CAUSE_DETAIL[id] ?? { findings: [], treatment: [] }
    const ov = detailOverrides[id] ?? {}
    setDetailDraft({
      findings:  (ov.findings  ?? base.findings).join('\n'),
      treatment: (ov.treatment ?? base.treatment).join('\n'),
    })
    setDetailEditId(id)
  }

  const saveDetail = () => {
    if (!detailEditId) return
    const next = {
      ...detailOverrides,
      [detailEditId]: {
        findings:  detailDraft.findings.split('\n').map(l => l.trim()).filter(Boolean),
        treatment: detailDraft.treatment.split('\n').map(l => l.trim()).filter(Boolean),
      },
    }
    setDetailOverrides(next)
    saveCauseDetailOverrides(next)
    setDetailEditId(null)
  }

  const resetDetail = (id: string) => {
    const { [id]: _, ...rest } = detailOverrides
    setDetailOverrides(rest)
    saveCauseDetailOverrides(rest)
    if (detailEditId === id) setDetailEditId(null)
  }

  const fieldCls = "w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/60"

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <p className="text-white font-bold text-base">Reference Content</p>
        <p className="text-slate-400 text-sm">แก้ไขเนื้อหา H's & T's, Team Roles, และ Scenario cause detail — บันทึกใน localStorage</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSection('hsts')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${section === 'hsts' ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}>
          🔍 H's & T's (Reference)
        </button>
        <button onClick={() => setSection('detail')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${section === 'detail' ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}>
          📋 Scenario H's & T's
        </button>
        <button onClick={() => setSection('roles')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${section === 'roles' ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}>
          👥 Team Roles
        </button>
      </div>

      {/* Hidden file inputs */}
      <input ref={htImgRef} type="file" accept="image/*" className="hidden" onChange={handleHtImage} />
      <input ref={roleImgRef} type="file" accept="image/*" className="hidden" onChange={handleRoleImage} />

      {section === 'hsts' && (
        <div className="space-y-2">
          {allHtCauses.map(cause => {
            const hasOv = !!htOverrides[cause.id]
            const isEditing = htEditId === cause.id
            const display = { ...cause, ...htOverrides[cause.id] }
            return (
              <div key={cause.id} className={`bg-navy-900 border rounded-xl overflow-hidden ${isEditing ? 'border-orange-500/40' : 'border-slate-700/60'}`}>
                <button onClick={() => isEditing ? setHtEditId(null) : openHtEdit(cause.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-800/40 transition-colors">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-none ${cause.letter === 'H' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{cause.letter}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">{display.nameThai}</div>
                    <div className="text-slate-400 text-xs">{display.nameEn} · <span className="text-teal-400">→ {display.treatmentThai}</span></div>
                  </div>
                  {htOverrides[cause.id]?.imageDataUrl && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-none">📷</span>}
                  {hasOv && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex-none">edited</span>}
                  <svg className={`w-3.5 h-3.5 flex-none text-slate-500 transition-transform ${isEditing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isEditing && (
                  <div className="border-t border-orange-500/20 px-4 py-4 space-y-3 bg-slate-900/40">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">ชื่อภาษาไทย</label>
                        <input value={htDraft.nameThai} onChange={e => setHtDraft(d => ({ ...d, nameThai: e.target.value }))} className={fieldCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">English Name</label>
                        <input value={htDraft.nameEn} onChange={e => setHtDraft(d => ({ ...d, nameEn: e.target.value }))} className={fieldCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">การรักษา (Treatment)</label>
                      <input value={htDraft.treatmentThai} onChange={e => setHtDraft(d => ({ ...d, treatmentThai: e.target.value }))} className={fieldCls} />
                    </div>
                    {/* Photo guideline upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Photo Guideline (optional)</label>
                      {htDraft.imageDataUrl ? (
                        <div className="relative group w-full rounded-lg overflow-hidden border border-slate-700">
                          <img src={htDraft.imageDataUrl} alt="guideline" className="w-full max-h-48 object-contain bg-slate-950" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button type="button" onClick={() => htImgRef.current?.click()} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 text-white hover:bg-teal-400 transition-colors">Replace</button>
                            <button type="button" onClick={() => setHtDraft(d => ({ ...d, imageDataUrl: '' }))} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/80 text-white hover:bg-red-500 transition-colors">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => htImgRef.current?.click()} className="w-full h-24 rounded-lg border border-dashed border-slate-600 hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-orange-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-xs font-medium">อัปโหลดรูป guideline</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={saveHt} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-colors">บันทึก</button>
                      <button onClick={() => setHtEditId(null)} className="px-4 py-1.5 rounded-lg text-sm font-semibold border border-slate-700 text-slate-400 hover:text-white transition-colors">ยกเลิก</button>
                      {hasOv && <button onClick={() => resetHt(cause.id)} className="ml-auto px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors">รีเซ็ต</button>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {section === 'detail' && (
        <div className="space-y-2">
          <p className="text-slate-500 text-xs">Key Findings และ Treatment ที่แสดงใน <strong className="text-slate-400">Scenario teaching panel</strong> (H's & T's ใน Teaching Mode) — แยกจาก Reference page</p>
          {allHtCauses.map(cause => {
            const hasOv = !!detailOverrides[cause.id]
            const isEditing = detailEditId === cause.id
            const base = DEFAULT_CAUSE_DETAIL[cause.id] ?? { findings: [], treatment: [] }
            const ov = detailOverrides[cause.id] ?? {}
            const findings  = ov.findings  ?? base.findings
            const treatment = ov.treatment ?? base.treatment
            return (
              <div key={cause.id} className={`bg-navy-900 border rounded-xl overflow-hidden ${isEditing ? 'border-blue-500/40' : 'border-slate-700/60'}`}>
                <button onClick={() => isEditing ? setDetailEditId(null) : openDetailEdit(cause.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-800/40 transition-colors">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-none ${cause.letter === 'H' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{cause.letter}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">{cause.nameEn} <span className="text-slate-500 font-normal text-xs">· {cause.nameThai}</span></div>
                    <div className="text-slate-500 text-xs">{findings.length} findings · {treatment.length} treatments</div>
                  </div>
                  {hasOv && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-none">edited</span>}
                  <svg className={`w-3.5 h-3.5 flex-none text-slate-500 transition-transform ${isEditing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isEditing && (
                  <div className="border-t border-blue-500/20 px-4 py-4 space-y-3 bg-slate-900/40">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Key Findings (one per line)</label>
                      <textarea rows={4} value={detailDraft.findings} onChange={e => setDetailDraft(d => ({ ...d, findings: e.target.value }))} className={`${fieldCls} font-mono resize-y`} placeholder={'Flat neck veins\nWeak/absent pulse\n...'} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Treatment (one per line)</label>
                      <textarea rows={4} value={detailDraft.treatment} onChange={e => setDetailDraft(d => ({ ...d, treatment: e.target.value }))} className={`${fieldCls} font-mono resize-y`} placeholder={'IV/IO fluid bolus 1–2 L\nControl bleeding\n...'} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={saveDetail} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-colors">บันทึก</button>
                      <button onClick={() => setDetailEditId(null)} className="px-4 py-1.5 rounded-lg text-sm font-semibold border border-slate-700 text-slate-400 hover:text-white transition-colors">ยกเลิก</button>
                      {hasOv && <button onClick={() => resetDetail(cause.id)} className="ml-auto px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors">รีเซ็ต</button>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {section === 'roles' && (
        <div className="space-y-2">
          {defaultRoles.map(role => {
            const hasOv = !!roleOverrides[role.id]
            const isEditing = roleEditId === role.id
            const ov = roleOverrides[role.id] ?? {}
            const display = { ...role, ...ov }
            return (
              <div key={role.id} className={`bg-navy-900 border rounded-xl overflow-hidden ${isEditing ? 'border-green-500/40' : 'border-slate-700/60'}`}>
                <button onClick={() => isEditing ? setRoleEditId(null) : openRoleEdit(role.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-800/40 transition-colors">
                  <span className="text-xl flex-none">{role.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">{display.title}</div>
                    <div className="text-slate-400 text-xs">{display.titleEn} · {(ov.responsibilities ?? role.responsibilities).length} responsibilities</div>
                  </div>
                  {ov.imageDataUrl && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-none">📷</span>}
                  {hasOv && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex-none">edited</span>}
                  <svg className={`w-3.5 h-3.5 flex-none text-slate-500 transition-transform ${isEditing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isEditing && (
                  <div className="border-t border-green-500/20 px-4 py-4 space-y-3 bg-slate-900/40">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">ชื่อบทบาท (ไทย)</label>
                        <input value={roleDraft.title} onChange={e => setRoleDraft(d => ({ ...d, title: e.target.value }))} className={fieldCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Role Name (English)</label>
                        <input value={roleDraft.titleEn} onChange={e => setRoleDraft(d => ({ ...d, titleEn: e.target.value }))} className={fieldCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Responsibilities (one per line)</label>
                      <textarea rows={5} value={roleDraft.responsibilities} onChange={e => setRoleDraft(d => ({ ...d, responsibilities: e.target.value }))} className={`${fieldCls} font-mono resize-y`} />
                    </div>
                    {/* Photo guideline upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Photo Guideline (optional)</label>
                      {roleDraft.imageDataUrl ? (
                        <div className="relative group w-full rounded-lg overflow-hidden border border-slate-700">
                          <img src={roleDraft.imageDataUrl} alt="guideline" className="w-full max-h-48 object-contain bg-slate-950" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button type="button" onClick={() => roleImgRef.current?.click()} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 text-white hover:bg-teal-400 transition-colors">Replace</button>
                            <button type="button" onClick={() => setRoleDraft(d => ({ ...d, imageDataUrl: '' }))} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/80 text-white hover:bg-red-500 transition-colors">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => roleImgRef.current?.click()} className="w-full h-24 rounded-lg border border-dashed border-slate-600 hover:border-green-500/50 hover:bg-green-500/5 transition-colors flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-green-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-xs font-medium">อัปโหลดรูป guideline</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={saveRole} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-colors">บันทึก</button>
                      <button onClick={() => setRoleEditId(null)} className="px-4 py-1.5 rounded-lg text-sm font-semibold border border-slate-700 text-slate-400 hover:text-white transition-colors">ยกเลิก</button>
                      {hasOv && <button onClick={() => resetRole(role.id)} className="ml-auto px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors">รีเซ็ต</button>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

