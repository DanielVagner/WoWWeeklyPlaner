'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Priority } from '@/lib/priorities'
import { Badge } from '@/components/ui/Badge'

interface PriorityListProps {
  priorities: Priority[]
  tasksDone:  string[]
  charId:     string
}

export function PriorityList({ priorities, tasksDone: initial, charId }: PriorityListProps) {
  const t                  = useTranslations('planner.priorities')
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set(initial))
  const [isPending, startTransition] = useTransition()

  function toggleTask(taskId: string) {
    const next = new Set(tasksDone)
    next.has(taskId) ? next.delete(taskId) : next.add(taskId)
    setTasksDone(next)

    startTransition(async () => {
      await fetch(`/api/weekly/${charId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tasksDone: [...next] }),
      })
    })
  }

  return (
    <ol className="space-y-2">
      {priorities.map((p) => {
        const done = tasksDone.has(p.id)

        return (
          <li
            key={p.id}
            onClick={() => toggleTask(p.id)}
            className={`
              flex gap-3 p-4 rounded-xl border cursor-pointer
              transition-all duration-200 select-none
              ${done
                ? 'border-wow-green/30 bg-wow-green/5 opacity-60'
                : 'border-wow-border bg-wow-surface hover:border-wow-gold/30 hover:bg-wow-surface-2'
              }
            `}
          >
            {/* Rank / Checkmark */}
            <div className={`
              shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border
              ${done ? 'border-wow-green/50 text-wow-green' : 'border-wow-border text-wow-muted'}
            `}>
              {done ? '✓' : p.rank}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium text-sm ${done ? 'line-through text-wow-muted' : 'text-wow-text'}`}>
                  {t(`${p.id}.title`, p.params)}
                </span>
                {p.rewards.map((r, i) => (
                  <RewardBadge key={i} reward={r} t={t} />
                ))}
              </div>
              <p className="text-xs text-wow-muted mt-1 leading-relaxed">
                {t(`${p.id}.reason`, p.params)}
              </p>
            </div>

            {isPending && (
              <div className="shrink-0 w-3 h-3 border border-wow-muted/50 border-t-transparent rounded-full animate-spin mt-1" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function RewardBadge({
  reward,
  t,
}: {
  reward: Priority['rewards'][number]
  t: ReturnType<typeof useTranslations<'planner.priorities'>>
}) {
  if (reward.type === 'vault' && reward.ilvl)
    return <Badge color="gold">{t('rewards.vault', { ilvl: reward.ilvl })}</Badge>
  if (reward.type === 'vault_upgrade' && reward.ilvlGain)
    return <Badge color="green">{t('rewards.vaultUpgrade', { gain: reward.ilvlGain })}</Badge>
  if (reward.type === 'direct_drop')
    return <Badge color="gray">{t('rewards.drop')}</Badge>
  if (reward.type === 'gold' && reward.estimate)
    return <Badge color="gold">{t('rewards.gold', { estimate: reward.estimate })}</Badge>
  return null
}
