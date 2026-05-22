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
} from 'recharts'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { TrendingUp } from 'lucide-react'

export interface QuestionsChartDataPoint {
  label: string
  count: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 [box-shadow:var(--card-shadow)]">
      <p className="mb-1.5 text-xs font-medium text-gray-900">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-gray-500">{entry.name}</span>
          <span className="ml-auto text-xs font-medium text-gray-900 tabular-nums">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

interface QuestionsChartProps {
  data?: QuestionsChartDataPoint[]
}

function QuestionsChart({ data = [] }: QuestionsChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const hasData = data.length > 0 && data.some(d => d.count > 0)

  return (
    <div className="rounded-xl border border-gray-200 bg-white [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title="Questions Over Time"
        subtitle="Daily question volume"
      />
      {!hasData ? (
        <div className="h-[280px] flex items-center justify-center">
          <EmptyState
            icon={TrendingUp}
            title="No data yet"
            description="Question trends over time will appear here."
          />
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient-questions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C96442" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#C96442" stopOpacity={0} />
                </linearGradient>
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
              <Area
                type="monotone"
                dataKey="count"
                name="Questions"
                stroke="#C96442"
                strokeWidth={2}
                fill="url(#gradient-questions)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export { QuestionsChart }
