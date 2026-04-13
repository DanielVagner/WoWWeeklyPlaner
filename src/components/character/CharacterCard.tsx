import type { Character } from '@prisma/client'
import { Link } from '@/i18n/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ClassBadge } from './ClassBadge'
import { TrackingToggle } from './TrackingToggle'
import { getClassColor } from '@/lib/constants'

interface CharacterCardProps {
  character: Character
  mpRating?: number
  vaultSlots?: number // 0–9
}

export function CharacterCard({ character, mpRating, vaultSlots = 0 }: CharacterCardProps) {
  const classColor = getClassColor(character.class)
  const ilvl       = Math.round(character.avgIlvl)
  const syncedAgo  = character.lastSyncedAt ? getRelativeTime(character.lastSyncedAt) : 'Nikdy'

  return (
    <Link href={`/character/${character.id}`}>
      <Card
        hover
        className={[
          'relative overflow-hidden cursor-pointer animate-fadeIn transition-all',
          character.isTracked ? 'ring-1 ring-wow-gold/30' : 'opacity-70 hover:opacity-100',
        ].join(' ')}
      >
        {/* Barevný pruh třídy vlevo */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: classColor }}
        />

        {/* Tracking toggle – hvězdička vpravo nahoře */}
        <TrackingToggle characterId={character.id} initialTracked={character.isTracked} />

        <div className="pl-3 pr-7">
          {/* Jméno + realm */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3
                className="font-heading font-semibold text-base leading-tight"
                style={{ color: classColor }}
              >
                {character.name}
              </h3>
              <p className="text-xs text-wow-muted mt-0.5">{character.realm}</p>
            </div>
            <Badge color="gold">{ilvl} ilvl</Badge>
          </div>

          {/* Třída + spec */}
          <div className="mb-3">
            <ClassBadge className={character.class} spec={character.spec || undefined} />
          </div>

          {/* Stats řádek */}
          <div className="flex items-center gap-3 text-xs text-wow-muted">
            {mpRating !== undefined && mpRating > 0 && (
              <span className="text-blue-400">⚔ {Math.round(mpRating)}</span>
            )}
            <span>
              <span className="text-wow-text font-medium">{vaultSlots}</span>/9 vault
            </span>
            <span className="ml-auto">{syncedAgo}</span>
          </div>
        </div>

        {/* Vault progress bar */}
        <div className="mt-3 pl-3">
          <div className="h-1 bg-wow-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-wow-gold transition-all duration-500"
              style={{ width: `${(vaultSlots / 9) * 100}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}

function getRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
