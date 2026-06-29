# ACLS Interactive — Handoff Document

> Last updated: 2026-06-29

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite v6 (dev server: port 5173) |
| Styling | Tailwind CSS v3, navy color palette |
| State | React hooks only — no Redux/Zustand |
| Persistence | `localStorage` only — no backend |

---

## Project Structure

```
src/
  pages/
    HomePage.tsx          — landing/navigation
    TeachingMode.tsx      — main teaching simulator (left panel, right panel, timeline, scene)
    AdminPage.tsx         — admin editor (password-gated)
    ReferencePage.tsx     — H's & T's + Team Roles reference page
  components/
    admin/                — admin sub-components (password gate, etc.)
    algorithm/            — algorithm tree overlay
    ecg/                  — ECG viewer component
    layout/               — shared layout shells
    monitor/              — vitals monitor display
    notes/                — teaching notes panel
    scenario/
      ClosedLoopOverlay.tsx   — closed-loop communication dialog
      ScenarioCanvas.tsx      — patient scene + CPR heart animation
    teaching-board/
      TeachingBoard.tsx       — board/slide presentation with pointer ripple + fullscreen
    timeline/
      EventTimeline.tsx       — horizontal timeline bar + live elapsed timer
    tools/
      HsTs.tsx                — H's & T's cause cards
      TeamRoles.tsx           — team role cards (6 roles)
    ActionControls.tsx
    TeachingToolbar.tsx
  data/
    scenarioActions.ts    — ACTION_LIBRARY + ACTION_LIBRARY_GROUPS definitions
    scenarioLibrary.ts    — built-in + custom scenario store
    htCauses.ts           — allHtCauses[] + getHtCausesWithOverrides()
    assetSpecs.ts         — recommended dimensions per asset type
  hooks/
    useAlgorithmLibrary.ts
    useTeachingBoard.ts
    useTeachingContent.ts
  lib/
    sceneAssetStore.ts    — scene asset + action-mapping store (CRITICAL — see below)
    scenarioAssets.ts     — scenario-specific image asset store
    referenceOverrides.ts — H's & T's + Team Roles override helpers
    actionOverrides.ts    — action label/description overrides
```

---

## localStorage Keys

| Key | Purpose | Notes |
|-----|---------|-------|
| `acls-scene-assets-v4` | Position/visibility/opacity of all scene assets (defib, IV pole, etc.) | **Do NOT bump version** — load function auto-merges new assets |
| `acls-action-asset-map-v5` | Action → show/hide asset mapping | **BUMP VERSION** when DEFAULT_ACTION_MAPPING defaults change (see rule below) |
| `acls-board-slides` | Teaching board slides content | |
| `acls-content-drugs` | Drug reference data | |
| `acls-algorithm-data` | Algorithm tree nodes/edges | |
| `acls-custom-scenarios` | User-created scenarios | |
| `acls-scenario-assets` | Per-scenario image uploads | |
| `acls-ecg-meta` | ECG image metadata | |
| `acls-ht-overrides-v1` | Editable overrides for H's & T's content | |
| `acls-team-roles-overrides-v1` | Editable overrides for Team Roles content | |
| `acls-action-overrides` | Action label/description overrides | |
| `acls-admin-unlocked` | Admin session auth flag | |
| `cpr-heart-position` | Draggable CPR heart position on scene | |

### MAPPING_KEY Versioning Rule

`sceneAssetStore.ts` uses a shallow merge: `{ ...DEFAULT_ACTION_MAPPING, ...storedFromLocalStorage }`.
Because stored entries override defaults, if you **add or change** a default mapping entry, the user's cached localStorage will silently block the new default.

**Rule:** whenever you change `DEFAULT_ACTION_MAPPING`, bump `MAPPING_KEY` (e.g. v5 → v6). This forces a fresh load with the new defaults.

`ASSETS_KEY` does NOT follow this rule — the asset loader appends missing default assets, so the key stays stable.

---

## Core Architecture

### Action Flow

All actions go through a single `handleAction` function in `TeachingMode.tsx`:

```tsx
const handleAction = useCallback((actionId: string) => {
  scenario.applyAction(actionId)        // updates scenario log + timer
  scene.applyActionMapping(actionId)    // triggers asset show/hide
}, [scenario.applyAction, scene.applyActionMapping])
```

**Critical:** do NOT use `lastActionId` state + `useEffect` indirection. If the same action fires twice, React bails out (state unchanged) and the useEffect never fires. The direct call pattern above is the correct approach.

### Scene Asset Visibility

`useSceneVisibility` hook (`src/lib/sceneAssetStore.ts`) manages asset visibility:
- Uses `mappingRef` (useRef, not useState) to avoid re-render issues
- `applyActionMapping(id)` reads the mapping and calls `showAsset` / `hideAsset`
- `show` entries can include `duration: N` (milliseconds) to auto-hide after N ms

