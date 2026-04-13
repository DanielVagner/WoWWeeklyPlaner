import { getClassColor } from '@/lib/constants'

interface ClassBadgeProps {
  className: string
  spec?: string
}

export function ClassBadge({ className, spec }: ClassBadgeProps) {
  const color = getClassColor(className)

  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded"
      style={{
        color,
        backgroundColor: `${color}20`,
        border: `1px solid ${color}40`,
      }}
    >
      {spec ? `${spec} ${className}` : className}
    </span>
  )
}
