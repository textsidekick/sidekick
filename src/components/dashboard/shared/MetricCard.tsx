'use client'

import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

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
}

const ACCENT_BORDER: Record<string, string> = {
  amber:   'border-l-amber-400',
  red:     'border-l-red-400',
  emerald: 'border-l-emerald-400',
  blue:    'border-l-blue-400',
  purple:  'border-l-purple-400',
}

function MetricCard({
  label, value, icon: Icon, subtext, iconClassName = 'h-5 w-5 text-gray-400',
  previousValue, change, valueClassName, dateRange, isHighlighted = false, accentColor,
}: MetricCardProps) {
  const getTrendColor = (val: number) => {
    if (val > 0) return 'text-emerald-600'
    if (val < 0) return 'text-red-500'
    return 'text-gray-400'
  }
  const getTrendBg = (val: number) => {
    if (val > 0) return 'bg-emerald-50'
    if (val < 0) return 'bg-red-50'
    return 'bg-gray-100'
  }
  const TrendIcon = change !== undefined ? (change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus) : null

  const borderClass = isHighlighted ? 'border-blue-200' : 'border-gray-200 dark:border-gray-200'
  const accentClass = accentColor ? 'border-l-[3px] ' + ACCENT_BORDER[accentColor] : ''

  return (
    <div className={`rounded-xl border bg-white dark:bg-white p-5 ${borderClass} ${accentClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
          {dateRange && <p className="mt-0.5 text-[10px] text-gray-400">{dateRange}</p>}
        </div>
        <Icon className={iconClassName} />
      </div>
      <div className={'mt-2 text-3xl font-bold leading-none ' + (valueClassName || 'text-gray-900 dark:text-gray-900')}>
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {previousValue !== undefined && <span className="text-xs text-gray-400">{previousValue}</span>}
        {change !== undefined && TrendIcon && (
          <span className={'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ' + getTrendBg(change) + ' ' + getTrendColor(change)}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
            <TrendIcon className="h-3 w-3" />
          </span>
        )}
        {subtext && !previousValue && <p className="text-xs text-gray-400 dark:text-gray-500">{subtext}</p>}
      </div>
    </div>
  )
}

export { MetricCard }
export type { MetricCardProps }
