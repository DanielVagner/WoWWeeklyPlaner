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
  const raidBossesDone = state?.raidBossesDone ?? 0
  const delvesDone     = state?.delvesDone     ?? 0
  const tasksDone      = parseTasks(state?.tasksDone ?? '[]')

  const vault      = buildVaultState(mpRunsDone, mpHighestKey, raidBossesDone, delvesDone)
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

  async function updateDelves(value: number) {
    const next = Math.max(0, Math.min(8, value))
    setState((prev) => prev ? { ...prev, delvesDone: next } : null)
    await fetch(`/api/weekly/${character.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ delvesDone: next }),
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

      {/* Delve counter (manuální) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-wow-muted uppercase tracking-wider">
            {t('planner.delves.sectionTitle')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateDelves(delvesDone - 1)}
              className="w-7 h-7 rounded-lg bg-wow-surface-2 border border-wow-border text-wow-text hover:border-wow-gold/40 transition-colors text-sm"
            >
              −
            </button>
            <span className="text-wow-text font-semibold w-4 text-center">{delvesDone}</span>
            <button
              onClick={() => updateDelves(delvesDone + 1)}
              className="w-7 h-7 rounded-lg bg-wow-surface-2 border border-wow-border text-wow-text hover:border-wow-gold/40 transition-colors text-sm"
            >
              +
            </button>
          </div>
        </div>
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
