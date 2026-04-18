// ─── Blizzard API response types ─────────────────────────────────────────────

export interface BlizzardCharacter {
  id: number
  name: string
  realm: { slug: string; name: string }
  character_class: { id: number; name: string }
  active_spec: { id: number; name: string }
  faction: { type: 'ALLIANCE' | 'HORDE'; name: string }
  race: { id: number; name: string }
  level: number
  equipped_item_level: number
  average_item_level: number
}

export interface BlizzardAccountCharacter {
  character: { href: string }
  faction: { type: 'ALLIANCE' | 'HORDE' }
  id: number
  name: string
  realm: { slug: string; name: string; id: number }
  playable_class: { id: number; name: string }
  playable_race: { id: number; name: string }
  gender: { type: string; name: string }
  level: number
  protected_character: { href: string }
  last_login_timestamp: number
  average_item_level: number
  equipped_item_level: number
}

export interface BlizzardAccountWoWProfile {
  wow_accounts: Array<{
    id: number
    characters: BlizzardAccountCharacter[]
  }>
}

export interface MythicKeystoneRun {
  dungeon: { id: number; name: string }
  keystone_level: number
  duration: number
  completed_timestamp: number
  is_completed_within_time: boolean
  affixes: Array<{ id: number; name: string }>
  members: Array<{
    character: { name: string; realm: { slug: string } }
    specialization: { id: number; name: string }
    role: string
  }>
}

export interface MythicKeystoneProfile {
  current_mythic_rating?: { rating: number; color: { r: number; g: number; b: number } }
  best_runs?: MythicKeystoneRun[]
  current_period?: {
    period: { id: number }
    best_runs: MythicKeystoneRun[]
  }
  season_id: number
}

export interface RaidEncounter {
  encounter: { id: number; name: string }
  completed_count: number
  last_kill_timestamp: number
}

export interface RaidMode {
  difficulty: { type: 'NORMAL' | 'HEROIC' | 'MYTHIC'; name: string }
  status: { type: 'IN_PROGRESS' | 'COMPLETE'; name: string }
  progress: {
    completed_count: number
    total_count: number
    encounters: RaidEncounter[]
  }
}

export interface RaidEncountersResponse {
  expansions: Array<{
    expansion: { id: number; name: string }
    instances: Array<{
      instance: { id: number; name: string }
      modes: RaidMode[]
    }>
  }>
}

// ─── Raider.IO ───────────────────────────────────────────────────────────────

export interface RaiderIOWeeklyRun {
  dungeon: string
  mythic_level: number
  completed_at: string
  score: number
}

export interface RaiderIOProfileResponse {
  mythic_plus_weekly_highest_level_runs?: RaiderIOWeeklyRun[]
}

// Blizzard returns delve activity through the character encounters/delves endpoint.
// Each entry represents a delve map with weekly runs per tier.
export interface DelveRun {
  completed_timestamp: number  // ms since epoch
  tier: number                 // 1–11
  is_completed: boolean
}

export interface CharacterDelvesResponse {
  delves?: Array<{
    delve: { id: number; name: string }
    best_runs?: DelveRun[]
    weekly_runs?: DelveRun[]
  }>
}
