'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import type { AlertItem, Severity, AlertStatus } from './AlertMetrics'

type FilterStatus = 'open' | 'resolved' | 'all'

interface AlertsTableProps {
  alerts: AlertItem[]
}

const SEVERITY_STYLES: Record<Severity, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-transparent',
  medium:
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-transparent',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-transparent',
}

const STATUS_DOT_COLORS: Record<AlertStatus, string> = {
  open: 'bg-amber-400',
  resolved: 'bg-emerald-400',
}

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All' },
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function AlertsTable({ alerts }: AlertsTableProps) {
  const [filter, setFilter] = useState<FilterStatus>('open')

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts
    return alerts.filter((a) => a.status === filter)
  }, [alerts, filter])

  const filterCounts = useMemo(() => {
    const open = alerts.filter((a) => a.status === 'open').length
    const resolved = alerts.filter((a) => a.status === 'resolved').length
    return { open, resolved, all: alerts.length }
  }, [alerts])

  const isEmpty = alerts.length === 0

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title="Issues"
        action={
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={ShieldAlert}
          title="No issues reported"
          description="Safety alerts and issues reported by workers will appear here."
        />
      ) : (
        <>
          {/* Segmented control */}
          <div className="mt-3 mb-4 inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                className={
                  filter === opt.value
                    ? 'rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition-all dark:bg-gray-700 dark:text-white [box-shadow:var(--card-shadow)]'
                    : 'rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 transition-all hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              >
                {opt.label} ({filterCounts[opt.value]})
              </button>
            ))}
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent dark:border-gray-800">
                <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Issue
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Worker
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Severity
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <TableCell className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.issue}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {alert.worker}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={SEVERITY_STYLES[alert.severity]}
                    >
                      {capitalize(alert.severity)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT_COLORS[alert.status]}`}
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {capitalize(alert.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(alert.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}

export { AlertsTable }
export type { AlertsTableProps }
