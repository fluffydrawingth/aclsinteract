import { useState, useCallback, useEffect, useRef } from 'react'
import { SceneAsset, ActionAssetMapping } from '../types/sceneAsset'
import { loadSceneAssets, loadActionAssetMap, loadSceneAssetsIndex, DEFAULT_SCENE_ASSETS } from '../lib/sceneAssetStore'
import { getImage } from '../lib/imageStore'

export function useSceneVisibility() {
  const [assets, setAssets] = useState<SceneAsset[]>([])
  const mappingRef = useRef<ActionAssetMapping>({})
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set())

  // Load assets + mapping; seed visible from defaultVisible
  useEffect(() => {
    const local = loadSceneAssets()
    mappingRef.current = loadActionAssetMap()
    setAssets(local)
    setVisibleIds(new Set(local.filter(x => x.defaultVisible).map(x => x.id)))

    // Overlay with Supabase index for cross-device sync
    loadSceneAssetsIndex().then(remote => {
      if (!remote) return
      const merged = remote.map(r => ({
        ...r,
        imageDataUrl: r.storageUrl ? undefined : getImage(`scene-asset::${r.id}`),
      }))
      const remoteIds = new Set(merged.map(a => a.id))
      const missing = DEFAULT_SCENE_ASSETS
        .filter(d => !remoteIds.has(d.id))
        .map(({ imageDataUrl: _, ...rest }) => ({ ...rest, imageDataUrl: undefined as string | undefined }))
      const final = [...merged, ...missing]
      setAssets(final)
      setVisibleIds(new Set(final.filter(x => x.defaultVisible).map(x => x.id)))
    })
  }, [])

  // Re-load when admin changes assets
  useEffect(() => {
    const h = () => {
      setAssets(loadSceneAssets())
      mappingRef.current = loadActionAssetMap()
    }
    window.addEventListener('acls-assets-updated', h)
    window.addEventListener('storage', h)
    return () => {
      window.removeEventListener('acls-assets-updated', h)
      window.removeEventListener('storage', h)
    }
  }, [])

  // Apply an action's asset mapping (called by scenario applyAction)
  const applyActionMapping = useCallback((actionId: string) => {
    const rule = mappingRef.current[actionId]
    if (!rule) return
    setVisibleIds(prev => {
      const next = new Set(prev)
      rule.show.forEach(({ id, duration }) => {
        next.add(id)
        if (duration) {
          setTimeout(() => setVisibleIds(p => { const n = new Set(p); n.delete(id); return n }), duration)
        }
      })
      rule.hide.forEach(id => next.delete(id))
      return next
    })
  }, [])

  // Assets that cannot be visible at the same time — toggling one on hides the other
  const MUTUAL_EXCLUDE: Record<string, string[]> = {
    'compressor':   ['hand-carotid'],
    'cpr-hands':    ['hand-carotid'],
    'hand-carotid': ['compressor', 'cpr-hands'],
  }

  // Manual toggles for Scene panel
  const toggleAsset = useCallback((id: string) => {
    setVisibleIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        // Hide mutually-exclusive partners when turning this one on
        MUTUAL_EXCLUDE[id]?.forEach(partner => next.delete(partner))
      }
      return next
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showAsset = useCallback((id: string) => {
    setVisibleIds(prev => new Set([...prev, id]))
  }, [])

  const hideAsset = useCallback((id: string) => {
    setVisibleIds(prev => { const n = new Set(prev); n.delete(id); return n })
  }, [])

  // Reset to defaults (background + patient only)
  const resetScene = useCallback(() => {
    setVisibleIds(new Set(assets.filter(a => a.defaultVisible).map(a => a.id)))
  }, [assets])

  // Clear all visible assets
  const clearScene = useCallback(() => setVisibleIds(new Set()), [])

  return {
    assets,
    visibleIds,
    applyActionMapping,
    toggleAsset,
    showAsset,
    hideAsset,
    resetScene,
    clearScene,
  }
}
