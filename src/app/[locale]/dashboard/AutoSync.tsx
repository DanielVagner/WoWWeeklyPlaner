'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  /** IDs of tracked characters whose lastSyncedAt is stale (or null) */
  staleIds: string[]
}

const STALE_SECS = 15 * 60 // 15 minutes

/**
 * Fires on mount: syncs stale tracked characters in the background,
 * then calls router.refresh() so the dashboard re-renders with fresh data.
 * The user sees the page immediately — sync happens silently behind the scenes.
 */
export function AutoSync({ staleIds }: Props) {
  const router  = useRouter()
  const firedRef = useRef(false)

  useEffect(() => {
    if (staleIds.length === 0 || firedRef.current) return
    firedRef.current = true

    async function run() {
      await Promise.allSettled(
        staleIds.map((id) => fetch(`/api/characters/${id}/sync`, { method: 'POST' }))
      )
      router.refresh()
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export { STALE_SECS }
