'use client'

import { useTranslations } from 'next-intl'
import type { VaultColumn } from '@/lib/vault'

interface VaultTrackerProps {
  mp: VaultColumn
  raid: VaultColumn
  delve: VaultColumn
}

export function VaultTracker({ mp, raid, delve }: VaultTrackerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <VaultColumnCard col={mp}    accentColor="#3FC7EB" />
      <VaultColumnCard col={raid}  accentColor="#F48CBA" />
      <VaultColumnCard col={delve} accentColor="#c9a84c" />
    </div>
  )
}

function VaultColumnCard({ col, accentColor }: { col: VaultColumn; accentColor: string }) {
  const t = useTranslations()

  const nextThreshold  = col.thresholds[col.slots] ?? null
  const prevThreshold  = col.slots > 0 ? col.thresholds[col.slots - 1] : 0
  const segmentSize    = nextThreshold !== null ? nextThreshold - prevThreshold : 1
  const progressInSeg  = col.done - prevThreshold

  return (
    <div className="bg-wow-surface border border-wow-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{col.icon}</span>
        <span className="text-xs font-medium text-wow-text">
          {t(`vault.${col.type}`)}
        </span>
      </div>

      {/* 3 vault sloty */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <VaultSlot
            key={i}
            filled={i < col.slots}
            ilvl={i < col.slots ? col.rewardIlvl : null}
            color={accentColor}
          />
        ))}
      </div>

      {nextThreshold !== null ? (
        <>
          <div className="h-1 bg-wow-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (progressInSeg / segmentSize) * 100)}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
          <p className="text-xs text-wow-muted leading-tight">
            {t('planner.vault.progress', {
              done:      col.done,
              threshold: nextThreshold,
              missing:   col.missingForNext,
            })}
          </p>
        </>
      ) : (
        <p className="text-xs font-medium" style={{ color: accentColor }}>
          {t('planner.vault.allUnlocked')}
        </p>
      )}
    </div>
  )
}

function VaultSlot({
  filled,
  ilvl,
  color,
}: {
  filled: boolean
  ilvl: number | null
  color: string
}) {
  return (
    <div
      className={`
        flex-1 aspect-square rounded-lg flex flex-col items-center justify-center border transition-all duration-300
        ${filled ? 'border-transparent' : 'border-wow-border/40 bg-wow-bg/50'}
      `}
      style={filled ? { backgroundColor: `${color}25`, borderColor: `${color}60` } : {}}
    >
      {filled ? (
        <>
          <span className="text-xs font-bold" style={{ color }}>{ilvl ?? '—'}</span>
          <span className="text-[9px] text-wow-muted">ilvl</span>
        </>
      ) : (
        <span className="text-wow-border text-lg">+</span>
      )}
    </div>
  )
}
