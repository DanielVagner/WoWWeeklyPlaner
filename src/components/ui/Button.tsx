'use client'

import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'battlenet'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-wow-gold text-wow-bg font-semibold hover:bg-wow-gold-bright',
  secondary: 'bg-wow-surface-2 text-wow-text border border-wow-border hover:border-wow-gold/40',
  ghost:     'text-wow-muted hover:text-wow-text hover:bg-wow-surface-2',
  battlenet: 'bg-[#0078ff] text-white font-semibold hover:bg-[#0066dd]',
}

export function Button({
  variant = 'secondary',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
