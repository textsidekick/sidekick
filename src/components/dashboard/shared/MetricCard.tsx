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
  action?: React.ReactNode
}


function MetricCard({
  label, value, icon: Icon, subtext, iconClassName = 'h-5 w-5 text-gray-400',
  previousValue, change, valueClassName, dateRange, isHighlighted = false, accentColor, action,
}: MetricCardProps) {
  const TrendIcon = change !== undefined ? (change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus) : null

  const borderClass = isHighlighted ? 'border-blue-200' : 'border-gray-200'
  const accentClass = ''

  return (
    <div className={`rounded-xl border bg-white p-5 ${borderClass} ${accentClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
          {dateRange && <p className="mt-0.5 text-[10px] text-gray-400">{dateRange}</p>}
        </div>
        <Icon className={iconClassName} />
      </div>
      <div className={'mt-2 text-3xl font-bold leading-none ' + (valueClassName || 'text-gray-900')}>
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
