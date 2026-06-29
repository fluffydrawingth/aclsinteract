import { useState, useCallback, useEffect, useRef } from 'react'
import { useScenarioState } from '../hooks/useScenarioState'
import { useAlgorithmLibrary } from '../hooks/useAlgorithmLibrary'
import { usePanelManager, PanelId } from '../hooks/usePanelManager'
import { useTeachingBoard } from '../hooks/useTeachingBoard'
import { useTeachingContent } from '../hooks/useTeachingContent'
import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { teachingTopics, TeachingTopicId, TeachingTopic, getTopicById } from '../data/teachingTopics'
import { getScenariosByTopic } from '../data/scenarioLibrary'
import WorkspaceToolbar from '../components/workspace/WorkspaceToolbar'
import TopicBar from '../components/workspace/TopicBar'
import FloatingPanel from '../components/workspace/FloatingPanel'
import ScenarioActionPanel from '../components/workspace/ScenarioActionPanel'
import MxPanel from '../components/workspace/MxPanel'
import ScenarioCanvas from '../components/scenario/ScenarioCanvas'
import SceneAssetPanel from '../components/scenario/SceneAssetPanel'
import FindingsPanel from '../components/scenario/FindingsPanel'
import ScenarioSelector from '../components/scenario/ScenarioSelector'
import EventTimeline from '../components/timeline/EventTimeline'
import MonitorPanel from '../components/monitor/MonitorPanel'
import AlgorithmLibrary from '../components/algorithm/AlgorithmLibrary'
import TeachingNotes from '../components/notes/TeachingNotes'
import DrugReference from '../components/tools/DrugReference'
import CausesPanel from '../components/tools/CausesPanel'
import CodeTimer from '../components/tools/CodeTimer'
import TeachingBoard from '../components/teaching-board/TeachingBoard'

const TOOLBAR_H  = 48
const TOPIC_H    = 44
const TOP_H      = TOOLBAR_H + TOPIC_H
const TIMELINE_H = 88
const RIGHT_W    = 320
const MONITOR_H  = 260
const DOCK_W     = 300

interface Props {
  onHome: () => void
  onReference: () => void
  onAdmin: () => void
}

function hstsPanelLabel(topicId: TeachingTopicId) {
  if (topicId === 'bradycardia') return 'Brady Causes'
  if (topicId === 'tachycardia') return 'Tachy Assessment'
  return "H's & T's"
}

const panelMeta: Record<PanelId, { title: string; icon: string; color: string }> = {
  algorithm: { title: 'Algorithm',      icon: '🗺', color: '#14b8a6' },
  board:     { title: 'Teaching Board', icon: '🖼', color: '#a855f7' },
  notes:     { title: 'Teaching Notes', icon: '📝', color: '#eab308' },
  drugs:     { title: 'Drug Reference', icon: '💊', color: '#8b5cf6' },
  hsts:      { title: "H's & T's",     icon: '🔍', color: '#f97316' },
  timer:     { title: 'Code Timer',     icon: '⏱', color: '#22c55e' },
}

