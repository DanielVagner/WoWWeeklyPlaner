'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { getTimeUntilReset } from '@/lib/reset'

function formatCountdown(t: ReturnType<typeof useTranslations<'reset'>>, { days, hours, mins }: { days: number; hours: number; mins: number }) {
  if (days > 0)  return t('days',  { days, hours })
  if (hours > 0) return t('hours', { hours, mins })
  return t('mins', { mins })
}

function ResetCountdown() {
  const t  = useTranslations('reset')
  const eu = getTimeUntilReset('eu')
  const na = getTimeUntilReset('us')

  return (
    <span className="flex items-center gap-2">
      <span title="EU reset (Wed 04:00 UTC)">EU {formatCountdown(t, eu)}</span>
      <span className="text-wow-border">·</span>
      <span title="NA reset (Tue 15:00 UTC)">NA {formatCountdown(t, na)}</span>
    </span>
  )
}

export function Header() {
  const t                 = useTranslations('nav')
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-wow-border bg-wow-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-wow-gold text-lg">⚔️</span>
            <span className="font-heading text-wow-gold text-sm font-semibold tracking-wide group-hover:text-wow-gold-bright transition-colors">
              {t('logo')}
            </span>
          </Link>

          {session?.user && (
            <Link
              href="/characters"
              className="text-xs text-wow-muted hover:text-wow-text transition-colors hidden sm:block"
            >
              {t('chars')}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-wow-muted hidden sm:block">
            <ResetCountdown />
          </span>

{session?.user && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-wow-muted hidden sm:block">
                {session.user.name?.split('#')[0] ?? session.user.email ?? '?'}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-xs text-wow-muted hover:text-red-400 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
