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
  raid:  [3, 6, 9] as const,
  delve: [1, 4, 8] as const,
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

export function mpVaultIlvl(highestKey: number): number {
  if (highestKey >= 13) return 629
  if (highestKey >= 12) return 628
  if (highestKey >= 11) return 626
  if (highestKey >= 10) return 625
  if (highestKey >= 9)  return 622
  if (highestKey >= 8)  return 619
  if (highestKey >= 7)  return 616
  return 613
}
