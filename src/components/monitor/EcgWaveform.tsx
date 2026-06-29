import { RhythmType } from '../../types/rhythm'

interface Props {
  rhythm: RhythmType
  color: string
  width?: number
  height?: number
  animated?: boolean
}

function getPath(rhythm: RhythmType, w: number, h: number): string {
  const mid = h / 2
  const amp = h * 0.38

  switch (rhythm) {
    case 'VF': {
      const pts = [0,15,35,8,20,45,5,30,50,10,25,48,3,18,40,12,28,52,7,22,43,2,16,38,14,32,55,6,20,44,9,26,50,4,19,42,11,30,53,8,24,46]
      let d = `M 0 ${mid}`
      pts.forEach((v, i) => {
        const x = (i / (pts.length - 1)) * w
        const y = mid + (i % 2 === 0 ? -1 : 1) * (v / 55) * amp
        d += ` L ${x} ${y}`
      })
      return d
    }

    case 'PVT':
    case 'VT_PULSE': {
      // Wide-complex regular tachycardia (same shape; VT_PULSE just means pulse present)
      let d = `M 0 ${mid}`
      const n = rhythm === 'VT_PULSE' ? 4 : 5
      const cw = w / n
      for (let c = 0; c < n; c++) {
        const x0 = c * cw
        d += ` L ${x0 + cw * 0.1} ${mid}`
        d += ` L ${x0 + cw * 0.2} ${mid - amp * 0.5}`
        d += ` L ${x0 + cw * 0.35} ${mid + amp}`
        d += ` L ${x0 + cw * 0.55} ${mid - amp * 0.8}`
        d += ` L ${x0 + cw * 0.7} ${mid}`
        d += ` L ${x0 + cw} ${mid}`
      }
      return d
    }

    case 'ASYSTOLE': {
      const pts = [0,1,0,-1,0,1,-1,0,1,0,-1,0,0,1,0,-1,0,1,0,-1]
      let d = `M 0 ${mid}`
      pts.forEach((v, i) => {
        d += ` L ${(i / (pts.length - 1)) * w} ${mid + v * 2}`
      })
      d += ` L ${w} ${mid}`
      return d
    }

    case 'PEA': {
      // Organized narrow complex, no pulse
      let d = `M 0 ${mid}`
      const cw = w / 4
      for (let c = 0; c < 4; c++) {
        const x0 = c * cw
        d += ` L ${x0 + cw * 0.1} ${mid}`
        d += ` L ${x0 + cw * 0.15} ${mid - amp * 0.15}`
        d += ` L ${x0 + cw * 0.2} ${mid}`
        d += ` L ${x0 + cw * 0.28} ${mid - amp * 0.08}`
        d += ` L ${x0 + cw * 0.32} ${mid + amp * 0.15}`
        d += ` L ${x0 + cw * 0.36} ${mid - amp * 0.9}`
        d += ` L ${x0 + cw * 0.40} ${mid + amp * 0.12}`
        d += ` L ${x0 + cw * 0.5} ${mid}`
        d += ` L ${x0 + cw * 0.65} ${mid - amp * 0.2}`
        d += ` L ${x0 + cw * 0.8} ${mid}`
        d += ` L ${x0 + cw} ${mid}`
      }
      return d
    }

    case 'SINUS': {
      let d = `M 0 ${mid}`
      const cw = w / 3
      for (let c = 0; c < 3; c++) {
        const x0 = c * cw
        d += ` L ${x0 + cw * 0.08} ${mid}`
        d += ` L ${x0 + cw * 0.13} ${mid - amp * 0.2}`
        d += ` L ${x0 + cw * 0.18} ${mid}`
        d += ` L ${x0 + cw * 0.25} ${mid + amp * 0.12}`
        d += ` L ${x0 + cw * 0.3} ${mid - amp}`
        d += ` L ${x0 + cw * 0.35} ${mid + amp * 0.15}`
        d += ` L ${x0 + cw * 0.45} ${mid}`
        d += ` L ${x0 + cw * 0.58} ${mid - amp * 0.28}`
        d += ` L ${x0 + cw * 0.72} ${mid}`
        d += ` L ${x0 + cw} ${mid}`
      }
      return d
    }

    case 'SINUS_BRADY': {
      // Same shape as SINUS but only 2 cycles (slower)
      let d = `M 0 ${mid}`
      const cw = w / 2
      for (let c = 0; c < 2; c++) {
        const x0 = c * cw
        d += ` L ${x0 + cw * 0.08} ${mid}`
        d += ` L ${x0 + cw * 0.12} ${mid - amp * 0.2}`
        d += ` L ${x0 + cw * 0.17} ${mid}`
        d += ` L ${x0 + cw * 0.22} ${mid + amp * 0.12}`
        d += ` L ${x0 + cw * 0.27} ${mid - amp}`
        d += ` L ${x0 + cw * 0.32} ${mid + amp * 0.15}`
        d += ` L ${x0 + cw * 0.42} ${mid}`
        d += ` L ${x0 + cw * 0.55} ${mid - amp * 0.28}`
        d += ` L ${x0 + cw * 0.68} ${mid}`
        d += ` L ${x0 + cw} ${mid}`
      }
      return d
    }

    case 'AV_BLOCK': {
      // 3 P waves, 2 QRS (one dropped — Mobitz II pattern)
      let d = `M 0 ${mid}`
      const pCw = w / 3
      // Beat 1: P + QRS
      d += ` L ${pCw * 0.08} ${mid}`
      d += ` L ${pCw * 0.13} ${mid - amp * 0.2}`
      d += ` L ${pCw * 0.18} ${mid}`
      d += ` L ${pCw * 0.25} ${mid + amp * 0.12}`
      d += ` L ${pCw * 0.3}  ${mid - amp}`
      d += ` L ${pCw * 0.35} ${mid + amp * 0.15}`
      d += ` L ${pCw * 0.45} ${mid}`
      d += ` L ${pCw * 0.6}  ${mid - amp * 0.25}`
      d += ` L ${pCw * 0.75} ${mid}`
      d += ` L ${pCw} ${mid}`
      // Beat 2: P wave only (dropped QRS)
      d += ` L ${pCw + pCw * 0.13} ${mid - amp * 0.2}`
      d += ` L ${pCw + pCw * 0.18} ${mid}`
      d += ` L ${2 * pCw} ${mid}`
      // Beat 3: P + QRS
      d += ` L ${2*pCw + pCw * 0.08} ${mid}`
      d += ` L ${2*pCw + pCw * 0.13} ${mid - amp * 0.2}`
      d += ` L ${2*pCw + pCw * 0.18} ${mid}`
      d += ` L ${2*pCw + pCw * 0.25} ${mid + amp * 0.12}`
      d += ` L ${2*pCw + pCw * 0.3}  ${mid - amp}`
      d += ` L ${2*pCw + pCw * 0.35} ${mid + amp * 0.15}`
      d += ` L ${2*pCw + pCw * 0.45} ${mid}`
      d += ` L ${2*pCw + pCw * 0.6}  ${mid - amp * 0.25}`
      d += ` L ${w} ${mid}`
      return d
    }

    case 'CHB': {
      // Independent P waves and slow QRS complexes (AV dissociation)
      let d = `M 0 ${mid}`
      const totalW = w
      // P waves (faster rate ~40/min, 3 visible)
      const pW = totalW / 3
      for (let i = 0; i < 3; i++) {
        const px = i * pW + pW * 0.2
        d += ` L ${px} ${mid}`
        d += ` L ${px + pW * 0.1} ${mid - amp * 0.18}`
        d += ` L ${px + pW * 0.2} ${mid}`
        d += ` L ${(i + 1) * pW} ${mid}`
      }
      // Overlay slow QRS (escape rhythm ~30/min, 2 visible)
      const qW = totalW / 2.2
      for (let i = 0; i < 2; i++) {
        const qx = i * qW + qW * 0.3
        d += ` M ${qx} ${mid}`
        d += ` L ${qx + qW * 0.05} ${mid + amp * 0.1}`
        d += ` L ${qx + qW * 0.1}  ${mid - amp * 0.7}`
        d += ` L ${qx + qW * 0.15} ${mid + amp * 0.12}`
        d += ` L ${qx + qW * 0.3}  ${mid}`
      }
      return d
    }

    case 'SVT': {
      // Fast narrow complex, no visible P waves, HR ~180
      let d = `M 0 ${mid}`
      const n = 7
      const cw = w / n
      for (let c = 0; c < n; c++) {
        const x0 = c * cw
        d += ` L ${x0 + cw * 0.15} ${mid}`
        d += ` L ${x0 + cw * 0.2}  ${mid + amp * 0.08}`
        d += ` L ${x0 + cw * 0.25} ${mid - amp * 0.9}`
        d += ` L ${x0 + cw * 0.3}  ${mid + amp * 0.1}`
        d += ` L ${x0 + cw * 0.45} ${mid}`
        d += ` L ${x0 + cw * 0.55} ${mid - amp * 0.18}` // retrograde P
        d += ` L ${x0 + cw * 0.65} ${mid}`
        d += ` L ${x0 + cw} ${mid}`
      }
      return d
    }

    case 'AF_RVR': {
      // Irregular baseline + irregular fast narrow QRS
      const pts = [0,3,-2,4,-1,2,-3,1,-2,3,0,2,-1,3,-2,1,0,4,-1,2]
      let d = `M 0 ${mid}`
      // Fibrillatory baseline
      pts.forEach((v, i) => {
        d += ` L ${(i / pts.length) * w * 0.15} ${mid + v * 1.5}`
      })
      // Irregular QRS beats
      const beats = [0.1, 0.22, 0.31, 0.45, 0.55, 0.67, 0.77, 0.9]
      beats.forEach((pos, i) => {
        const bx = pos * w
        const jitter = (i % 3 - 1) * 3
        d += ` L ${bx} ${mid + jitter}`
        d += ` L ${bx + w * 0.015} ${mid + amp * 0.08 + jitter}`
        d += ` L ${bx + w * 0.025} ${mid - amp * 0.85}`
        d += ` L ${bx + w * 0.035} ${mid + amp * 0.1 + jitter}`
        d += ` L ${bx + w * 0.06}  ${mid + jitter}`
      })
      d += ` L ${w} ${mid}`
      return d
    }
  }
}

export default function EcgWaveform({ rhythm, color, width = 400, height = 80, animated = false }: Props) {
  const path = getPath(rhythm, width, height)
  const isCHB = rhythm === 'CHB'

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-full ${animated ? 'ecg-scroll' : ''}`}
      preserveAspectRatio="none"
    >
      {animated && (
        <defs>
          <clipPath id="ecg-clip">
            <rect x="0" y="0" width={width} height={height} />
          </clipPath>
        </defs>
      )}
      {isCHB ? (
        // CHB needs two separate path segments
        <>
          <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {animated && (
        <line
          x1="0" y1="0" x2="0" y2={height}
          stroke={color} strokeWidth="1" opacity="0.4"
          style={{ animation: `ecg-scan 3s linear infinite` }}
        />
      )}
    </svg>
  )
}
