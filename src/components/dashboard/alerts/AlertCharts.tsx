'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import type { AlertItem } from './AlertMetrics'

interface AlertChartsProps {
  alerts: AlertItem[]
}

const SEVERITY_COLORS: Record<string, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#9ca3af',
}

const STATUS_COLORS: Record<string, string> = {
  Open: '#f59e0b',
  Resolved: '#10b981',
}

const CATEGORY_COLORS: Record<string, string> = {
  Safety: '#ef4444',
  Equipment: '#3b82f6',
  Compliance: '#f59e0b',
  Health: '#8b5cf6',
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

interface CustomTooltipPayloadItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: CustomTooltipPayloadItem[]
  label?: string
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)]">
      {label && (
        <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
      )}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-900 dark:text-white">
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function AlertCharts({ alerts }: AlertChartsProps) {
  // Weekly trend — alerts per day over the last 7 days
  const weeklyData = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' })
      const count = alerts.filter((a) => a.date === dateStr).length
      days.push({ day: dayLabel, alerts: count, date: dateStr })
    }
    return days
  }, [alerts])

  // Severity breakdown for donut
  const severityData = useMemo(() => {
    const counts: Record<string, number> = { High: 0, Medium: 0, Low: 0 }
    alerts.forEach((a) => {
      counts[capitalize(a.severity)]++
    })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [alerts])

  // Status breakdown for donut
  const statusData = useMemo(() => {
    const open = alerts.filter((a) => a.status === 'open').length
    const resolved = alerts.filter((a) => a.status === 'resolved').length
    return [
      { name: 'Open', value: open },
      { name: 'Resolved', value: resolved },
    ].filter((d) => d.value > 0)
  }, [alerts])

  // Category breakdown for horizontal bars
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    alerts.forEach((a) => {
      const cat = capitalize(a.category)
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [alerts])

  const totalAlerts = alerts.length
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length
  const resolutionRate =
    totalAlerts > 0 ? Math.round((resolvedCount / totalAlerts) * 100) : 0

  if (alerts.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: Weekly Trend — spans 2 cols */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5 lg:col-span-2">
        <SectionHeader title="Weekly Trend" />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Alerts reported per day over the last 7 days
        </p>
        <div className="mt-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-subtle)"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="fill-gray-400 dark:fill-gray-500"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="fill-gray-400 dark:fill-gray-500"
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar
                dataKey="alerts"
                name="Alerts"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right: Stacked breakdown charts */}
      <div className="flex flex-col gap-6">
        {/* Severity Distribution donut */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
          <SectionHeader title="Severity Breakdown" />
          <div className="mt-2 h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={SEVERITY_COLORS[entry.name]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-900 text-lg font-bold dark:fill-white"
                >
                  {totalAlerts}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400 text-[10px] dark:fill-gray-500"
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-2 flex items-center justify-center gap-4">
            {severityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[entry.name] }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Rate donut */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
          <SectionHeader title="Resolution Rate" />
          <div className="mt-2 h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-900 text-lg font-bold dark:fill-white"
                >
                  {resolutionRate}%
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400 text-[10px] dark:fill-gray-500"
                >
                  Resolved
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-2 flex items-center justify-center gap-4">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Category Breakdown — full width */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5 lg:col-span-3">
        <SectionHeader title="Alerts by Category" />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Issue distribution across safety categories
        </p>
        <div className="mt-4 space-y-3">
          {categoryData.map((cat) => {
            const maxVal = Math.max(...categoryData.map((c) => c.value))
            const pct = maxVal > 0 ? (cat.value / maxVal) * 100 : 0
            const color = CATEGORY_COLORS[cat.name] || '#6b7280'
            return (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {cat.name}
                </span>
                <div className="flex-1">
                  <div className="h-6 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                    <div
                      className="flex h-full items-center rounded-md px-2 text-xs font-semibold text-white transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 12)}%`,
                        backgroundColor: color,
                      }}
                    >
                      {cat.value}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { AlertCharts }
export type { AlertChartsProps }
