// WoW weekly reset: každé úterý 07:00 UTC

export function getCurrentWeekStart(): Date {
  const now = new Date()
  const day = now.getUTCDay() // 0 = neděle, 2 = úterý
  const daysToLastTuesday = (day + 5) % 7
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - daysToLastTuesday)
  weekStart.setUTCHours(7, 0, 0, 0)
  weekStart.setUTCMilliseconds(0)
  return weekStart
}

export function getNextReset(): Date {
  const weekStart = getCurrentWeekStart()
  const next = new Date(weekStart)
  next.setUTCDate(next.getUTCDate() + 7)
  return next
}

/** Vrátí strukturovaná čísla – formátování zajistí komponenta s překladem */
export function getTimeUntilReset(): { days: number; hours: number; mins: number } {
  const diff = getNextReset().getTime() - Date.now()
  return {
    days:  Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    mins:  Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  }
}

export function isAfterLastReset(timestamp: number): boolean {
  return timestamp >= getCurrentWeekStart().getTime()
}
