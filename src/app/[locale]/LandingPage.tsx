'use client'

import { signIn } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function LandingPage() {
  const t      = useTranslations()
  const locale = useLocale()

  return (
    <div className="min-h-dvh flex flex-col bg-wow-gradient relative overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
          style={{ background: 'radial-gradient(circle, #3FC7EB 0%, transparent 70%)' }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚔️</span>
          <span className="font-heading text-wow-gold font-semibold tracking-wide">
            {t('nav.logo')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <span className="text-xs text-wow-muted border border-wow-border px-3 py-1 rounded-full">
            {t('nav.season')}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-24 gap-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-5xl sm:text-6xl font-heading font-bold leading-tight text-balance">
            <span className="text-wow-text">{t('landing.headline1')}</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #c9a84c, #f0d060, #c9a84c)' }}
            >
              {t('landing.headline2')}
            </span>
          </h1>
          <p className="text-wow-muted text-lg leading-relaxed text-balance">
            {t('landing.subtitle')}
          </p>
        </div>

        {/* Login button */}
        <button
          onClick={() => signIn('battlenet', { callbackUrl: `/${locale}/dashboard` })}
          className="
            flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-base
            bg-[#0078ff] hover:bg-[#0066dd] active:scale-[0.98]
            transition-all duration-150 shadow-lg shadow-blue-900/30
          "
        >
          <BattleNetIcon />
          {t('landing.loginButton')}
        </button>

        <p className="text-xs text-wow-muted max-w-sm text-balance">
          {t('landing.disclaimer')}
        </p>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl w-full mt-8">
          {(['vault', 'priority', 'multichar'] as const).map((key) => (
            <div
              key={key}
              className="bg-wow-surface border border-wow-border rounded-xl p-5 text-left"
            >
              <div className="text-2xl mb-3">
                {key === 'vault' ? '🗝️' : key === 'priority' ? '📋' : '👥'}
              </div>
              <h3 className="font-heading font-semibold text-wow-text text-sm mb-1">
                {t(`landing.features.${key}.title`)}
              </h3>
              <p className="text-xs text-wow-muted leading-relaxed">
                {t(`landing.features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 text-center text-xs text-wow-muted/50 pb-6">
        {t('landing.footer')}
      </footer>
    </div>
  )
}

function BattleNetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm0 2a6 6 0 100 12A6 6 0 0012 6zm0 2a4 4 0 110 8 4 4 0 010-8z" />
    </svg>
  )
}
