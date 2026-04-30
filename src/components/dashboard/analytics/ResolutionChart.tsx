'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

interface ResolutionData {
  label: string
  resolved: number
  escalated: number
  unanswered: number
}

const []: ResolutionData[] = [
  { label: 'Mon', resolved: 32, escalated: 5, unanswered: 3 },
  { label: 'Tue', resolved: 38, escalated: 8, unanswered: 2 },
  { label: 'Wed', resolved: 42, escalated: 4, unanswered: 6 },
  { label: 'Thu', resolved: 55, escalated: 7, unanswered: 3 },
  { label: 'Fri', resolved: 48, escalated: 12, unanswered: 8 },
  { label: 'Sat', resolved: 15, escalated: 3, unanswered: 2 },
  { label: 'Sun', resolved: 8, escalated: 2, unanswered: 1 },
]

const BARS = [
  { key: 'resolved', name: 'Resolved', color: '#6366f1', darkColor: '#818cf8' },
  { key: 'escalated', name: 'Escalated', color: '#a78bfa', darkColor: '#c4b5fd' },
  { key: 'unanswered', name: 'Unanswered', color: '#e2e8f0', darkColor: '#475569' },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-200 bg-white dark:bg-white px-3 py-2.5 [box-shadow:var(--card-shadow)]">
      <p className="mb-1.5 text-xs font-medium text-gray-900 dark:text-gray-900">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{entry.name}</span>
          <span className="ml-auto text-xs font-medium text-gray-900 dark:text-gray-900 tabular-nums">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function ResolutionChart() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader title="Resolution Rate" subtitle="How questions are handled daily" />
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#2a2d3a' : '#f0f0f0'}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            />
            {BARS.map((b) => (
              <Bar
                key={b.key}
                dataKey={b.key}
                name={b.name}
                fill={isDark ? b.darkColor : b.color}
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export { ResolutionChart }
