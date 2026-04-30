'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

interface SourceData {
  name: string
  value: number
  color: string
  darkColor: string
}

const []: SourceData[] = [
  { name: 'Knowledge Base', value: 1247, color: '#6366f1', darkColor: '#818cf8' },
  { name: 'AI Generated', value: 834, color: '#a78bfa', darkColor: '#c4b5fd' },
  { name: 'Escalated to Manager', value: 289, color: '#e2e8f0', darkColor: '#475569' },
  { name: 'No Answer Found', value: 112, color: '#fbbf24', darkColor: '#f59e0b' },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: SourceData }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null
  const data = payload[0]
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-200 bg-white dark:bg-white px-3 py-2 [box-shadow:var(--card-shadow)]">
      <p className="text-xs font-medium text-gray-900 dark:text-gray-900">{data.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{data.value.toLocaleString()} questions</p>
    </div>
  )
}

function AnswerSourcesChart() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const total = [].reduce((sum, s) => sum + s.value, 0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader title="Answer Sources" subtitle="How questions are being resolved" />
      <div className="flex items-center gap-6">
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[]}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {[].map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={isDark ? entry.darkColor : entry.color}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-900">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="space-y-2.5 flex-1">
          {[].map((source) => (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: isDark ? source.darkColor : source.color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {source.name}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-900 tabular-nums">
                {source.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { AnswerSourcesChart }
