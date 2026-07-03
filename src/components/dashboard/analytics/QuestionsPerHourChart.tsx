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
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { BarChart3 } from 'lucide-react'

export interface HourlyDataPoint {
  hour: string
  questions: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 [box-shadow:var(--card-shadow)]">
      <p className="text-xs font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">
        {payload[0].value} question{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

interface QuestionsPerHourChartProps {
  data?: HourlyDataPoint[]
}

function QuestionsPerHourChart({ data = [] }: QuestionsPerHourChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const hasData = data.length > 0 && data.some(d => d.questions > 0)

  return (
    <div className="rounded-xl border border-gray-200 bg-white [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title="Questions per Hour"
        subtitle="Question volume throughout the day"
      />
      {!hasData ? (
        <div className="h-[240px] flex items-center justify-center">
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            description="Question volume by hour will appear here once workers start asking questions."
          />
        </div>
      ) : (
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                fill="#0060F0"
                radius={[3, 3, 0, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export { QuestionsPerHourChart }
