'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { routing } from '@/i18n/routing'

export function LanguageSwitcher() {
  const locale   = useLocale()
  const router   = useRouter()
  const pathname = usePathname()

  function switchLocale(next: string) {
    // Nahradíme prefix locale v URL: /en/dashboard → /cs/dashboard
    const segments = pathname.split('/')
    segments[1]    = next
    router.push(segments.join('/'))
  }

  return (
    <div className="flex items-center gap-1 p-0.5 bg-wow-surface border border-wow-border rounded-lg">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`
            px-2.5 py-1 rounded text-xs font-medium transition-all duration-150
            ${locale === loc
              ? 'bg-wow-gold text-wow-bg'
              : 'text-wow-muted hover:text-wow-text'
            }
          `}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
