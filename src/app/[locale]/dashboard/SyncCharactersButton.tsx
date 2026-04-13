'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

export function SyncCharactersButton({ hasCharacters }: { hasCharacters: boolean }) {
  const t       = useTranslations('dashboard')
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    try {
      // Step 1: upsert all chars + profiles from Blizzard
      const res  = await fetch('/api/characters', { method: 'POST' })
      const all  = await res.json()

      // Step 2: sync weekly data for each tracked character
      const tracked: { id: string }[] = Array.isArray(all)
        ? all.filter((c: { isTracked: boolean }) => c.isTracked)
        : []

      if (tracked.length > 0) {
        await Promise.allSettled(
          tracked.map((c) => fetch(`/api/characters/${c.id}/sync`, { method: 'POST' }))
        )
      }

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={hasCharacters ? 'secondary' : 'primary'}
      loading={loading}
      onClick={handleSync}
    >
      {loading ? t('syncing') : hasCharacters ? t('refreshButton') : t('syncButton')}
    </Button>
  )
}
