import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { fetchCharacterProfile, fetchMythicProfile, fetchRaidEncounters, fetchCharacterDelves, fetchRaiderIOWeeklyRuns } from '@/lib/blizzard/client'
import { getWeekStart, isAfterLastReset } from '@/lib/reset'

interface Params { params: Promise<{ id: string }> }

// POST /api/characters/[id]/sync – synchronizuje data postavy + týdenní stav
export async function POST(_req: Request, { params }: Params) {
  try {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const character = await db.character.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!character) return NextResponse.json({ error: 'Character not found' }, { status: 404 })

  const account = await db.account.findFirst({
    where: { userId: session.user.id, provider: 'battlenet' },
  })
  if (!account?.access_token) {
    return NextResponse.json({ error: 'No Battle.net token' }, { status: 400 })
  }

  const token     = account.access_token
  const realm     = character.realmSlug
  const name      = character.name

  // Paralelní fetch – profil, M+, raid encounters, delves + Raider.IO weekly runs
  const [profileResult, mythicResult, raidResult, delvesResult, raiderIOResult] = await Promise.allSettled([
    fetchCharacterProfile(realm, name, token),
    fetchMythicProfile(realm, name, token),
    fetchRaidEncounters(realm, name, token),
    fetchCharacterDelves(realm, name, token),
    fetchRaiderIOWeeklyRuns(character.region, realm, name),
  ])

  // Pokud všechny Blizzard volání selhala s 401, token expiroval → user se musí přihlásit znovu
  const blizzardResults = [profileResult, mythicResult, raidResult, delvesResult]
  const allFailed       = blizzardResults.every((r) => r.status === 'rejected')
  const anyUnauthorized = blizzardResults.some(
    (r) => r.status === 'rejected' && String((r as PromiseRejectedResult).reason).includes('401')
  )
  if (allFailed && anyUnauthorized) {
    return NextResponse.json({ error: 'Battle.net token expired – please sign in again' }, { status: 401 })
  }

  // --- Update character profilu ---
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null
  if (profile) {
    await db.character.update({
      where: { id },
      data: {
        avgIlvl:     profile.equipped_item_level ?? profile.average_item_level ?? character.avgIlvl,
        level:       profile.level ?? character.level,
        spec:        profile.active_spec?.name ?? character.spec,
        lastSyncedAt: new Date(),
      },
    })
  }

  // --- M+ statistiky pro tento týden ---
  const mythic      = mythicResult.status === 'fulfilled' ? mythicResult.value : null
  const weekStartMs = getWeekStart(character.region).getTime()

  // Počet runů: Raider.IO vrací všechny runy toho týdne (včetně opakování stejného dungeonu).
  // Blizzard current_period.best_runs vrací jen best-per-dungeon → podhodnocuje vault count.
  const raiderIO       = raiderIOResult.status === 'fulfilled' ? raiderIOResult.value : null
  const raiderIORuns   = raiderIO?.mythic_plus_weekly_highest_level_runs ?? []

  // Highest key: z Blizzard season best_runs nebo Raider.IO weekly runs
  const periodRuns = mythic?.current_period?.best_runs
  const blizzardRuns =
    periodRuns && periodRuns.length > 0
      ? periodRuns
      : (mythic?.best_runs ?? []).filter((r) => r.completed_timestamp >= weekStartMs)

  // Raider.IO returns runs sorted highest → lowest; take top 8 for vault slot calculation
  const sortedKeys   = raiderIORuns.map((r) => r.mythic_level)
  const mpTopKeys    = JSON.stringify(sortedKeys.slice(0, 8))

  const mpRunsDone   = raiderIORuns.length > 0
    ? raiderIORuns.length
    : blizzardRuns.length

  const mpHighestKey = sortedKeys.length > 0
    ? sortedKeys[0]
    : blizzardRuns.reduce((max, r) => Math.max(max, r.keystone_level), 0)

  // --- Raid bossi tento týden ---
  // Prohledáme VŠECHNY expanze (WoW Midnight nemusí být poslední v poli).
  // Dedup po encounter ID, priority MYTHIC → HEROIC → NORMAL → LFR.
  let raidBossesDone = 0
  if (raidResult.status === 'fulfilled') {
    const killedEncounterIds = new Set<number>()
    const difficultyPriority = ['MYTHIC', 'HEROIC', 'NORMAL', 'LFR']

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

  // --- Delves Tier 8+ tento týden ---
  // API může vracet i nižší tiery a jiné world aktivity – filtrujeme přísně.
  // Pokud API selže nebo vrátí neznámou strukturu, zachováme stávající ruční počet.
  let delvesDone: number | undefined
  if (delvesResult.status === 'fulfilled') {
    const delvesData = delvesResult.value
    const allRuns = (delvesData.delves ?? []).flatMap(
      (d) => d.weekly_runs ?? d.best_runs ?? []
    )
    const tier8PlusThisWeek = allRuns.filter(
      (r) => r.is_completed && r.tier >= 8 && isAfterLastReset(r.completed_timestamp)
    )
    // Pouze přepíšeme pokud API vrátí validní data (alespoň existuje pole delves)
    if (delvesData.delves !== undefined) {
      delvesDone = tier8PlusThisWeek.length
    }
  }

  // --- Upsert WeeklyState ---
  const weekStart = getWeekStart(character.region)

  // Existující stav – zachováme ruční hodnoty pokud jsou vyšší než API data.
  // Blizzard API vrací jen best-run-per-dungeon pro M+, takže může podhodnotit
  // celkový počet runů. Pokud uživatel zadal víc ručně, nebudeme to přemazat.
  const existingState = await db.weeklyState.findUnique({
    where: { characterId_weekStart: { characterId: id, weekStart } },
    select: { delvesDone: true, mpRunsDone: true },
  })

  const finalDelvesDone = delvesDone ?? existingState?.delvesDone ?? 0
  const finalMpRunsDone = Math.max(mpRunsDone, existingState?.mpRunsDone ?? 0)

  const weeklyState = await db.weeklyState.upsert({
    where: {
      characterId_weekStart: { characterId: id, weekStart },
    },
    create: {
      characterId:   id,
      weekStart,
      mpRunsDone:    finalMpRunsDone,
      mpHighestKey,
      mpTopKeys,
      raidBossesDone,
      delvesDone:    finalDelvesDone,
      tasksDone:     '[]',
    },
    update: {
      mpRunsDone:    finalMpRunsDone,
      mpHighestKey,
      mpTopKeys,
      raidBossesDone,
      delvesDone: finalDelvesDone,
    },
  })

  const updatedCharacter = await db.character.findUnique({ where: { id } })

  return NextResponse.json({ character: updatedCharacter, weeklyState, mythic })
  } catch (err) {
    console.error('[sync] unexpected error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
