import { AlgorithmNode as NodeData } from '../data/algorithmNodes'

interface Props {
  node: NodeData
  isSelected: boolean
  isDimmed: boolean
  onClick: () => void
  scale: number
}

const typeStyles: Record<string, { bg: string; border: string; text: string; shape: string }> = {
  action: {
    bg: 'bg-blue-900/60',
    border: 'border-blue-500/60',
    text: 'text-blue-200',
    shape: 'rounded-xl',
  },
  decision: {
    bg: 'bg-amber-900/50',
    border: 'border-amber-500/60',
    text: 'text-amber-200',
    shape: 'rounded-xl',
  },
  drug: {
    bg: 'bg-purple-900/60',
    border: 'border-purple-500/60',
    text: 'text-purple-200',
    shape: 'rounded-xl',
  },
  outcome: {
    bg: 'bg-green-900/60',
    border: 'border-green-500/60',
    text: 'text-green-200',
    shape: 'rounded-2xl',
  },
}

export default function AlgorithmNode({ node, isSelected, isDimmed, onClick }: Props) {
  const style = typeStyles[node.type]

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className="cursor-pointer"
      onClick={onClick}
    >
      <foreignObject width={node.width} height={node.height}>
        <div
          className={`w-full h-full border-2 ${style.shape} flex items-center justify-center p-2 transition-all duration-200
            ${style.bg} ${isSelected ? 'border-white shadow-lg' : style.border}
            ${isDimmed ? 'opacity-30' : 'opacity-100'}
            hover:opacity-100 hover:border-white/60
          `}
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <span className={`text-xs font-semibold text-center leading-tight whitespace-pre-line ${style.text} ${isSelected ? '!text-white' : ''}`}>
            {node.label}
          </span>
        </div>
      </foreignObject>
    </g>
  )
}