export default function TeachingMode({ onHome, onReference, onAdmin }: Props) {
  const [activeTopicId, setActiveTopicId] = useState<TeachingTopicId>('cardiac-arrest')
  const [showScenarioSelector, setShowScenarioSelector] = useState(false)
  const [rightTab, setRightTab] = useState<'actions' | 'scene' | 'mx'>('actions')
  const [showHtCauses, setShowHtCauses] = useState(false)
  const [showUnstable, setShowUnstable] = useState(false)
  const activeTopic: TeachingTopic = getTopicById(activeTopicId)

  const scenario = useScenarioState(activeTopic)
  const library  = useAlgorithmLibrary()
  const panels   = usePanelManager()
  const board    = useTeachingBoard()
  const content  = useTeachingContent()
  const scene    = useSceneVisibility()

  // CPR cycle timer state (lifted so EpiTimer can share it)
  const [cprElapsed, setCprElapsed] = useState(0)
  const [cprRunning, setCprRunning] = useState(false)

  // Epinephrine timer — tracks scenario-elapsed seconds at time of dose
  const [epiElapsedSnapshot, setEpiElapsedSnapshot] = useState<number | null>(null)

  // Assessment action → notification text (derived from patient state)
  const [assessNotif, setAssessNotif] = useState<{ text: string; sub?: string; icon: string } | null>(null)
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ASSESSMENT_RESPONSES: Record<string, (s: typeof scenario.patientState) => { text: string; sub?: string; icon: string }> = {
    'check-responsiveness': (s) => s.isUnresponsive
      ? { text: 'ไม่รู้สึกตัว', sub: 'ไม่ตอบสนองต่อการกระตุ้น', icon: '🤚' }
      : { text: 'ตอบสนองได้', sub: `Consciousness: ${s.consciousness}`, icon: '🤚' },
    'check-pulse': (s) => !s.hasPulse
      ? { text: 'คลำชีพจรไม่ได้', sub: 'ไม่มีชีพจรที่ carotid — เริ่ม CPR ทันที', icon: '🫀' }
      : { text: 'คลำชีพจรได้', sub: `HR ${s.heartRate ?? '--'} bpm`, icon: '🫀' },
    'check-breathing': (s) => !s.isBreathing
      ? { text: 'ไม่หายใจ / Gasping', sub: 'Agonal breathing — ให้ rescue breathing', icon: '🫁' }
      : { text: 'หายใจได้', sub: `SpO₂ ${s.spo2 != null ? s.spo2 + '%' : '--'}`, icon: '🫁' },
    'repeat-vitals': (s) => ({
      text: 'Vital Signs',
      sub: `HR ${s.heartRate ?? '--'} · SpO₂ ${s.spo2 != null ? s.spo2 + '%' : '--'} · BP ${s.bloodPressure ?? '--'}`,
      icon: '📊',
    }),
  }

  // Unified action handler: fire scenario logic + apply asset mapping immediately
  const handleAction = useCallback((actionId: string) => {
    scenario.applyAction(actionId)
    scene.applyActionMapping(actionId)
    if (actionId === 'epinephrine') setEpiElapsedSnapshot(cprElapsed)
    const respFn = ASSESSMENT_RESPONSES[actionId]
    if (respFn) {
      const notif = respFn(scenario.patientState)
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current)
      setAssessNotif(notif)
      notifTimerRef.current = setTimeout(() => setAssessNotif(null), 4000)
    }
  }, [scenario.applyAction, scenario.patientState, scene.applyActionMapping, cprElapsed]) // eslint-disable-line react-hooks/exhaustive-deps

  const openPanelIds = new Set(
    panels.panels.filter((p) => p.isOpen).map((p) => p.id)
  )

  // If any panel is docked, shift patient canvas left margin
  const anyDocked = panels.panels.some((p) => p.isOpen && p.isDocked)
  const canvasLeft = anyDocked ? DOCK_W : 0

  const handleSelectTopic = useCallback((id: TeachingTopicId) => {
    if (id === activeTopicId) return
    scenario.resetScenario()
    scene.resetScene()
    setActiveTopicId(id)
    const topic = teachingTopics.find((t) => t.id === id)
    if (topic) library.setActiveAlgorithmId(topic.algorithmId)
  }, [activeTopicId, scenario, library])

  const dynamicPanelMeta = {
    ...panelMeta,
    hsts: { ...panelMeta.hsts, title: hstsPanelLabel(activeTopicId) },
  }

  return (
    <div className="fixed inset-0 bg-navy-950 overflow-hidden">

      {/* ── ASSESSMENT NOTIFICATION ─────────────────────── */}
      {assessNotif && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] pointer-events-none"
          style={{ animation: 'fadeInDown 0.2s ease' }}
        >
          <div className="bg-navy-800 border border-teal-500/50 rounded-2xl shadow-2xl shadow-black/60 px-6 py-4 flex items-center gap-4 min-w-[260px] max-w-sm">
            <span className="text-3xl flex-none">{assessNotif.icon}</span>
            <div>
              <div className="text-white font-bold text-lg leading-tight">{assessNotif.text}</div>
              {assessNotif.sub && <div className="text-slate-400 text-sm mt-0.5">{assessNotif.sub}</div>}
            </div>
            <div className="ml-auto w-1 self-stretch rounded-full bg-teal-500/60 flex-none" />
          </div>
        </div>
      )}

      {/* ── TOP TOOLBAR + TOPIC BAR ─────────────────────── */}
      <WorkspaceToolbar
        openPanelIds={openPanelIds}
        onTogglePanel={panels.togglePanel}
        activeTopic={activeTopic}
        onHome={onHome}
        onReference={onReference}
        onAdmin={onAdmin}
      />
      <TopicBar
        activeTopic={activeTopic}
        onSelectTopic={handleSelectTopic}
        scenarioStarted={scenario.scenarioStarted}
        scenarioPaused={scenario.scenarioPaused}
        eventCount={scenario.events.length}
        focusedEventIndex={scenario.focusedEventIndex}
        onStart={scenario.startScenario}
        onPause={scenario.pauseScenario}
        onResume={scenario.resumeScenario}
        onReset={() => { scenario.resetScenario(); scene.resetScene(); setEpiElapsedSnapshot(null); setCprElapsed(0); setCprRunning(false) }}
        onPrevEvent={scenario.prevEvent}
        onNextEvent={() => scenario.nextEvent(scenario.events.length)}
      />

      {/* ── PATIENT SCENE ───────────────────────────────── */}
      <div
        className="absolute overflow-hidden transition-all duration-300"
        style={{ top: TOP_H, bottom: TIMELINE_H, left: canvasLeft, right: RIGHT_W }}
      >
        {/* "Choose scenario" overlay shown before starting */}
        {!scenario.scenarioStarted && !showScenarioSelector && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center gap-4">
              <button
                className="group flex flex-col items-center gap-3"
                onClick={() => setShowScenarioSelector(true)}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: activeTopic.color + '25', border: `2px solid ${activeTopic.color}60` }}
                >
                  <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" style={{ color: activeTopic.color }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-xl">เลือก Scenario</div>
                  <div className="text-slate-400 text-sm mt-0.5">{activeTopic.title}</div>
                </div>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const pool = getScenariosByTopic(activeTopicId)
                    if (pool.length > 0) {
                      const s = pool[Math.floor(Math.random() * pool.length)]
                      scenario.loadScenario(s)
                      library.setActiveAlgorithmId(s.algorithmId || activeTopic.algorithmId)
                      scenario.startScenario()
                    } else {
                      scenario.startScenario()
                    }
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-sm border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-colors"
                >
                  🎲 สุ่ม Case
                </button>
                <button
                  onClick={scenario.startScenario}
                  className="text-slate-500 hover:text-slate-300 text-xs underline underline-offset-2 transition-colors"
                >
                  เริ่มเปล่า
                </button>
              </div>
            </div>
          </div>
        )}

        <ScenarioCanvas
          state={scenario.patientState}
          patientLabel={scenario.selectedScenario?.patientLabel ?? activeTopic.patientProfile.label}
          assets={scene.assets}
          visibleIds={scene.visibleIds}
          events={scenario.events}
          cprElapsed={cprElapsed}
          epiElapsedSnapshot={epiElapsedSnapshot}
          scenarioStarted={scenario.scenarioStarted}
        />

        {/* Findings panel — right side below vitals */}
        {scenario.currentFindings && (
          <FindingsPanel
            label={scenario.currentFindings.label}
            findings={scenario.currentFindings.findings}
            teachingNote={scenario.currentFindings.teachingNote}
            warning={scenario.currentFindings.warning}
            onDismiss={scenario.dismissFindings}
          />
        )}

        {/* 5H5T glass overlay — shown on demand */}
        {showHtCauses && activeTopic.htCauseIds && (
          <HtCausesOverlay
            htCauseIds={activeTopic.htCauseIds}
            findingsOpen={!!scenario.currentFindings}
            onClose={() => setShowHtCauses(false)}
          />
        )}

        {/* Unstable Signs overlay — shown on demand */}
        {showUnstable && (
          <UnstableOverlay
            findingsOpen={!!scenario.currentFindings}
            htOpen={showHtCauses}
            onClose={() => setShowUnstable(false)}
          />
        )}

        {/* Scenario selector overlay */}
        {showScenarioSelector && (
          <ScenarioSelector
            topicId={activeTopicId}
            topicColor={activeTopic.color}
            onSelect={(s) => {
              scenario.loadScenario(s)
              library.setActiveAlgorithmId(s.algorithmId || activeTopic.algorithmId)
              setShowScenarioSelector(false)
              scenario.startScenario()
            }}
            onStartBlank={() => {
              setShowScenarioSelector(false)
              scenario.startScenario()
            }}
            onClose={() => setShowScenarioSelector(false)}
          />
        )}
      </div>

      {/* ── RIGHT COLUMN: Monitor (top) + Actions (below) ── */}
      <div
        className="absolute flex flex-col overflow-hidden border-l border-slate-800"
        style={{ top: TOP_H, bottom: TIMELINE_H, right: 0, width: RIGHT_W }}
      >
        {/* Monitor — fixed height */}
        <div className="flex-none overflow-hidden border-b border-slate-800" style={{ height: MONITOR_H }}>
          <MonitorPanel
            monitorAttached={scenario.patientState.monitorAttached}
            rhythmVisible={scenario.patientState.rhythmVisible}
            selectedRhythm={scenario.selectedRhythm}
            rhythmRevealed={scenario.rhythmRevealed}
            rhythmOrder={activeTopic.rhythmOrder}
            ecgImages={content.ecgImages}
            heartRate={scenario.patientState.heartRate}
            onSetRhythm={scenario.setSelectedRhythm}
            onRevealRhythm={scenario.revealRhythm}
            onApplyAction={handleAction}
          />
        </div>

        {/* 2-min countdown strip */}
        <CprCycleTimer
          startTime={scenario.startTime}
          elapsed={cprElapsed}
          running={cprRunning}
          setElapsed={setCprElapsed}
          setRunning={setCprRunning}
        />

        {/* Tab bar: Actions | Mx | Scene */}
        <div className="flex-none flex border-b border-slate-800">
          {([
            { id: 'actions', label: '⚕ Actions' },
            { id: 'mx',      label: '💊 Mx' },
            { id: 'scene',   label: '🎬 Scene' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setRightTab(tab.id)}
              className={`flex-1 py-1.5 text-xs font-bold transition-colors border-b-2 ${
                rightTab === tab.id
                  ? 'text-white border-teal-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {rightTab === 'actions' && (
            <ScenarioActionPanel
              activeTopic={activeTopic}
              selectedScenario={scenario.selectedScenario}
              events={scenario.events}
              onAction={handleAction}
              scenarioStarted={scenario.scenarioStarted}
              scenarioPaused={scenario.scenarioPaused}
              onStart={() => setShowScenarioSelector(true)}
              startTime={scenario.startTime}
              onShowHtCauses={() => setShowHtCauses(v => !v)}
              onShowUnstable={() => setShowUnstable(v => !v)}
            />
          )}
          {rightTab === 'mx' && (
            <MxPanel
              events={scenario.events}
              onAction={handleAction}
              scenarioStarted={scenario.scenarioStarted}
            />
          )}
          {rightTab === 'scene' && (
            <SceneAssetPanel
              assets={scene.assets}
              visibleIds={scene.visibleIds}
              onToggle={scene.toggleAsset}
              onReset={scene.resetScene}
              onClear={scene.clearScene}
            />
          )}
        </div>
      </div>

      {/* ── FLOATING PANELS (dock to left) ───────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }}>
        {panels.panels.map((p) => {
          if (!p.isOpen) return null
          const meta = dynamicPanelMeta[p.id]
          return (
            <div key={p.id} className="pointer-events-auto">
              <FloatingPanel
                id={p.id}
                title={meta.title}
                icon={meta.icon}
                accentColor={meta.color}
                dockSide="left"
                isOpen={p.isOpen}
                isMinimized={p.isMinimized}
                isDocked={p.isDocked}
                x={p.x}
                y={p.y}
                width={p.width}
                height={p.height}
                zIndex={p.zIndex}
                onClose={() => panels.closePanel(p.id)}
                onMinimize={() => panels.minimizePanel(p.id)}
                onDock={() => panels.dockPanel(p.id)}
                onMove={(x, y) => panels.movePanel(p.id, x, y)}
                onFocus={() => panels.bringToFront(p.id)}
              >
                <PanelContent
                  id={p.id}
                  scenario={scenario}
                  library={library}
                  activeTopic={activeTopic}
                  board={board}
                  content={content}
                />
              </FloatingPanel>
            </div>
          )
        })}
      </div>

      {/* ── TIMELINE ─────────────────────────────────────── */}
      <div className="fixed left-0 right-0 z-30" style={{ bottom: 0, height: TIMELINE_H }}>
        <EventTimeline
          events={scenario.events}
          startTime={scenario.startTime}
          focusedIndex={scenario.focusedEventIndex}
          onClickEvent={scenario.jumpToEvent}
        />
      </div>
    </div>
  )
}

// ── 5H 5T causes glass overlay (on canvas, right side) ───────────────────────

const HT_META: Record<string, { label: string; icon: string }> = {
  hypovolemia:  { label: 'Hypovolemia',      icon: '🩸' },
  hypoxia:      { label: 'Hypoxia',          icon: '🫁' },
  acidosis:     { label: 'H⁺ Acidosis',      icon: '⚗️' },
  hyperkalemia: { label: 'Hyperkalemia',     icon: '🔬' },
  hypothermia:  { label: 'Hypothermia',      icon: '🌡️' },
  pneumothorax: { label: 'Tension PTX',      icon: '💨' },
  tamponade:    { label: 'Tamponade',        icon: '💧' },
  toxins:       { label: 'Toxins',           icon: '☠️' },
  pe:           { label: 'Thrombosis (PE)',  icon: '🫁' },
  mi:           { label: 'Thrombosis (MI)',  icon: '❤️' },
}

type HtState = 'none' | 'yes' | 'no'

const GLASS_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg,rgba(255,255,255,0.11) 0%,rgba(255,255,255,0.04) 100%)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.15)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}

function YesNoRow({ id, label, icon, state, onToggle }: {
  id: string; label: string; icon?: string
  state: HtState
  onToggle: (id: string, val: 'yes' | 'no') => void
}) {
  return (
    <div className="flex items-center justify-between px-2.5 py-1 gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        {icon && <span className="text-xs flex-none">{icon}</span>}
        <span className="text-[10px] text-white/80 font-medium leading-tight truncate">{label}</span>
      </div>
      <div className="flex gap-1 flex-none">
        <button onClick={() => onToggle(id, 'yes')}
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition-colors ${
            state === 'yes' ? 'bg-red-500/40 border-red-400/60 text-red-200'
            : 'bg-white/5 border-white/10 text-white/35 hover:text-red-300 hover:border-red-400/40'
          }`}>Yes</button>
        <button onClick={() => onToggle(id, 'no')}
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition-colors ${
            state === 'no' ? 'bg-green-500/40 border-green-400/60 text-green-200'
            : 'bg-white/5 border-white/10 text-white/35 hover:text-green-300 hover:border-green-400/40'
          }`}>No</button>
      </div>
    </div>
  )
}

function HtCausesOverlay({ htCauseIds, findingsOpen, onClose }: {
  htCauseIds: string[]; findingsOpen: boolean; onClose: () => void
}) {
  const [states, setStates] = useState<Record<string, HtState>>({})
  const topOffset = findingsOpen ? '28rem' : '14rem'
  const toggle = (id: string, val: 'yes' | 'no') =>
    setStates(prev => ({ ...prev, [id]: prev[id] === val ? 'none' : val }))

  return (
    <div className="absolute z-20 pointer-events-auto" style={{ right: '0.75rem', top: topOffset, width: '11rem' }}>
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={GLASS_STYLE}>
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">5H 5T</span>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xs px-1 transition-colors">✕</button>
        </div>
        <div className="divide-y divide-white/5">
          {htCauseIds.map(id => (
            <YesNoRow key={id} id={id} label={HT_META[id]?.label ?? id} icon={HT_META[id]?.icon}
              state={states[id] ?? 'none'} onToggle={toggle} />
          ))}
        </div>
      </div>
    </div>
  )
}

const UNSTABLE_ITEMS = [
  { id: 'hypotension',  label: 'Hypotension',           sub: 'SBP < 90 mmHg' },
  { id: 'altered-ms',   label: 'Altered consciousness', sub: 'confusion / syncope' },
  { id: 'chest-pain',   label: 'Chest pain',            sub: 'ischemic symptoms' },
  { id: 'pulm-edema',   label: 'Pulmonary edema',       sub: 'acute heart failure' },
  { id: 'shock-signs',  label: 'Signs of shock',        sub: 'diaphoresis, clammy' },
]

function UnstableOverlay({ findingsOpen, htOpen, onClose }: {
  findingsOpen: boolean; htOpen: boolean; onClose: () => void
}) {
  const [states, setStates] = useState<Record<string, HtState>>({})
  // Stack below findings and/or 5H5T if both open
  const topOffset = findingsOpen ? '28rem' : '14rem'
  const toggle = (id: string, val: 'yes' | 'no') =>
    setStates(prev => ({ ...prev, [id]: prev[id] === val ? 'none' : val }))

  // If HtCauses also open, shift further right (place beside it) or below — use left offset
  const style: React.CSSProperties = htOpen
    ? { right: '0.75rem', top: topOffset, width: '11rem', marginRight: '11.5rem' }
    : { right: '0.75rem', top: topOffset, width: '11rem' }

  return (
    <div className="absolute z-20 pointer-events-auto" style={style}>
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={GLASS_STYLE}>
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300">Unstable Signs</span>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xs px-1 transition-colors">✕</button>
        </div>
        <div className="divide-y divide-white/5">
          {UNSTABLE_ITEMS.map(item => (
            <YesNoRow key={item.id} id={item.id} label={item.label}
              state={states[item.id] ?? 'none'} onToggle={toggle} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Compact 2-minute CPR cycle countdown timer ────────────────────────────────

function CprCycleTimer({
  startTime, elapsed, running, setElapsed, setRunning,
}: {
  startTime: number | null
  elapsed: number
  running: boolean
  setElapsed: React.Dispatch<React.SetStateAction<number>>
  setRunning: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-start when scenario begins; auto-stop/reset when scenario resets
  useEffect(() => {
    if (startTime) {
      setElapsed(0)
      setRunning(true)
    } else {
      setRunning(false)
      setElapsed(0)
    }
  }, [startTime]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const display = `${mins}:${String(secs).padStart(2, '0')}`
  const cycleSec = elapsed % 120
  const nearCycle = running && cycleSec >= 100

  return (
    <div className="flex-none flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-800 bg-slate-900/40">
      {/* Skip buttons */}
      <button
        onClick={() => setElapsed(e => e + 120)}
        className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 hover:text-teal-300 hover:border-teal-600 transition-colors"
        title="Skip +2 minutes"
      >+2 min</button>
      <button
        onClick={() => setElapsed(e => e + 60)}
        className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 hover:text-teal-300 hover:border-teal-600 transition-colors"
        title="Skip +1 minute"
      >+1 min</button>

      {/* Timer display */}
      <div className="flex-1 relative h-5 flex items-center">
        <div className="absolute inset-0 rounded bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded transition-all duration-1000 ease-linear ${nearCycle ? 'bg-orange-500/50' : 'bg-teal-600/30'}`}
            style={{ width: `${(cycleSec / 120) * 100}%` }}
          />
        </div>
        <span className={`relative w-full text-center font-mono text-[11px] font-bold ${nearCycle ? 'text-orange-300 animate-pulse' : 'text-white'}`}>
          {display}
        </span>
      </div>

      {/* Start / Pause */}
      <button
        onClick={() => setRunning(r => !r)}
        className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
          running
            ? 'border-orange-500/50 bg-orange-500/15 text-orange-300 hover:bg-orange-500/30'
            : 'border-teal-500/50 bg-teal-500/15 text-teal-300 hover:bg-teal-500/30'
        }`}
      >{running ? '⏸' : '▶'}</button>
      <button
        onClick={() => { setRunning(false); setElapsed(0) }}
        className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
        title="Reset"
      >↺</button>
    </div>
  )
}


function PanelContent({
  id,
  scenario,
  library,
  activeTopic,
  board,
  content,
}: {
  id: PanelId
  scenario: ReturnType<typeof useScenarioState>
  library: ReturnType<typeof useAlgorithmLibrary>
  activeTopic: TeachingTopic
  board: ReturnType<typeof useTeachingBoard>
  content: ReturnType<typeof useTeachingContent>
}) {
  switch (id) {
    case 'algorithm':
      return (
        <AlgorithmLibrary
          algorithms={library.algorithms}
          activeAlgorithmId={library.activeAlgorithmId}
          onSetActive={library.setActiveAlgorithmId}
          onUpload={library.uploadImage}
          onRemoveImage={library.removeImage}
          onAddAnnotation={library.addAnnotation}
          onRemoveAnnotation={library.removeAnnotation}
          highlightedNodeId={scenario.highlightedAlgoNode}
        />
      )
    case 'board':
      return <TeachingBoard board={board} />
    case 'notes':
      return <TeachingNotes lastActionId={scenario.lastActionId} onClose={() => {}} />
    case 'drugs':
      return <DrugReference drugIds={activeTopic.drugIds} drugs={content.drugs} />
    case 'hsts':
      return <CausesPanel topicId={activeTopic.id} htCauseIds={activeTopic.htCauseIds} />
    case 'timer':
      return <CodeTimer />
  }
}
