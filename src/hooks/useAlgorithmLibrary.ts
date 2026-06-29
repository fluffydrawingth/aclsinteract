import { useState, useCallback } from 'react'
import { Algorithm, AlgorithmAnnotation } from '../types/algorithm'
import { useLocalStorage } from './useLocalStorage'
import { defaultAlgorithms } from '../data/algorithms'

type StoredAlgorithmData = {
  imageDataUrl: string | null
  annotations: AlgorithmAnnotation[]
}

export function useAlgorithmLibrary() {
  const [activeAlgorithmId, setActiveAlgorithmId] = useState('cardiac-arrest')
  const [storedData, setStoredData] = useLocalStorage<Record<string, StoredAlgorithmData>>(
    'acls-algorithm-data',
    {}
  )

  const algorithms: Algorithm[] = defaultAlgorithms.map((alg) => ({
    ...alg,
    imageDataUrl: storedData[alg.id]?.imageDataUrl ?? alg.imageDataUrl,
    annotations: storedData[alg.id]?.annotations ?? alg.annotations,
  }))

  const activeAlgorithm = algorithms.find((a) => a.id === activeAlgorithmId) ?? algorithms[0]

  const uploadImage = useCallback((algorithmId: string, dataUrl: string) => {
    setStoredData((prev) => ({
      ...prev,
      [algorithmId]: {
        imageDataUrl: dataUrl,
        annotations: prev[algorithmId]?.annotations ?? [],
      },
    }))
  }, [setStoredData])

  const removeImage = useCallback((algorithmId: string) => {
    setStoredData((prev) => ({
      ...prev,
      [algorithmId]: {
        imageDataUrl: null,
        annotations: prev[algorithmId]?.annotations ?? [],
      },
    }))
  }, [setStoredData])

  const addAnnotation = useCallback((algorithmId: string, annotation: AlgorithmAnnotation) => {
    setStoredData((prev) => ({
      ...prev,
      [algorithmId]: {
        imageDataUrl: prev[algorithmId]?.imageDataUrl ?? null,
        annotations: [...(prev[algorithmId]?.annotations ?? []), annotation],
      },
    }))
  }, [setStoredData])

  const removeAnnotation = useCallback((algorithmId: string, annotationId: string) => {
    setStoredData((prev) => ({
      ...prev,
      [algorithmId]: {
        imageDataUrl: prev[algorithmId]?.imageDataUrl ?? null,
        annotations: (prev[algorithmId]?.annotations ?? []).filter((a) => a.id !== annotationId),
      },
    }))
  }, [setStoredData])

  return {
    algorithms,
    activeAlgorithm,
    activeAlgorithmId,
    setActiveAlgorithmId,
    uploadImage,
    removeImage,
    addAnnotation,
    removeAnnotation,
  }
}
