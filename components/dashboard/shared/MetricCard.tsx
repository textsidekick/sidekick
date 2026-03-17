'use client'

import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtext?: string
  iconClassName?: string
}

function MetricCard({
  label,
  value,
  icon: Icon,
  subtext,
  iconClassName = 'h-5 w-5 text-gray-400 dark:text-gray-500',
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <Icon className={iconClassName} />
      </div>
      <div className="mt-2 text-3xl font-bold leading-none text-gray-900 dark:text-white">
        {value}
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {subtext}
        </p>
      )}
    </div>
  )
}

export { MetricCard }
export type { MetricCardProps }
