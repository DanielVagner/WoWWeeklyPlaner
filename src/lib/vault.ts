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
  /** M+ only: ilvl for each unlocked slot (slot 1 = highest key, slot 2 = 4th, slot 3 = 8th) */
  slotIlvls: (number | null)[]
  missingForNext: number
}

const parseKeys = (raw: string): number[] => { try { return JSON.parse(raw) } catch { return [] } }

export function buildVaultState(
  mpRunsDone: number,
  mpHighestKey: number,
  mpTopKeys: string,
  raidBossesDone: number,
  delvesDone: number
): { mp: VaultColumn; raid: VaultColumn; delve: VaultColumn } {
  // M+ vault rewards: slot1 = highest key, slot2 = 4th highest, slot3 = 8th highest
  const keys      = parseKeys(mpTopKeys)
  const slotIlvls: (number | null)[] = [
    keys[0] != null ? mpVaultIlvl(keys[0]) : (mpHighestKey > 0 ? mpVaultIlvl(mpHighestKey) : null),
    keys[3] != null ? mpVaultIlvl(keys[3]) : null,
    keys[7] != null ? mpVaultIlvl(keys[7]) : null,
  ]

  return {
    mp: {
      type:           'mp',
      icon:           '⚔️',
      done:           mpRunsDone,
      slots:          completedSlots(mpRunsDone, VAULT_THRESHOLDS.mp),
      thresholds:     VAULT_THRESHOLDS.mp,
      rewardIlvl:     slotIlvls[0],
      slotIlvls,
      missingForNext: missingForNextSlot(mpRunsDone, VAULT_THRESHOLDS.mp),
    },
    raid: {
      type:           'raid',
      icon:           '🏛️',
      done:           raidBossesDone,
      slots:          completedSlots(raidBossesDone, VAULT_THRESHOLDS.raid),
      thresholds:     VAULT_THRESHOLDS.raid,
      rewardIlvl:     263,
      slotIlvls:      [263, 263, 263],
      missingForNext: missingForNextSlot(raidBossesDone, VAULT_THRESHOLDS.raid),
    },
    delve: {
      type:           'delve',
      icon:           '🗝️',
      done:           delvesDone,
      slots:          completedSlots(delvesDone, VAULT_THRESHOLDS.delve),
      thresholds:     VAULT_THRESHOLDS.delve,
      rewardIlvl:     250,
      slotIlvls:      [250, 250, 250],
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
