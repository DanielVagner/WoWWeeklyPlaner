import type {
  BlizzardAccountWoWProfile,
  BlizzardCharacter,
  CharacterDelvesResponse,
  MythicKeystoneProfile,
  RaidEncountersResponse,
} from './types'

const REGION = process.env.BLIZZARD_REGION ?? 'eu'
const API_BASE = `https://${REGION}.api.blizzard.com`

// ─── Client Credentials token (pro game-data endpointy jako AH) ──────────────

let ccToken: string | null = null
let ccTokenExpiry = 0

async function getClientCredentialsToken(): Promise<string> {
  if (ccToken && Date.now() < ccTokenExpiry) return ccToken

  const credentials = Buffer.from(
    `${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`https://${REGION}.battle.net/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`CC token error: ${res.status}`)

  const data = await res.json()
  ccToken = data.access_token
  ccTokenExpiry = Date.now() + (data.expires_in - 60) * 1000

  return ccToken!
}

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function blizzardFetch<T>(
  endpoint: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`)
  url.searchParams.set('locale', 'en_US')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Blizzard API ${res.status}: ${endpoint}`)

  return res.json() as Promise<T>
}

// ─── Profile API (vyžaduje OAuth token hráče) ────────────────────────────────

export async function fetchAccountCharacters(
  accessToken: string
): Promise<BlizzardAccountWoWProfile> {
  return blizzardFetch<BlizzardAccountWoWProfile>(
    '/profile/user/wow',
    accessToken,
    { namespace: `profile-${REGION}` }
  )
}

export async function fetchCharacterProfile(
  realm: string,
  name: string,
  accessToken: string
): Promise<BlizzardCharacter> {
  return blizzardFetch<BlizzardCharacter>(
    `/profile/wow/character/${realm}/${name.toLowerCase()}`,
    accessToken,
    { namespace: `profile-${REGION}` }
  )
}

export async function fetchMythicProfile(
  realm: string,
  name: string,
  accessToken: string
): Promise<MythicKeystoneProfile> {
  const n = name.toLowerCase()
  const profileBase = `/profile/wow/character/${realm}/${n}`

  // Nejdřív zjistíme aktuální season ID + základní rating paralelně
  const [seasonIndex, baseProfile] = await Promise.all([
    blizzardFetch<{ current_season: { id: number } }>(
      '/data/wow/mythic-keystone/season/index',
      accessToken,
      { namespace: `dynamic-${REGION}` }
    ),
    blizzardFetch<{ current_mythic_rating?: MythicKeystoneProfile['current_mythic_rating'] }>(
      `${profileBase}/mythic-keystone-profile`,
      accessToken,
      { namespace: `profile-${REGION}` }
    ),
  ])

  const seasonId = seasonIndex.current_season.id

  const seasonData = await blizzardFetch<{
    best_runs?: MythicKeystoneProfile['best_runs']
    current_period?: MythicKeystoneProfile['current_period']
  }>(
    `${profileBase}/mythic-keystone-profile/season/${seasonId}`,
    accessToken,
    { namespace: `profile-${REGION}` }
  )

  return {
    current_mythic_rating: baseProfile.current_mythic_rating,
    best_runs: seasonData.best_runs ?? [],
    current_period: seasonData.current_period,
    season_id: seasonId,
  }
}

export async function fetchRaidEncounters(
  realm: string,
  name: string,
  accessToken: string
): Promise<RaidEncountersResponse> {
  return blizzardFetch<RaidEncountersResponse>(
    `/profile/wow/character/${realm}/${name.toLowerCase()}/encounters/raids`,
    accessToken,
    { namespace: `profile-${REGION}` }
  )
}

// Delves – endpoint může v různých patchích vracet různé struktury.
// Failuje gracefully (allSettled).
export async function fetchCharacterDelves(
  realm: string,
  name: string,
  accessToken: string
): Promise<CharacterDelvesResponse> {
  return blizzardFetch<CharacterDelvesResponse>(
    `/profile/wow/character/${realm}/${name.toLowerCase()}/encounters/delves`,
    accessToken,
    { namespace: `profile-${REGION}` }
  )
}

// ─── Game Data API (client credentials) ──────────────────────────────────────

export async function fetchAhCommodities(): Promise<{
  auctions: Array<{ item: { id: number }; quantity: number; unit_price: number }>
}> {
  const token = await getClientCredentialsToken()
  return blizzardFetch(
    '/data/wow/auctions/commodities',
    token,
    { namespace: `dynamic-${REGION}` }
  )
}
