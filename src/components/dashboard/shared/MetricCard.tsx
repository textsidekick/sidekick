'use client'

import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtext?: string
  iconClassName?: string
  previousValue?: string | number
  change?: number
  dateRange?: string
  valueClassName?: string
  isHighlighted?: boolean
  accentColor?: 'amber' | 'red' | 'emerald' | 'blue' | 'purple'
  action?: React.ReactNode
}

const accentStyles: Record<string, { icon: string; border: string; indicator: string }> = {
  amber:   { icon: 'text-amber-500',   border: 'border-amber-100',   indicator: 'bg-amber-500' },
  red:     { icon: 'text-red-500',     border: 'border-red-100',     indicator: 'bg-red-500' },
  emerald: { icon: 'text-emerald-500', border: 'border-emerald-100', indicator: 'bg-emerald-500' },
  blue:    { icon: 'text-blue-500',    border: 'border-blue-100',    indicator: 'bg-blue-500' },
  purple:  { icon: 'text-purple-500',  border: 'border-purple-100',  indicator: 'bg-purple-500' },
}

function MetricCard({
  label, value, icon: Icon, subtext, iconClassName,
  previousValue, change, valueClassName, dateRange, isHighlighted = false, accentColor, action,
}: MetricCardProps) {
  const TrendIcon = change !== undefined ? (change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus) : null
  const accent = accentColor ? accentStyles[accentColor] : null

  return (
    <div className={cn(
      'rounded-xl border bg-white p-5 relative overflow-hidden',
      accent?.border || 'border-gray-200',
      isHighlighted && 'border-blue-200',
    )}>
      {/* Accent indicator strip */}
      {accent && (
        <div className={cn('absolute top-0 left-0 w-1 h-full rounded-l-xl', accent.indicator)} />
      )}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
          {dateRange && <p className="mt-0.5 text-[10px] text-gray-400">{dateRange}</p>}
        </div>
        <Icon className={iconClassName || cn('h-5 w-5', accent?.icon || 'text-gray-400')} />
      </div>
      <div className={cn('mt-2 text-3xl font-bold leading-none', valueClassName || 'text-gray-900')}>
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {previousValue !== undefined && <span className="text-xs text-gray-400">{previousValue}</span>}
        {change !== undefined && TrendIcon && (
          <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
            <TrendIcon className="h-3 w-3" />
          </span>
        )}
        {subtext && !previousValue && <p className="text-xs text-gray-400">{subtext}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export { MetricCard }
export type { MetricCardProps }
