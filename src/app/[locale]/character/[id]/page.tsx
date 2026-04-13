import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { ClassBadge } from '@/components/character/ClassBadge'
import { Badge } from '@/components/ui/Badge'
import { WeeklyPlanner } from '@/components/planner/WeeklyPlanner'
import { getCurrentWeekStart } from '@/lib/reset'
import { getClassColor } from '@/lib/constants'

interface Props { params: Promise<{ locale: string; id: string }> }

export default async function CharacterPage({ params }: Props) {
  const { locale, id } = await params
  const session        = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}`)

  const t         = await getTranslations('character')
  const character = await db.character.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!character) notFound()

  const weekStart   = getCurrentWeekStart()
  const weeklyState = await db.weeklyState.findUnique({
    where: { characterId_weekStart: { characterId: id, weekStart } },
  })

  const classColor = getClassColor(character.class)

  return (
    <div className="min-h-dvh flex flex-col bg-wow-bg">
      <Header />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        <Link
          href={`/${locale}/dashboard`}
          className="text-xs text-wow-muted hover:text-wow-text transition-colors"
        >
          {t('backLink')}
        </Link>

        {/* Character header */}
        <div
          className="rounded-2xl border p-6 relative overflow-hidden"
          style={{ borderColor: `${classColor}40`, backgroundColor: `${classColor}08` }}
        >
          <div
            className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: classColor }}
          />
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <h1
                className="font-heading text-3xl font-bold leading-none"
                style={{ color: classColor }}
              >
                {character.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <ClassBadge className={character.class} spec={character.spec || undefined} />
                <span className="text-xs text-wow-muted">{character.realm}</span>
                <span className="text-xs text-wow-muted">·</span>
                <span className="text-xs text-wow-muted">{character.region.toUpperCase()}</span>
              </div>
            </div>
            <Badge color="gold" className="text-base px-3 py-1">
              {Math.round(character.avgIlvl)} ilvl
            </Badge>
          </div>
        </div>

        <WeeklyPlanner character={character} weeklyState={weeklyState} />
      </main>
    </div>
  )
}
