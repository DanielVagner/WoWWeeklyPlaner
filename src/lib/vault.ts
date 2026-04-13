import { VAULT_THRESHOLDS, mpVaultIlvl, SEASON_CONFIG } from './constants'

// ─── Threshold helpers ────────────────────────────────────────────────────────

export function nextThreshold(
  current: number,
  thresholds: readonly number[]
): number | null {
  return thresholds.find((t) => current < t) ?? null
}

export function missingForNextSlot(
  current: number,
  thresholds: readonly number[]
): number {
  const next = nextThreshold(current, thresholds)
  return next !== null ? next - current : 0
}

export function completedSlots(
  current: number,
  thresholds: readonly number[]
): number {
  return thresholds.filter((t) => current >= t).length
}

// ─── Vault state per aktivita ─────────────────────────────────────────────────

export interface VaultColumn {
  /** Klíč pro překlad: t(`vault.${type}`) */
  type: 'mp' | 'raid' | 'delve'
  icon: string
  done: number
  slots: number
  thresholds: readonly number[]
  rewardIlvl: number | null
  missingForNext: number
}

export function buildVaultState(
  mpRunsDone: number,
  mpHighestKey: number,
  raidBossesDone: number,
  delvesDone: number
): { mp: VaultColumn; raid: VaultColumn; delve: VaultColumn } {
  const mpIlvl = mpHighestKey > 0 ? mpVaultIlvl(mpHighestKey) : null

  return {
    mp: {
      type:           'mp',
      icon:           '⚔️',
      done:           mpRunsDone,
      slots:          completedSlots(mpRunsDone, VAULT_THRESHOLDS.mp),
      thresholds:     VAULT_THRESHOLDS.mp,
      rewardIlvl:     mpIlvl,
      missingForNext: missingForNextSlot(mpRunsDone, VAULT_THRESHOLDS.mp),
    },
    raid: {
      type:           'raid',
      icon:           '🏛️',
      done:           raidBossesDone,
      slots:          completedSlots(raidBossesDone, VAULT_THRESHOLDS.raid),
      thresholds:     VAULT_THRESHOLDS.raid,
      rewardIlvl:     623,
      missingForNext: missingForNextSlot(raidBossesDone, VAULT_THRESHOLDS.raid),
    },
    delve: {
      type:           'delve',
      icon:           '🗝️',
      done:           delvesDone,
      slots:          completedSlots(delvesDone, VAULT_THRESHOLDS.delve),
      thresholds:     VAULT_THRESHOLDS.delve,
      rewardIlvl:     616,
      missingForNext: missingForNextSlot(delvesDone, VAULT_THRESHOLDS.delve),
    },
  }
}

export const totalVaultSlots = (
  mpRunsDone: number,
  raidBossesDone: number,
  delvesDone: number
) =>
  completedSlots(mpRunsDone, VAULT_THRESHOLDS.mp) +
  completedSlots(raidBossesDone, VAULT_THRESHOLDS.raid) +
  completedSlots(delvesDone, VAULT_THRESHOLDS.delve)

export { mpVaultIlvl, SEASON_CONFIG }
