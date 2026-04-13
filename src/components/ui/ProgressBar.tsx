interface ProgressBarProps {
  value: number   // 0–max
  max: number
  color?: string  // CSS color pro fill
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max,
  color = '#c9a84c',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-wow-surface rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-wow-muted w-10 text-right shrink-0">
          {value}/{max}
        </span>
      )}
    </div>
  )
}
