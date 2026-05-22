'use client'

import { AlertMetrics } from './AlertMetrics'
import { AlertCharts } from './AlertCharts'
import { AlertsTable } from './AlertsTable'
import type { AlertItem } from './AlertMetrics'

interface AlertsTabProps {
  alerts?: AlertItem[]
}

function AlertsTab({ alerts = [] }: AlertsTabProps) {
  return (
    <div className="space-y-6">
      <AlertMetrics alerts={alerts} />
      <AlertCharts alerts={alerts} />
      <AlertsTable alerts={alerts} />
    </div>
  )
}

export { AlertsTab }
export type { AlertsTabProps }
