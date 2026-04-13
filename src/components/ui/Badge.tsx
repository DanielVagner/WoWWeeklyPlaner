import { type ReactNode } from 'react'

type Color = 'gold' | 'green' | 'blue' | 'red' | 'gray'

interface BadgeProps {
  children: ReactNode
  color?: Color
  className?: string
}

const colorClasses: Record<Color, string> = {
  gold:  'bg-wow-gold/15 text-wow-gold border border-wow-gold/30',
  green: 'bg-wow-green/15 text-wow-green border border-wow-green/30',
  blue:  'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  red:   'bg-wow-red/15 text-red-400 border border-wow-red/30',
  gray:  'bg-wow-surface-2 text-wow-muted border border-wow-border',
}

export function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
        ${colorClasses[color]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
