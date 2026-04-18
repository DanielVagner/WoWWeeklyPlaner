'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Character, WeeklyState } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { VaultTracker } from './VaultTracker'
import { PriorityList } from './PriorityList'
import { buildVaultState } from '@/lib/vault'

const parseTasks = (raw: string): string[] => { try { return JSON.parse(raw) } catch { return [] } }
import { generatePriorities } from '@/lib/priorities'

interface WeeklyPlannerProps {
  character:   Character
  weeklyState: WeeklyState | null
}

export function WeeklyPlanner({ character, weeklyState: initialState }: WeeklyPlannerProps) {
  const t                  = useTranslations()
  const [state, setState]  = useState(initialState)
  const [syncing, startSync] = useTransition()

  const mpRunsDone     = state?.mpRunsDone     ?? 0
  const mpHighestKey   = state?.mpHighestKey   ?? 0
  const mpTopKeys      = state?.mpTopKeys      ?? '[]'
  const raidBossesDone = state?.raidBossesDone ?? 0
  const delvesDone     = state?.delvesDone     ?? 0
  const tasksDone      = parseTasks(state?.tasksDone ?? '[]')

  const vault      = buildVaultState(mpRunsDone, mpHighestKey, mpTopKeys, raidBossesDone, delvesDone)
  const priorities = generatePriorities({
    avgIlvl: character.avgIlvl,
    mpRunsDone,
    mpHighestKey,
    raidBossesDone,
    delvesDone,
  })

  function handleSync() {
    startSync(async () => {
      const res = await fetch(`/api/characters/${character.id}/sync`, { method: 'POST' })
      if (!res.ok) return
      const data = await res.json()
      setState(data.weeklyState)
    })
  }

  const syncedLabel = character.lastSyncedAt
    ? t('character.syncedAt', { date: new Date(character.lastSyncedAt).toLocaleString() })
    : t('character.neverSynced')

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sync bar */}
      <div className="flex items-center justify-between py-3 px-4 bg-wow-surface border border-wow-border rounded-xl">
        <span className="text-xs text-wow-muted">{syncedLabel}</span>
        <Button variant="primary" loading={syncing} onClick={handleSync}>
          {syncing ? t('character.syncing') : t('character.syncButton')}
        </Button>
      </div>

      {/* Vault tracker */}
      <section>
        <h2 className="text-sm font-medium text-wow-muted uppercase tracking-wider mb-3">
          {t('planner.vault.sectionTitle')}
        </h2>
        <VaultTracker mp={vault.mp} raid={vault.raid} delve={vault.delve} />
      </section>

      {/* Priority list */}
      <section>
        <h2 className="text-sm font-medium text-wow-muted uppercase tracking-wider mb-3">
          {t('planner.priorities.sectionTitle')}
        </h2>
        <PriorityList priorities={priorities} tasksDone={tasksDone} charId={character.id} />
      </section>
    </div>
  )
}
