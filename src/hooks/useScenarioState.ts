import { useState, useCallback } from 'react'
import { PatientState, TimelineEvent, ScenarioDefinition, defaultPatientState } from '../types/scenario'
import { RhythmType } from '../types/rhythm'
import { scenarioActions } from '../data/scenarioActions'
import { TeachingTopic } from '../data/teachingTopics'
import { loadActionOverrides } from '../lib/actionOverrides'

function makeInitialState(topic: TeachingTopic): PatientState {
  const p = topic.patientProfile
  return {
    ...defaultPatientState,
    consciousness: p.isUnresponsive ? 'unresponsive' : 'alert',
    isUnresponsive: p.isUnresponsive,
    hasPulse: p.hasPulse,
    isBreathing: p.isBreathing,
    heartRate: p.hasPulse ? 80 : null,
    bloodPressure: p.hasPulse ? '120/80' : null,
    spo2: p.isBreathing ? 98 : null,
  }
}

const actionToAlgorithmNode: Record<string, string> = {
  'start-cpr':                  'cpr',
  'attach-monitor':             'monitor',
  'attach-monitor-brady':       'monitor',
  'attach-monitor-tachy':       'monitor',
  'rhythm-check':               'rhythm',
  'defibrillate':               'shock',
  'synchronized-cardioversion': 'shock',
  'epinephrine':                'epi',
  'amiodarone':                 'amio',
  'atropine':                   'epi',
  'adenosine':                  'epi',
  'rosc':                       'rosc',
}

export function useScenarioState(topic: TeachingTopic) {
  const [patientState, setPatientState] = useState<PatientState>(() => makeInitialState(topic))
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [selectedRhythm, setSelectedRhythm] = useState<RhythmType>(topic.defaultRhythm)
  const [rhythmRevealed, setRhythmRevealed] = useState(false)
  const [lastActionId, setLastActionId] = useState<string | null>(null)
  const [highlightedAlgoNode, setHighlightedAlgoNode] = useState<string | null>(null)
  const [scenarioStarted, setScenarioStarted] = useState(false)
  const [scenarioPaused, setScenarioPaused] = useState(false)
  const [focusedEventIndex, setFocusedEventIndex] = useState<number>(-1)
  const [currentFindings, setCurrentFindings] = useState<{ actionId: string; findings: string[]; label: string; teachingNote?: string; warning?: string } | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition | null>(null)

  const startScenario = useCallback(() => {
    setScenarioStarted(true)
    setScenarioPaused(false)
    setStartTime((t) => t ?? Date.now())
  }, [])

  const pauseScenario = useCallback(() => setScenarioPaused(true), [])
  const resumeScenario = useCallback(() => setScenarioPaused(false), [])

  const loadScenario = useCallback((scenario: ScenarioDefinition) => {
    setSelectedScenario(scenario)
    setPatientState({ ...scenario.initialState })
    setSelectedRhythm(scenario.initialRhythm as RhythmType)
    setEvents([])
    setStartTime(null)
    setRhythmRevealed(false)
    setLastActionId(null)
    setHighlightedAlgoNode(null)
    setScenarioStarted(false)
    setScenarioPaused(false)
    setFocusedEventIndex(-1)
    setCurrentFindings(null)
  }, [])

  const applyAction = useCallback((actionId: string) => {
    const action = scenarioActions.find((a) => a.id === actionId)
    if (!action) return

    const now = Date.now()

    if (!scenarioStarted) {
      setScenarioStarted(true)
      setStartTime((t) => t ?? now)
    }

    // Merge state effects: action default + scenario override
    const override = selectedScenario?.actionOverrides?.[actionId]
    const stateChanges = { ...(action.stateEffect ?? {}), ...(override?.stateEffect ?? {}) }

    setPatientState((prev) => ({ ...prev, ...stateChanges }))

    // Special case: rhythm check and defibrillate reset rhythm reveal (re-assess after shock)
    if (actionId === 'rhythm-check' || actionId === 'defibrillate') {
      setRhythmRevealed(false)
    }

    // ROSC → auto-switch to sinus rhythm
    if (actionId === 'rosc') {
      setSelectedRhythm('SINUS')
      setRhythmRevealed(true)
    }

    // Handle rhythm change from scenario override (can still override the default above)
    if (override?.rhythmChange) {
      setSelectedRhythm(override.rhythmChange as RhythmType)
    }

    // Algorithm node highlight
    const nodeId = action.algoNodeId ?? actionToAlgorithmNode[actionId]
    if (nodeId) setHighlightedAlgoNode(nodeId)

    // Timeline — always append (repeatable actions allowed)
    const findings = override?.findings ?? action.findings
    const event: TimelineEvent = {
      id: `${actionId}-${now}`,
      label: action.label,
      labelEn: action.labelEn,
      actionId,
      icon: action.icon,
      timestamp: now,
      findings,
    }
    setEvents((prev) => {
      const next = [...prev, event]
      setFocusedEventIndex(next.length - 1)
      return next
    })

    // Show findings panel (timer managed by FindingsPanel itself)
    const teachingOverrides = loadActionOverrides()
    const teachingOverride = teachingOverrides[actionId]
    const displayFindings = teachingOverride?.findings ?? findings
    const teachingNote = teachingOverride?.teachingNote ?? action.notesThai?.discussionQuestion
    const warning = teachingOverride?.warning ?? undefined
    if (displayFindings.length > 0 || teachingNote || warning) {
      setCurrentFindings({ actionId, findings: displayFindings, label: action.label, teachingNote, warning })
    }

    setLastActionId(actionId)
  }, [scenarioStarted, selectedScenario])

  const dismissFindings = useCallback(() => {
    setCurrentFindings(null)
  }, [])

  const resetScenario = useCallback(() => {
    const initState = selectedScenario
      ? { ...selectedScenario.initialState }
      : makeInitialState(topic)
    const initRhythm = (selectedScenario?.initialRhythm as RhythmType) ?? topic.defaultRhythm

    setPatientState(initState)
    setEvents([])
    setStartTime(null)
    setSelectedRhythm(initRhythm)
    setRhythmRevealed(false)
    setLastActionId(null)
    setHighlightedAlgoNode(null)
    setScenarioStarted(false)
    setScenarioPaused(false)
    setFocusedEventIndex(-1)
    setCurrentFindings(null)
  }, [topic, selectedScenario])

  const prevEvent = useCallback(() => {
    setFocusedEventIndex((i) => Math.max(0, i - 1))
  }, [])

  const nextEvent = useCallback((totalEvents: number) => {
    setFocusedEventIndex((i) => Math.min(totalEvents - 1, i + 1))
  }, [])

  const jumpToEvent = useCallback((index: number) => {
    setFocusedEventIndex(index)
  }, [])

  const revealRhythm = useCallback(() => setRhythmRevealed(true), [])

  return {
    patientState,
    events,
    startTime,
    selectedRhythm,
    setSelectedRhythm,
    rhythmRevealed,
    revealRhythm,
    lastActionId,
    warning: null as string | null,
    highlightedAlgoNode,
    setHighlightedAlgoNode,
    applyAction,
    resetScenario,
    scenarioStarted,
    scenarioPaused,
    focusedEventIndex,
    startScenario,
    pauseScenario,
    resumeScenario,
    prevEvent,
    nextEvent,
    jumpToEvent,
    currentFindings,
    dismissFindings,
    selectedScenario,
    loadScenario,
    // Legacy compat
    appliedActions: new Set<string>(),
  }
}
