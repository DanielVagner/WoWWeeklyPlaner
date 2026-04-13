'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { getClassColor } from '@/lib/constants'

interface CharEntry {
  id:        string
  name:      string
  realm:     string
  class:     string
  spec:      string
  avgIlvl:   number
  level:     number
  isTracked: boolean
}

interface Props { initialChars: CharEntry[] }

export function CharacterSelectList({ initialChars }: Props) {
  const t = useTranslations('characters')
  const [chars, setChars]       = useState<CharEntry[]>(initialChars)
  const [toggling, setToggling] = useState<string | null>(null)

  const toggle = useCallback(async (id: string) => {
    setToggling(id)
    const res = await fetch(`/api/characters/${id}`, { method: 'PATCH' })
    if (res.ok) {
      const { isTracked } = await res.json()
      setChars((prev) =>
        prev
          .map((c) => (c.id === id ? { ...c, isTracked } : c))
          .sort((a, b) => Number(b.isTracked) - Number(a.isTracked) || b.avgIlvl - a.avgIlvl)
      )
    }
    setToggling(null)
  }, [])

  const tracked   = chars.filter((c) => c.isTracked)
  const untracked = chars.filter((c) => !c.isTracked)

  return (
    <div className="space-y-6">
      {/* Tracked section */}
      {tracked.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-wow-gold mb-3">
            {t('sectionTracked')} ({tracked.length})
          </h2>
          <div className="space-y-2">
            {tracked.map((char) => (
              <CharRow key={char.id} char={char} toggling={toggling} onToggle={toggle} />
            ))}
          </div>
        </section>
      )}

      {/* Untracked section */}
      {untracked.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-wow-muted mb-3">
            {t('sectionAll')} ({untracked.length})
          </h2>
          <div className="space-y-2">
            {untracked.map((char) => (
              <CharRow key={char.id} char={char} toggling={toggling} onToggle={toggle} />
            ))}
          </div>
        </section>
      )}

      {chars.length === 0 && (
        <p className="text-sm text-wow-muted text-center py-12">{t('empty')}</p>
      )}
    </div>
  )
}

function CharRow({
  char,
  toggling,
  onToggle,
}: {
  char: CharEntry
  toggling: string | null
  onToggle: (id: string) => void
}) {
  const color   = getClassColor(char.class)
  const pending = toggling === char.id

  return (
    <button
      onClick={() => onToggle(char.id)}
      disabled={pending}
      className={[
        'w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left',
        'border transition-all duration-150',
        char.isTracked
          ? 'border-wow-gold/40 bg-wow-gold/5 hover:bg-wow-gold/10'
          : 'border-wow-border bg-wow-surface-2 opacity-60 hover:opacity-100 hover:border-wow-border/80',
        pending ? 'opacity-40 cursor-wait' : 'cursor-pointer',
      ].join(' ')}
    >
      {/* Class color bar */}
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: color }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold leading-tight" style={{ color }}>
            {char.name}
          </span>
          <span className="text-xs text-wow-muted">lv {char.level}</span>
        </div>
        <div className="text-xs text-wow-muted truncate mt-0.5">
          {char.spec ? `${char.spec} · ` : ''}{char.realm}
        </div>
      </div>

      {/* ilvl */}
      <span className="text-sm text-wow-muted flex-shrink-0">{Math.round(char.avgIlvl)} ilvl</span>

      {/* Star toggle */}
      <div
        className={[
          'w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all',
          char.isTracked
            ? 'bg-wow-gold text-wow-bg shadow-[0_0_10px_rgba(214,178,90,0.5)]'
            : 'bg-wow-surface border border-wow-border text-wow-muted',
        ].join(' ')}
      >
        ★
      </div>
    </button>
  )
}
