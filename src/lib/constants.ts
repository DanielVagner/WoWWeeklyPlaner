// ─── WoW Season konfigurace ───────────────────────────────────────────────────

export const SEASON_CONFIG = {
  id: Number(process.env.NEXT_PUBLIC_WOW_SEASON_ID ?? 13),
  name: 'Midnight Season 1',
  heroicCap: 626,
  mythicCap: 639,
} as const

// ─── Vault thresholdy ─────────────────────────────────────────────────────────

export const VAULT_THRESHOLDS = {
  mp:    [1, 4, 8] as const,
  raid:  [2, 4, 6] as const,
  delve: [2, 4, 8] as const,
} as const

// ─── WoW class colors ─────────────────────────────────────────────────────────

export const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  'Druid':        '#FF7C0A',
  'Evoker':       '#33937F',
  'Hunter':       '#AAD372',
  'Mage':         '#3FC7EB',
  'Monk':         '#00FF98',
  'Paladin':      '#F48CBA',
  'Priest':       '#FFFFFF',
  'Rogue':        '#FFF468',
  'Shaman':       '#0070DD',
  'Warlock':      '#8788EE',
  'Warrior':      '#C69B3A',
}

export function getClassColor(className: string): string {
  return CLASS_COLORS[className] ?? '#c9a84c'
}

// ─── Vault ilvl dle nejvyššího M+ klíče ──────────────────────────────────────

// Great Vault M+ reward ilvl per key level (Midnight Season 1)
export function mpVaultIlvl(keyLevel: number): number {
  if (keyLevel <= 0)  return 0
  if (keyLevel >= 10) return 266
  if (keyLevel >= 8)  return 263
  if (keyLevel >= 6)  return 259
  if (keyLevel >= 5)  return 256
  if (keyLevel >= 4)  return 253
  return 250  // key 1–3
}
