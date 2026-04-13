import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  fetchAccountCharacters,
  fetchCharacterProfile,
  fetchMythicProfile,
  fetchRaidEncounters,
  fetchCharacterDelves,
} from '@/lib/blizzard/client'
import { getCurrentWeekStart, isAfterLastReset } from '@/lib/reset'

// GET /api/characters – vrátí postavy uložené v DB
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const characters = await db.character.findMany({
    where:   { userId: session.user.id },
    orderBy: [{ avgIlvl: 'desc' }],
  })

  return NextResponse.json(characters)
}

// POST /api/characters – bulk sync z Blizzard API
// • Všechny postavy: upsert + detailní profil (ilvl, spec)
// • Pouze isTracked=true: navíc M+, raid, delves → WeeklyState
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const account = await db.account.findFirst({
    where: { userId: session.user.id, provider: 'battlenet' },
  })
  if (!account?.access_token) {
    return NextResponse.json({ error: 'No Battle.net token' }, { status: 400 })
  }

  const token   = account.access_token
  const region  = process.env.BLIZZARD_REGION ?? 'eu'
  const profile = await fetchAccountCharacters(token)

  const allChars = profile.wow_accounts.flatMap((acc) =>
    acc.characters.filter((c) => c.level >= 70)
  )

  // Krok 1 – upsert základního záznamu
  await Promise.all(
    allChars.map((c) =>
      db.character.upsert({
        where:  { characterId: c.id },
        create: {
          userId:      session.user.id,
          characterId: c.id,
          name:        c.name,
          realm:       c.realm.name,
          realmSlug:   c.realm.slug,
          region,
          class:       c.playable_class.name,
          level:       c.level,
          avgIlvl:     c.equipped_item_level ?? c.average_item_level ?? 0,
        },
        update: { name: c.name, realm: c.realm.name, level: c.level },
      })
    )
  )

  // Krok 2 – detailní profil (ilvl + spec) pro všechny
  const detailResults = await Promise.allSettled(
    allChars.map(async (c) => {
      const detail = await fetchCharacterProfile(c.realm.slug, c.name, token)
      return {
        characterId: c.id,
        avgIlvl:     detail.equipped_item_level ?? detail.average_item_level ?? 0,
        level:       detail.level ?? c.level,
        spec:        detail.active_spec?.name ?? '',
      }
    })
  )

  await Promise.all(
    detailResults.map((r) => {
      if (r.status !== 'fulfilled') return
      const { characterId, avgIlvl, level, spec } = r.value
      return db.character.update({
        where: { characterId },
        data:  { avgIlvl, level, spec, lastSyncedAt: new Date() },
      })
    })
  )

  // Krok 3 – full weekly sync jen pro isTracked=true postavy
  const trackedChars = await db.character.findMany({
    where: { userId: session.user.id, isTracked: true },
  })

  if (trackedChars.length > 0) {
    const weekStart    = getCurrentWeekStart()
    const weekStartMs  = weekStart.getTime()
    const difficultyPriority = ['MYTHIC', 'HEROIC', 'NORMAL', 'LFR']

    await Promise.allSettled(
      trackedChars.map(async (char) => {
        const [mythicResult, raidResult, delvesResult] = await Promise.allSettled([
          fetchMythicProfile(char.realmSlug, char.name, token),
          fetchRaidEncounters(char.realmSlug, char.name, token),
          fetchCharacterDelves(char.realmSlug, char.name, token),
        ])

        // M+
        const mythic = mythicResult.status === 'fulfilled' ? mythicResult.value : null
        const currentPeriodRuns =
          mythic?.current_period?.best_runs ??
          (mythic?.best_runs ?? []).filter((r) => r.completed_timestamp >= weekStartMs)
        const mpRunsDone   = currentPeriodRuns.length
        const mpHighestKey = currentPeriodRuns.reduce((max, r) => Math.max(max, r.keystone_level), 0)

        // Raid – prohledáme VŠECHNY expanze (ne jen poslední)
        let raidBossesDone = 0
        if (raidResult.status === 'fulfilled') {
          const killedEncounterIds = new Set<number>()
          for (const expansion of raidResult.value.expansions ?? []) {
            for (const instance of expansion.instances) {
              for (const diffType of difficultyPriority) {
                const mode = instance.modes.find((m) => m.difficulty.type === diffType)
                if (!mode) continue
                for (const enc of mode.progress.encounters) {
                  if (
                    !killedEncounterIds.has(enc.encounter.id) &&
                    enc.last_kill_timestamp &&
                    isAfterLastReset(enc.last_kill_timestamp)
                  ) {
                    killedEncounterIds.add(enc.encounter.id)
                  }
                }
              }
            }
          }
          raidBossesDone = killedEncounterIds.size
        }

        // Delves Tier 8+
        let delvesDone: number | undefined
        if (delvesResult.status === 'fulfilled') {
          const data    = delvesResult.value
          const allRuns = (data.delves ?? []).flatMap((d) => d.weekly_runs ?? d.best_runs ?? [])
          const valid   = allRuns.filter(
            (r) => r.is_completed && r.tier >= 8 && isAfterLastReset(r.completed_timestamp)
          )
          if (data.delves !== undefined) delvesDone = valid.length
        }

        const existing = await db.weeklyState.findUnique({
          where: { characterId_weekStart: { characterId: char.id, weekStart } },
          select: { delvesDone: true },
        })
        const finalDelvesDone = delvesDone ?? existing?.delvesDone ?? 0

        await db.weeklyState.upsert({
          where:  { characterId_weekStart: { characterId: char.id, weekStart } },
          create: { characterId: char.id, weekStart, mpRunsDone, mpHighestKey, raidBossesDone, delvesDone: finalDelvesDone, tasksDone: '[]' },
          update: { mpRunsDone, mpHighestKey, raidBossesDone, delvesDone: finalDelvesDone },
        })
      })
    )
  }

  const updated = await db.character.findMany({
    where:   { userId: session.user.id },
    orderBy: [{ isTracked: 'desc' }, { avgIlvl: 'desc' }],
  })

  return NextResponse.json(updated)
}
