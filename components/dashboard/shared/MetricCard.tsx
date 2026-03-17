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
  isHighlighted?: boolean
}

function MetricCard({
  label,
  value,
  icon: Icon,
  subtext,
  iconClassName = 'h-5 w-5 text-gray-400 dark:text-gray-500',
  previousValue,
  change,
  dateRange,
  isHighlighted = false,
}: MetricCardProps) {
  const getTrendColor = (val: number) => {
    if (val > 0) return 'text-emerald-600 dark:text-emerald-400'
    if (val < 0) return 'text-red-500 dark:text-red-400'
    return 'text-gray-400 dark:text-gray-500'
  }

  const getTrendBg = (val: number) => {
    if (val > 0) return 'bg-emerald-50 dark:bg-emerald-950/40'
    if (val < 0) return 'bg-red-50 dark:bg-red-950/40'
    return 'bg-gray-100 dark:bg-gray-800'
  }

  const TrendIcon = change !== undefined
    ? change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus
    : null

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5 ${
        isHighlighted
          ? 'border-blue-200 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900/50'
          : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
          </span>
          {dateRange && (
            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
              {dateRange}
            </p>
          )}
        </div>
        <Icon className={iconClassName} />
      </div>
      <div className="mt-2 text-3xl font-bold leading-none text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {previousValue !== undefined && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {previousValue}
          </span>
        )}
        {change !== undefined && TrendIcon && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${getTrendBg(change)} ${getTrendColor(change)}`}
          >
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
            <TrendIcon className="h-3 w-3" />
          </span>
        )}
        {subtext && !previousValue && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{subtext}</p>
        )}
      </div>
    </div>
  )
}

export { MetricCard }
export type { MetricCardProps }
