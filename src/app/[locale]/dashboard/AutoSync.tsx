'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Props {
  staleIds: string[]
}

export function AutoSync({ staleIds }: Props) {
  const router    = useRouter()
  const firedRef  = useRef(false)
  const [tokenExpired, setTokenExpired] = useState(false)

  useEffect(() => {
    if (staleIds.length === 0 || firedRef.current) return
    firedRef.current = true

    async function run() {
      const results = await Promise.allSettled(
        staleIds.map((id) => fetch(`/api/characters/${id}/sync`, { method: 'POST' }))
      )

      const anyExpired = results.some(
        (r) => r.status === 'fulfilled' && r.value.status === 401
      )
      if (anyExpired) {
        setTokenExpired(true)
        return
      }

      router.refresh()
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!tokenExpired) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-red-500/40 bg-wow-surface px-4 py-3 shadow-lg">
      <p className="text-sm text-wow-text mb-2">
        Your Battle.net session could not be refreshed. Please sign in again.
      </p>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
      >
        Sign out &amp; re-login →
      </button>
    </div>
  )
}
