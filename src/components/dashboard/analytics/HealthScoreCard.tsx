'use client'

import { Activity } from 'lucide-react'

interface HealthScoreCardProps {
  score: number
  maxScore?: number
}

function getScoreColor(score: number): { text: string; bar: string } {
  if (score >= 80) return { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' }
  if (score >= 60) return { text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' }
  return { text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' }
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Fair'
  return 'Needs Attention'
}

function HealthScoreCard({ score, maxScore = 100 }: HealthScoreCardProps) {
  const colors = getScoreColor(score)
  const percentage = Math.min((score / maxScore) * 100, 100)

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Health Score
        </span>
        <Activity className="h-5 w-5 text-emerald-500" />
      </div>
      <div className={`mt-2 text-3xl font-bold leading-none ${colors.text}`}>
        {score}
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-400">
            {getScoreLabel(score)}
          </span>
          <span className="text-xs tabular-nums text-gray-400">
            {score}/{maxScore}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full ${colors.bar} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export { HealthScoreCard }
export type { HealthScoreCardProps }
