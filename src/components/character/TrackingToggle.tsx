'use client'

import { useState, useTransition } from 'react'

interface Props {
  characterId: string
  initialTracked: boolean
}

export function TrackingToggle({ characterId, initialTracked }: Props) {
  const [tracked, setTracked] = useState(initialTracked)
  const [pending, startTransition] = useTransition()

  function toggle(e: React.MouseEvent) {
    e.preventDefault() // prevent card link navigation
    e.stopPropagation()
    startTransition(async () => {
      const res = await fetch(`/api/characters/${characterId}`, { method: 'PATCH' })
      if (res.ok) {
        const data = await res.json()
        setTracked(data.isTracked)
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title={tracked ? 'Odebrat ze sledování' : 'Přidat do sledování'}
      className={[
        'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center',
        'transition-all duration-200 text-xs leading-none',
        tracked
          ? 'bg-wow-gold text-wow-bg shadow-[0_0_8px_rgba(214,178,90,0.6)]'
          : 'bg-wow-surface-2 border border-wow-border text-wow-muted hover:border-wow-gold/40',
        pending ? 'opacity-50' : '',
      ].join(' ')}
    >
      ★
    </button>
  )
}