### Auto-hide Assets

Set `duration` on a show mapping entry:
```ts
'blood-sampling': { show: [{ id: 'blood-tube', duration: 5000 }], hide: [] }
```
The asset appears for 5 seconds, then auto-hides.

### Closed-Loop Communication

`ClosedLoopOverlay.tsx` is triggered by Mx tab actions. It reads from `CL_MAP` keyed by `actionId`. When an action with a CL_MAP entry fires, it displays the order + confirmation dialog.

### Override System Pattern

All editable content uses the same pattern:
1. `src/lib/referenceOverrides.ts` (or similar) defines `load*()` and `save*()` functions
2. The display component calls `load*()` at render time and merges overrides over defaults
3. AdminPage edits and saves via `save*()`

---

## Scene Assets

All assets defined in `DEFAULT_ASSETS` in `src/lib/sceneAssetStore.ts`:

| ID | Name | Default Visible |
|----|------|----------------|
| `defibrillator` | Defibrillator Machine | true |
| `defib-pads` | Defibrillator Pads | false |
| `monitor-machine` | Monitor/ECG Machine | false |
| `lead-3` | 3-Lead Monitor | false |
| `airway-bag` | Airway Bag | false |
| `iv-pole` | IV Pole | false |
| `blood-tube` | Blood Tube | false |
| `oxygen-mask` | Oxygen Mask | false |
| `et-tube` | ET Tube | false |
| `suction` | Suction Device | false |

Asset images live in `public/assets/` as transparent PNGs. Recommended dimensions per asset are in `src/data/assetSpecs.ts`.

---

## Teaching Board

`src/components/teaching-board/TeachingBoard.tsx`

- Slide navigation: Left/Right arrow keys + on-screen buttons
- Fullscreen mode: dedicated `FullscreenView` component
- Red pointer: clicking the slide area creates a `PointerRippleEffect` at percentage-based coordinates
  - 3-layer animation: solid dot + 2 expanding rings
  - Color: `#ef4444` (red)
  - Duration: 900ms

---

## Timeline

`src/components/timeline/EventTimeline.tsx`

- Height: `TIMELINE_H = 88px` (in TeachingMode.tsx)
- Elapsed timer: `useState(now)` + `setInterval(1000ms)` — updates live every second
- Timer starts automatically when scenario `startTime` is set

---

## CPR Cycle Timer

Inline component `CprCycleTimer` in `TeachingMode.tsx`:
- Receives `startTime` prop from scenario state
- Auto-starts when `startTime` is set, auto-resets when cleared
- Counts 0–120s (2-minute CPR cycles)

---

## Admin Panel

Password-gated at `/admin`. Sections:

| Tab | Edits |
|-----|-------|
| Board | Teaching board slides |
| Content | Drug reference cards |
| ECG | ECG rhythm images + labels |
| Algorithm | Algorithm tree |
| Scenarios | Scenario library |
| Actions | Action labels/descriptions; Mx Actions sub-tab |
| Scene Assets | Scene asset positions, sizes, default visibility |
| Action Mapping | Action → asset show/hide rules + durations |
| References | H's & T's content + Team Roles content |

"Reset All Data" button in admin clears all localStorage keys.

---

## Key Action Groups

Defined in `src/data/scenarioActions.ts` → `ACTION_LIBRARY_GROUPS`:

- `assessment` — includes `repeat-vitals`
- `airway` — airway management
- `cpr` — CPR-related
- `defibrillation` — shock actions
- `medication` — drugs via IV
- `ht-*` (6 groups) — H's & T's reversible cause treatments

Mx tab in TeachingMode shows: `medication`, `ht-hypovolemia`, `ht-acidosis`, `ht-hypothermia`, `ht-ptx`, `ht-tamponade`, `ht-toxins`, `ht-thrombosis`.

---

## IV Medication → IV Pole Rule

All actions that deliver medication via IV should show the IV pole with a 5-second auto-hide:
```ts
'action-id': { show: [{ id: 'iv-pole', duration: 5000 }], hide: [] }
```

Currently mapped (in `DEFAULT_ACTION_MAPPING`): epinephrine, amiodarone, amiodarone-150, lidocaine, atropine, dopamine-infusion, adenosine, antiarrhythmic-tachy, sodium-bicarbonate, calcium-gluconate, magnesium-sulfate, fluid-bolus, warm-fluids, iv-access.

---

## Common Pitfalls

1. **Action mapping not triggering** — always use `handleAction` directly, never via state+useEffect
2. **New defaults ignored** — if you change DEFAULT_ACTION_MAPPING, bump MAPPING_KEY
3. **Timer shows stale time** — use `useState(Date.now()) + setInterval`, never `Date.now()` in render
4. **Edit tool "File has not been read yet"** — must Read the file in the same conversation turn before Edit/Write
5. **Edit tool "Found N matches"** — provide more surrounding context to uniquely identify the location
