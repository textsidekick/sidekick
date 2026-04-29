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
} from 'recharts'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

type TimeRange = '1 day' | '1 week' | '1 month' | '1 year' | 'All Time'

const TIME_RANGES: TimeRange[] = ['1 day', '1 week', '1 month', '1 year', 'All Time']

interface HourlyData {
  hour: string
  questions: number
}

const MOCK_HOURLY: HourlyData[] = [
  { hour: '12a', questions: 2 },
  { hour: '1a', questions: 1 },
  { hour: '2a', questions: 0 },
  { hour: '3a', questions: 0 },
  { hour: '4a', questions: 1 },
  { hour: '5a', questions: 4 },
  { hour: '6a', questions: 12 },
  { hour: '7a', questions: 28 },
  { hour: '8a', questions: 35 },
  { hour: '9a', questions: 42 },
  { hour: '10a', questions: 38 },
  { hour: '11a', questions: 31 },
  { hour: '12p', questions: 22 },
  { hour: '1p', questions: 18 },
  { hour: '2p', questions: 25 },
  { hour: '3p', questions: 33 },
  { hour: '4p', questions: 29 },
  { hour: '5p', questions: 15 },
  { hour: '6p', questions: 8 },
  { hour: '7p', questions: 5 },
  { hour: '8p', questions: 3 },
  { hour: '9p', questions: 2 },
  { hour: '10p', questions: 1 },
  { hour: '11p', questions: 1 },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 [box-shadow:var(--card-shadow)]">
      <p className="text-xs font-medium text-gray-900 dark:text-white">{label}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {payload[0].value} question{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function QuestionsPerHourChart() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [range, setRange] = useState<TimeRange>('1 day')

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title="Questions per Hour"
        subtitle="Question volume"
        action={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
              {TIME_RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    range === r
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white [box-shadow:var(--card-shadow)]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Refresh data">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_HOURLY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#2a2d3a' : '#f0f0f0'}
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="questions"
              fill={isDark ? '#818cf8' : '#6366f1'}
              radius={[3, 3, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export { QuestionsPerHourChart }
