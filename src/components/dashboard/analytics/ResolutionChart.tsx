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
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { CheckCircle } from 'lucide-react'

export interface ResolutionDataPoint {
  label: string
  resolved: number
  unanswered: number
}

const BARS = [
  { key: 'resolved', name: 'Resolved', color: '#10b981', darkColor: '#34d399' },
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

interface ResolutionChartProps {
  data?: ResolutionDataPoint[]
}

function ResolutionChart({ data = [] }: ResolutionChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const hasData = data.length > 0 && data.some(d => d.resolved > 0 || d.unanswered > 0)

  return (
    <div className="rounded-xl border border-gray-200 bg-white [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader title="Resolution Rate" subtitle="How questions are handled daily" />
      {!hasData ? (
        <div className="h-[280px] flex items-center justify-center">
          <EmptyState
            icon={CheckCircle}
            title="No data yet"
            description="Resolution rates will appear here once questions are answered."
          />
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
      )}
    </div>
  )
}

export { ResolutionChart }
