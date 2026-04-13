import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { CharacterCard } from '@/components/character/CharacterCard'
import { SyncCharactersButton } from './SyncCharactersButton'
import { AutoSync, STALE_SECS } from './AutoSync'
import { getCurrentWeekStart } from '@/lib/reset'
import { totalVaultSlots } from '@/lib/vault'

interface Props { params: Promise<{ locale: string }> }

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params
  const session    = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}`)

  const t          = await getTranslations()
  const weekStart  = getCurrentWeekStart()
  const characters = await db.character.findMany({
    where:   { userId: session.user.id, isTracked: true },
    orderBy: { avgIlvl: 'desc' },
    include: { weeklyStates: { where: { weekStart } } },
  })

  const totalChars = await db.character.count({ where: { userId: session.user.id } })

  const firstName  = session.user.name?.split('#')[0] ?? ''
  const nowMs      = Date.now()
  const staleIds   = characters
    .filter((c) => {
      if (!c.lastSyncedAt) return true
      return (nowMs - new Date(c.lastSyncedAt).getTime()) / 1000 > STALE_SECS
    })
    .map((c) => c.id)

  return (
    <div className="min-h-dvh flex flex-col bg-wow-bg">
      <AutoSync staleIds={staleIds} />
      <Header />

      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-wow-text">
              {t('dashboard.greeting', { name: firstName })}
            </h1>
          </div>
          <SyncCharactersButton hasCharacters={totalChars > 0} />
        </div>

        {totalChars === 0 ? (
          /* Never synced – no characters at all */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="text-4xl">⚔️</span>
            <h2 className="font-heading text-xl text-wow-text">
              {t('dashboard.empty.title')}
            </h2>
            <p className="text-sm text-wow-muted max-w-sm">
              {t('dashboard.empty.description')}
            </p>
          </div>
        ) : characters.length === 0 ? (
          /* Has characters but none tracked */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="text-4xl">⭐</span>
            <h2 className="font-heading text-xl text-wow-text">
              {t('dashboard.noTracked.title')}
            </h2>
            <p className="text-sm text-wow-muted max-w-sm">
              {t('dashboard.noTracked.description')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => {
              const state      = char.weeklyStates[0]
              const vaultSlots = state
                ? totalVaultSlots(state.mpRunsDone, state.raidBossesDone, state.delvesDone)
                : 0
              return (
                <CharacterCard key={char.id} character={char} vaultSlots={vaultSlots} />
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
