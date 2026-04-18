// WoW weekly reset times (UTC):
//   EU: Wednesday 04:00 UTC
//   NA: Tuesday  15:00 UTC
//   KR/TW: Wednesday 09:00 UTC

const RESET: Record<string, { day: number; hour: number }> = {
  eu: { day: 3, hour: 4  },
  us: { day: 2, hour: 15 },
  kr: { day: 3, hour: 9  },
  tw: { day: 3, hour: 9  },
}

function resolveConfig(region: string) {
  return RESET[region.toLowerCase()] ?? RESET.eu
}

export function getWeekStart(region = 'eu'): Date {
  const { day, hour } = resolveConfig(region)
  const now  = new Date()
  let back   = (now.getUTCDay() - day + 7) % 7

  // Same day but before reset time → go back a full week
  if (back === 0 && now.getUTCHours() < hour) back = 7

  const d = new Date(now)
  d.setUTCDate(now.getUTCDate() - back)
  d.setUTCHours(hour, 0, 0, 0)
  return d
}

export function getNextReset(region = 'eu'): Date {
  const next = getWeekStart(region)
  next.setUTCDate(next.getUTCDate() + 7)
  return next
}

export function getTimeUntilReset(region = 'eu'): { days: number; hours: number; mins: number } {
  const diff = getNextReset(region).getTime() - Date.now()
  return {
    days:  Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    mins:  Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  }
}

export function isAfterLastReset(timestamp: number, region = 'eu'): boolean {
  return timestamp >= getWeekStart(region).getTime()
}

// Legacy aliases so existing call-sites without a region arg keep working
export const getCurrentWeekStart = () => getWeekStart('eu')
