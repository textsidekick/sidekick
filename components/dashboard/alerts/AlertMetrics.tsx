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

const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'ALT-001',
    issue: 'Walk-in cooler temperature above safe threshold',
    worker: 'Maria G.',
    severity: 'high',
    status: 'open',
    date: '2026-03-17',
    category: 'equipment',
  },
  {
    id: 'ALT-002',
    issue: 'Wet floor hazard near dishwashing station',
    worker: 'James T.',
    severity: 'medium',
    status: 'open',
    date: '2026-03-17',
    category: 'safety',
  },
  {
    id: 'ALT-003',
    issue: 'Missing safety signage at emergency exit',
    worker: 'Carlos R.',
    severity: 'low',
    status: 'open',
    date: '2026-03-16',
    category: 'compliance',
  },
  {
    id: 'ALT-004',
    issue: 'Expired ingredients found in dry storage',
    worker: 'Sarah K.',
    severity: 'high',
    status: 'open',
    date: '2026-03-16',
    category: 'compliance',
  },
  {
    id: 'ALT-005',
    issue: 'Minor burn injury during grill operation',
    worker: 'James T.',
    severity: 'high',
    status: 'resolved',
    date: '2026-03-15',
    category: 'health',
  },
  {
    id: 'ALT-006',
    issue: 'Equipment malfunction on commercial mixer',
    worker: 'Maria G.',
    severity: 'medium',
    status: 'resolved',
    date: '2026-03-15',
    category: 'equipment',
  },
  {
    id: 'ALT-007',
    issue: 'Fryer oil not changed on schedule',
    worker: 'Carlos R.',
    severity: 'low',
    status: 'resolved',
    date: '2026-03-16',
    category: 'compliance',
  },
  {
    id: 'ALT-008',
    issue: 'First aid kit supplies depleted',
    worker: 'Sarah K.',
    severity: 'medium',
    status: 'resolved',
    date: '2026-03-15',
    category: 'health',
  },
  {
    id: 'ALT-009',
    issue: 'Broken shelf bracket in walk-in freezer',
    worker: 'Maria G.',
    severity: 'medium',
    status: 'open',
    date: '2026-03-14',
    category: 'equipment',
  },
  {
    id: 'ALT-010',
    issue: 'Worker reported slip near loading dock',
    worker: 'James T.',
    severity: 'high',
    status: 'resolved',
    date: '2026-03-13',
    category: 'safety',
  },
  {
    id: 'ALT-011',
    issue: 'Fire extinguisher inspection overdue',
    worker: 'Carlos R.',
    severity: 'medium',
    status: 'resolved',
    date: '2026-03-12',
    category: 'compliance',
  },
  {
    id: 'ALT-012',
    issue: 'Allergic reaction protocol not followed',
    worker: 'Sarah K.',
    severity: 'high',
    status: 'resolved',
    date: '2026-03-11',
    category: 'health',
  },
]

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
        iconClassName="h-5 w-5 text-blue-500"
        accentColor="blue"
        subtext="All time across team"
      />
    </div>
  )
}

export { AlertMetrics, MOCK_ALERTS }
export type { AlertMetricsProps, AlertItem, Severity, AlertStatus, AlertCategory }
