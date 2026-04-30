'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Upload, Clock } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

interface StorageSlice {
  name: string
  value: number
  color: string
  darkColor: string
}

const MOCK_STORAGE: StorageSlice[] = [
  { name: 'AI Models', value: 99.2, color: '#4338ca', darkColor: '#6366f1' },
  { name: 'Videos', value: 113.8, color: '#7c3aed', darkColor: '#a78bfa' },
  { name: 'Documents', value: 8.2, color: '#818cf8', darkColor: '#818cf8' },
  { name: 'Audio', value: 12, color: '#a5b4fc', darkColor: '#c7d2fe' },
  { name: 'Other', value: 448.1, color: '#c7d2fe', darkColor: '#e0e7ff' },
]

interface ActivityItem {
  action: string
  detail: string
  date: string
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { action: 'Uploaded', detail: '25 Files', date: 'Mar 15, 2026' },
  { action: 'Generated', detail: '3 Policies', date: 'Mar 14, 2026' },
  { action: 'Analyzed', detail: '12 Gaps', date: 'Mar 12, 2026' },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: StorageSlice }>
}

function ChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-200 bg-white dark:bg-white px-3 py-2 [box-shadow:var(--card-shadow)]">
      <p className="text-xs font-medium text-gray-900 dark:text-gray-900">
        {entry.name}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {entry.value} gb
      </p>
    </div>
  )
}

interface StorageSidebarProps {
  showMockData?: boolean
}

function StorageSidebar({ showMockData = false }: StorageSidebarProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const storageData = showMockData ? MOCK_STORAGE : MOCK_STORAGE.map(s => ({ ...s, value: 0 }))
  const totalStorage = storageData.reduce((sum, s) => sum + s.value, 0)
  const activityData = showMockData ? MOCK_ACTIVITY : []

  return (
    <div className="space-y-6">
      {/* Storage Donut Chart */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-900 mb-4">
          My Storage
        </h3>

        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={storageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {storageData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={isDark ? entry.darkColor : entry.color}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-900 leading-none">
              {totalStorage > 0 ? `${totalStorage.toFixed(1)}` : '0'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              / 1000 gb used
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          {MOCK_STORAGE.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: isDark ? entry.darkColor : entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-900 tabular-nums">
                {showMockData ? `${entry.value} gb` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-900 mb-4">
          Recent Activity
        </h3>

        {activityData.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No recent activity"
            description="Activity from uploads, policy generation, and gap analysis will appear here"
          />
        ) : (
          <div className="space-y-4">
            {activityData.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Upload className="h-4 w-4 text-[#C96442] dark:text-[#C96442]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
                    {item.action} {item.detail}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { StorageSidebar }
export type { StorageSidebarProps }
