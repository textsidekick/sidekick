'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, ShieldAlert, Search, CheckCircle2, Eye, BellOff } from 'lucide-react'
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
  high: 'bg-[#C0392B] text-white dark:bg-red-950 dark:text-red-400 border-transparent',
  medium:
    'bg-[#E9C46A] text-white dark:bg-amber-950 dark:text-amber-400 border-transparent',
  low: 'bg-gray-100 text-gray-600 dark:bg-white dark:text-gray-400 border-transparent',
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
  const [search, setSearch] = useState('')

  const filteredAlerts = useMemo(() => {
    let result = alerts
    if (filter !== 'all') {
      result = result.filter((a) => a.status === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.issue.toLowerCase().includes(q) ||
          a.worker.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      )
    }
    return result
  }, [alerts, filter, search])

  const filterCounts = useMemo(() => {
    const open = alerts.filter((a) => a.status === 'open').length
    const resolved = alerts.filter((a) => a.status === 'resolved').length
    return { open, resolved, all: alerts.length }
  }, [alerts])

  const isEmpty = alerts.length === 0

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
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
          title="No open issues"
          description="Safety alerts and issues reported by workers will appear here. When your team reports concerns via Sidekick, they show up in this list."
        />
      ) : (
        <>
          {/* Filter bar: segmented control + search */}
          <div className="mt-3 mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-white">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilter(opt.value)}
                  className={
                    filter === opt.value
                      ? 'rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition-all dark:bg-gray-700 dark:text-gray-900 [box-shadow:var(--card-shadow)]'
                      : 'rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 transition-all hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-600'
                  }
                >
                  {opt.label} ({filterCounts[opt.value]})
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 rounded-lg border border-gray-200 bg-transparent pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:ring-1 focus:ring-blue-200 dark:border-gray-200 dark:text-gray-900 dark:placeholder-gray-500 dark:focus:border-blue-700 dark:focus:ring-blue-900"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent dark:border-gray-200">
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
                <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className="group/row border-b border-gray-100 hover:bg-gray-50 dark:border-gray-200 dark:hover:bg-white/50"
                >
                  <TableCell className="text-sm font-medium text-gray-900 dark:text-gray-900">
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
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
                      {alert.status === 'open' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-md text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400"
                          title="Mark resolved"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-gray-400 hover:text-[#C96442] dark:text-gray-500 dark:hover:text-[#C96442]"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-600"
                        title="Dismiss"
                      >
                        <BellOff className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </>
      )}
    </div>
  )
}

export { AlertsTable }
export type { AlertsTableProps }
