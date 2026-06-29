export type AlgorithmAnnotation = {
  id: string
  x: number
  y: number
  title: string
  explanation: string
  keyPoints: string[]
  discussionQuestion: string
}

export type Algorithm = {
  id: string
  title: string
  titleEn: string
  description: string
  staticImageUrl?: string      // bundled public asset — always takes priority
  imageDataUrl: string | null  // user-uploaded base64
  annotations: AlgorithmAnnotation[]
  color: string
  hasBuiltIn: boolean
}
