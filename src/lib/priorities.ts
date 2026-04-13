import { missingForNextSlot, mpVaultIlvl } from './vault'
import { VAULT_THRESHOLDS, SEASON_CONFIG } from './constants'

export interface Reward {
  type: 'vault' | 'vault_upgrade' | 'direct_drop' | 'gold'
  ilvl?: number
  ilvlGain?: number
  estimate?: string
}

export interface Priority {
  id: string
  rank: number
  /** Hodnoty pro next-intl t(`priorities.${id}.title|reason`, params) */
  params: Record<string, string | number>
  actionCount: number
  rewards: Reward[]
}

export interface CharacterState {
  avgIlvl: number
  mpRunsDone: number
  mpHighestKey: number
  raidBossesDone: number
  delvesDone: number
}

export function generatePriorities(state: CharacterState): Priority[] {
  const priorities: Priority[] = []
  const ilvlGap = SEASON_CONFIG.heroicCap - state.avgIlvl

  // 1. Nejbližší M+ Vault slot
  const mpNeeded = missingForNextSlot(state.mpRunsDone, VAULT_THRESHOLDS.mp)
  if (mpNeeded > 0 && ilvlGap > 2) {
    const ilvl = mpVaultIlvl(state.mpHighestKey)
    priorities.push({
      id:          'mp-vault-slot',
      rank:        1,
      params:      { count: mpNeeded, ilvl, gap: Math.round(ilvlGap) },
      actionCount: mpNeeded,
      rewards:     [{ type: 'vault', ilvl }, { type: 'direct_drop' }],
    })
  }

  // 2. Key push
  if (state.mpHighestKey > 0 && state.mpHighestKey < 10 && state.mpRunsDone >= 2) {
    const currentIlvl = mpVaultIlvl(state.mpHighestKey)
    const nextIlvl    = mpVaultIlvl(state.mpHighestKey + 1)
    if (nextIlvl > currentIlvl) {
      priorities.push({
        id:          'mp-key-push',
        rank:        priorities.length + 1,
        params:      { level: state.mpHighestKey + 1, gain: nextIlvl - currentIlvl },
        actionCount: 1,
        rewards:     [{ type: 'vault_upgrade', ilvlGain: nextIlvl - currentIlvl }],
      })
    }
  }

  // 3. Raid Vault slot
  const raidNeeded = missingForNextSlot(state.raidBossesDone, VAULT_THRESHOLDS.raid)
  if (raidNeeded > 0) {
    priorities.push({
      id:          'raid-vault-slot',
      rank:        priorities.length + 1,
      params:      { count: raidNeeded },
      actionCount: raidNeeded,
      rewards:     [{ type: 'vault', ilvl: 623 }, { type: 'direct_drop' }],
    })
  }

  // 4. Delves
  const delveNeeded = missingForNextSlot(state.delvesDone, VAULT_THRESHOLDS.delve)
  if (delveNeeded > 0) {
    priorities.push({
      id:          'delve-vault-slot',
      rank:        priorities.length + 1,
      params:      { count: delveNeeded },
      actionCount: delveNeeded,
      rewards:     [{ type: 'vault', ilvl: 616 }],
    })
  }

  // 5. Crafting weekly CD (vždy)
  priorities.push({
    id:          'crafting-cooldowns',
    rank:        priorities.length + 1,
    params:      {},
    actionCount: 0,
    rewards:     [{ type: 'gold', estimate: '200–1500g' }],
  })

  return priorities
}
