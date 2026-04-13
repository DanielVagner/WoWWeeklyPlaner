import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { CharacterSelectList } from './CharacterSelectList'

interface Props { params: Promise<{ locale: string }> }

export default async function CharactersPage({ params }: Props) {
  const { locale } = await params
  const session    = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}`)

  const t = await getTranslations('characters')

  const characters = await db.character.findMany({
    where:   { userId: session.user.id },
    orderBy: [{ isTracked: 'desc' }, { avgIlvl: 'desc' }],
  })

  return (
    <div className="min-h-dvh flex flex-col bg-wow-bg">
      <Header />

      <main className="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-semibold text-wow-text mb-1">
            {t('title')}
          </h1>
          <p className="text-sm text-wow-muted">{t('hint')}</p>
        </div>

        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="text-4xl">⚔️</span>
            <p className="text-sm text-wow-muted max-w-sm">{t('empty')}</p>
          </div>
        ) : (
          <CharacterSelectList initialChars={characters.map((c) => ({
            id:        c.id,
            name:      c.name,
            realm:     c.realm,
            class:     c.class,
            spec:      c.spec ?? '',
            avgIlvl:   c.avgIlvl,
            level:     c.level,
            isTracked: c.isTracked,
          }))} />
        )}
      </main>
    </div>
  )
}
