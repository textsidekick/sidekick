'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

type TimeRange = '1D' | '1W' | '1M' | '3M' | 'ALL'

const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', 'ALL']

interface DataPoint {
  label: string
  safety: number
  training: number
  schedule: number
  hr: number
}

const MOCK_DATA_1W: DataPoint[] = [
  { label: 'Mon', safety: 12, training: 8, schedule: 15, hr: 5 },
  { label: 'Tue', safety: 18, training: 12, schedule: 9, hr: 7 },
  { label: 'Wed', safety: 15, training: 22, schedule: 11, hr: 4 },
  { label: 'Thu', safety: 24, training: 18, schedule: 14, hr: 9 },
  { label: 'Fri', safety: 20, training: 15, schedule: 22, hr: 11 },
  { label: 'Sat', safety: 8, training: 5, schedule: 6, hr: 2 },
  { label: 'Sun', safety: 4, training: 3, schedule: 4, hr: 1 },
]

const MOCK_DATA_1M: DataPoint[] = [
  { label: 'Week 1', safety: 85, training: 62, schedule: 71, hr: 28 },
  { label: 'Week 2', safety: 92, training: 78, schedule: 65, hr: 34 },
  { label: 'Week 3', safety: 78, training: 85, schedule: 82, hr: 41 },
  { label: 'Week 4', safety: 105, training: 71, schedule: 73, hr: 29 },
]

const SERIES = [
  { key: 'safety', name: 'Safety', color: '#ef4444', darkColor: '#f87171' },
  { key: 'training', name: 'Training', color: '#6366f1', darkColor: '#818cf8' },
  { key: 'schedule', name: 'Schedule', color: '#f59e0b', darkColor: '#fbbf24' },
  { key: 'hr', name: 'HR', color: '#10b981', darkColor: '#34d399' },
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

function QuestionsChart() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [range, setRange] = useState<TimeRange>('1W')

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const data = range === '1M' || range === '3M' || range === 'ALL' ? MOCK_DATA_1M : MOCK_DATA_1W

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title="Questions Over Time"
        subtitle="Question volume by category"
        action={
          <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-white p-0.5">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === r
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-900 [box-shadow:var(--card-shadow)]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? s.darkColor : s.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={isDark ? s.darkColor : s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
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
            {SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={isDark ? s.darkColor : s.color}
                strokeWidth={2}
                fill={`url(#gradient-${s.key})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export { QuestionsChart }
