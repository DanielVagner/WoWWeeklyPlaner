'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { getTimeUntilReset } from '@/lib/reset'

function ResetCountdown() {
  const t = useTranslations('reset')
  const { days, hours, mins } = getTimeUntilReset()

  if (days > 0)  return <span>{t('days',  { days, hours })}</span>
  if (hours > 0) return <span>{t('hours', { hours, mins })}</span>
  return              <span>{t('mins',  { mins })}</span>
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

          <LanguageSwitcher />

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
