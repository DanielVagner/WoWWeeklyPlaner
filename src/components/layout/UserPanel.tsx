'use client'

import { useState, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { getClassColor } from '@/lib/constants'

interface CharEntry {
  id: string
  name: string
  realm: string
  class: string
  spec: string
  avgIlvl: number
  isTracked: boolean
}

interface Props { username: string }

export function UserPanel({ username }: Props) {
  const t        = useTranslations('nav')
  const [open, setOpen]           = useState(false)
  const [chars, setChars]         = useState<CharEntry[]>([])
  const [loading, setLoading]     = useState(false)
  const [toggling, setToggling]   = useState<string | null>(null)

  const openPanel = useCallback(async () => {
    setOpen(true)
    setLoading(true)
    const res  = await fetch('/api/characters')
    const data = await res.json()
    // Seřadíme: tracked first, pak ilvl desc
    setChars(data.sort((a: CharEntry, b: CharEntry) =>
      Number(b.isTracked) - Number(a.isTracked) || b.avgIlvl - a.avgIlvl
    ))
    setLoading(false)
  }, [])

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

  return (
    <>
      {/* Trigger – username button */}
      <button
        onClick={openPanel}
        className="text-xs text-wow-text hover:text-wow-gold transition-colors flex items-center gap-1.5"
      >
        <span className="hidden sm:block">{username}</span>
        <span className="text-wow-muted text-[10px]">▼</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <aside
        className={[
          'fixed top-0 right-0 z-50 h-full w-80 bg-wow-surface border-l border-wow-border',
          'flex flex-col shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-wow-border">
          <span className="font-heading text-sm text-wow-gold">{username}</span>
          <button
            onClick={() => setOpen(false)}
            className="text-wow-muted hover:text-wow-text text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Character list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs text-wow-muted mb-3">
            {t('manageCharsHint')}
          </p>

          {loading && (
            <div className="text-xs text-wow-muted text-center py-8">…</div>
          )}

          {chars.map((char) => {
            const color = getClassColor(char.class)
            return (
              <button
                key={char.id}
                onClick={() => toggle(char.id)}
                disabled={toggling === char.id}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
                  'border transition-all duration-150',
                  char.isTracked
                    ? 'border-wow-gold/40 bg-wow-gold/5'
                    : 'border-wow-border bg-wow-surface-2 opacity-60 hover:opacity-90',
                  toggling === char.id ? 'opacity-50' : '',
                ].join(' ')}
              >
                {/* Class color bar */}
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />

                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold leading-tight truncate"
                    style={{ color }}
                  >
                    {char.name}
                  </div>
                  <div className="text-xs text-wow-muted truncate">
                    {char.spec ? `${char.spec} · ` : ''}{char.realm}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-wow-muted">{Math.round(char.avgIlvl)}</span>
                  <div
                    className={[
                      'w-4 h-4 rounded-full text-[9px] flex items-center justify-center',
                      char.isTracked
                        ? 'bg-wow-gold text-wow-bg'
                        : 'bg-wow-surface border border-wow-border text-wow-muted',
                    ].join(' ')}
                  >
                    ★
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer – logout */}
        <div className="p-4 border-t border-wow-border">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full text-sm text-wow-muted hover:text-red-400 transition-colors py-2"
          >
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
