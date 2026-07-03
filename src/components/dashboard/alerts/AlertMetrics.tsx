'use client'

import { Clock, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/shared/MetricCard'

type Severity = 'high' | 'medium' | 'low'
type AlertStatus = 'open' | 'resolved'
type AlertCategory = 'safety' | 'equipment' | 'compliance' | 'health'

interface AlertItem {
  id: string
  issue: string
  worker: string
  severity: Severity
  status: AlertStatus
  date: string
  category: AlertCategory
}

interface AlertMetricsProps {
  alerts: AlertItem[]
}

function AlertMetrics({ alerts }: AlertMetricsProps) {
  const openIssues = alerts.filter((a) => a.status === 'open').length
  const highPriority = alerts.filter(
    (a) => a.severity === 'high' && a.status === 'open'
  ).length
  const resolved = alerts.filter((a) => a.status === 'resolved').length
  const totalReported = alerts.length

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Open Issues"
        value={openIssues}
        icon={Clock}
        iconClassName="h-5 w-5 text-amber-500"
        accentColor="amber"
        change={15.0}
        subtext="Reported in last 24 hours"
      />
      <MetricCard
        label="High Priority"
        value={highPriority}
        icon={AlertTriangle}
        iconClassName="h-5 w-5 text-red-500"
        valueClassName="text-red-500 dark:text-red-400"
        accentColor="red"
        change={-8.0}
        subtext="Need immediate action"
      />
      <MetricCard
        label="Resolved"
        value={resolved}
        icon={CheckCircle2}
        iconClassName="h-5 w-5 text-emerald-500"
        accentColor="emerald"
        change={20.0}
        subtext="Resolved this week"
      />
      <MetricCard
        label="Total Reported"
        value={totalReported}
        icon={Wrench}
        iconClassName="h-5 w-5 text-[#C96442]"
        accentColor="blue"
        subtext="All time across team"
      />
    </div>
  )
}

export { AlertMetrics }
export type { AlertMetricsProps, AlertItem, Severity, AlertStatus, AlertCategory }
