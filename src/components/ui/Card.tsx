import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-wow-surface border border-wow-border rounded-xl p-6
        ${hover ? 'transition-colors duration-200 hover:border-wow-gold/40 hover:bg-wow-surface-2' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
